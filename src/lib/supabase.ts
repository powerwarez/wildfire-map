import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase URL과 익명 키 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 유효성 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL 또는 Anon Key가 설정되지 않았습니다. .env 파일을 확인하세요.');
}

// SupabaseClient 타입의 변수 선언
let supabase: SupabaseClient | null = null;

try {
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase 클라이언트가 성공적으로 초기화되었습니다.');
  } else {
    console.warn('Supabase 연결 정보가 없어 클라이언트를 초기화하지 않았습니다.');
    supabase = null;
  }
} catch (error) {
  console.error('Supabase 클라이언트 초기화 중 오류 발생:', error);
  supabase = null;
}

export { supabase }; 