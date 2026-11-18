// Supabase Auth returns English messages; show the common ones in Korean.
const MESSAGES: Record<string, string> = {
  "Invalid login credentials": "이메일 또는 비밀번호가 맞지 않습니다.",
  "User already registered": "이미 가입한 이메일입니다. 로그인해 주세요.",
};

export function authErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) return "문제가 생겼습니다. 다시 시도해 주세요.";
  if (MESSAGES[error.message]) return MESSAGES[error.message];
  if (/Password should be at least/i.test(error.message)) {
    return "비밀번호는 6자 이상이어야 합니다.";
  }
  return error.message;
}
