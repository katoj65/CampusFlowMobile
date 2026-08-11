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

function formatMemberSince(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
}

async function fetchAccount() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data, error } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, telephone, student_id, university_id, member_since')
    .eq('id', userData.user.id)
    .single();
  if (error || !data) return;

  account.name = `${data.first_name} ${data.last_name}`.trim();
  account.email = data.email;
  account.phone = data.telephone ?? '';
  account.studentId = data.student_id ?? '';
  account.universityId = data.university_id;
  account.memberSince = formatMemberSince(data.member_since);
  loaded.value = true;
}

async function updateAccount(
  patch: Partial<Pick<AccountDetails, 'name' | 'email' | 'phone' | 'studentId' | 'universityId'>>
) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const nextName = (patch.name ?? account.name).trim();
  const [first_name, ...rest] = nextName.split(' ');
  const nextStudentId = (patch.studentId ?? account.studentId).trim();

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

  Object.assign(account, patch);
}

export function useAccount() {
  if (!loaded.value) fetchAccount();
  return { account, updateAccount, fetchAccount };
}
