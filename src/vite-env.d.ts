/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
  // 추가 환경변수들을 여기에 정의할 수 있습니다
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
