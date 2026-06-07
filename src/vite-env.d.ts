/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_NEPTUN_CODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
