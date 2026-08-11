// Personal/student-info fields on `profiles` (name, email, phone, student id,
// university) — see useProfile for the diet/allergy fields of the same row.
import { reactive, ref } from 'vue';
import { supabase } from '@/services/supabase';

export interface AccountDetails {
  name: string;
  email: string;
  phone: string;
  studentId: string;
  universityId: number | null;
  memberSince: string;
}

const account = reactive<AccountDetails>({
  name: '',
  email: '',
  phone: '',
  studentId: '',
  universityId: null,
  memberSince: '',
});

const loaded = ref(false);

/** Formats a `profiles.member_since` timestamp as "Aug 2026" for display. */
function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

/** Loads the signed-in user's account fields from `profiles` into the
 * module-level `account` state. No-ops if nobody is signed in. */
async function fetchAccount() {
  // Step 1: resolve the current session — nothing to load without one.
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  // Step 2: fetch only the columns this composable owns (see useProfile for
  // the diet/allergy columns of the same row).
  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, telephone, student_id, university_id, member_since')
    .eq('id', userData.user.id)
    .single();
  if (error || !data) return;

  // Step 3: populate reactive state — first_name/last_name are stored
  // separately but the UI works with a single "name" field.
  account.name = `${data.first_name} ${data.last_name}`.trim();
  account.email = data.email;
  account.phone = data.telephone ?? '';
  account.studentId = data.student_id ?? '';
  account.universityId = data.university_id;
  account.memberSince = formatMemberSince(data.member_since);
  loaded.value = true;
}

/** Persists a partial edit from the Account Details form back to `profiles`. */
async function updateAccount(
  patch: Partial<Pick<AccountDetails, 'name' | 'email' | 'phone' | 'studentId' | 'universityId'>>
) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  // Step 1: split the single "name" field back into first/last for storage,
  // falling back to the current value for anything not being patched.
  const nextName = (patch.name ?? account.name).trim();
  const [first_name, ...rest] = nextName.split(' ');
  const nextStudentId = (patch.studentId ?? account.studentId).trim();

  // Step 2: write the update. Empty student id is stored as null rather
  // than an empty string.
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name,
      last_name: rest.join(' '),
      email: patch.email ?? account.email,
      telephone: patch.phone ?? account.phone,
      student_id: nextStudentId || null,
      university_id: patch.universityId !== undefined ? patch.universityId : account.universityId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userData.user.id);
  if (error) throw error;

  // Step 3: only reflect the patched fields locally — updateAccount doesn't
  // return the full row, so anything not in the patch stays as-is.
  Object.assign(account, patch);
}

export function useAccount() {
  if (!loaded.value) fetchAccount();
  return { account, updateAccount, fetchAccount };
}
