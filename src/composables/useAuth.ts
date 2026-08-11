// Session/auth state — sign up, sign in, sign out, and the current Supabase
// user, hydrated from getSession()/onAuthStateChange at startup.
import { computed, ref } from 'vue';
import type { AuthError as SupabaseAuthError, User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';

/**
 * Wraps Supabase's AuthError so views can keep the same
 * `err instanceof AuthError` / `err.firstErrorMessage()` shape they used
 * against the old Laravel ApiRequestError.
 */
export class AuthError extends Error {
  code?: string;

  constructor(error: SupabaseAuthError | Error) {
    super(error.message);
    this.code = 'code' in error ? (error as SupabaseAuthError).code : undefined;
  }

  firstErrorMessage(): string {
    return this.message;
  }
}

const currentUser = ref<User | null>(null);
const sessionLoaded = ref(false);

// Keeps currentUser in sync with every subsequent auth event (token
// refresh, sign-in in another tab, sign-out) after the initial init() below.
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser.value = session?.user ?? null;
});

let resolveAuthReady: () => void;
/** Resolves once the initial session check completes — the router guard
 * awaits this so a cold start doesn't briefly misjudge an already-logged-in
 * user as unauthenticated and bounce them to /login. */
export const authReady = new Promise<void>((resolve) => {
  resolveAuthReady = resolve;
});

/** Runs once at module load: reads whatever session Capacitor Preferences
 * has persisted from a previous app launch, then unblocks authReady. */
async function init() {
  if (sessionLoaded.value) return;
  sessionLoaded.value = true;
  const { data } = await supabase.auth.getSession();
  currentUser.value = data.session?.user ?? null;
  resolveAuthReady();
}
init();

const isAuthenticated = computed(() => !!currentUser.value);

interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  telephone?: string;
  universityId: number;
}

interface RegisterResult {
  user: User;
  /** false when the project requires email confirmation before a session is issued. */
  signedIn: boolean;
}

/** Creates the auth.users row via Supabase Auth. The profiles row (and
 * default wallet/cash payment methods) are created server-side by the
 * handle_new_user() trigger from the metadata passed in `options.data` —
 * this function never inserts into `profiles` directly. */
async function register(payload: RegisterPayload): Promise<RegisterResult> {
  // Step 1: client-side validation that doesn't need a round trip.
  if (payload.password !== payload.passwordConfirmation) {
    throw new AuthError(new Error('Passwords do not match.'));
  }

  // Step 2: sign up — profile fields ride along as user metadata for the
  // trigger to pick up.
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        first_name: payload.firstName,
        last_name: payload.lastName,
        telephone: payload.telephone,
        university_id: payload.universityId,
      },
    },
  });
  if (error) throw new AuthError(error);
  if (!data.user) throw new AuthError(new Error('Registration failed. Please try again.'));

  // Step 3: signedIn is false when the project requires email confirmation
  // — the caller uses this to decide whether to route straight into the
  // app or to a "check your email" screen.
  return { user: data.user, signedIn: !!data.session };
}

interface LoginPayload {
  email: string;
  password: string;
}

async function login(payload: LoginPayload): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword(payload);
  if (error) throw new AuthError(error);
  return data.user;
}

/** Signs out; onAuthStateChange above then clears currentUser once
 * Supabase fires the resulting SIGNED_OUT event. */
async function logout() {
  await supabase.auth.signOut();
}

export function useAuth() {
  return { currentUser, isAuthenticated, register, login, logout };
}
