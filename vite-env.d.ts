/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FORMSPREE_ENDPOINT?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_USE_HASH_ROUTER?: 'true' | 'false';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
