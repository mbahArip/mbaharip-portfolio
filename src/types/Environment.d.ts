export interface Environment {
  // General
  NEXT_PUBLIC_DOMAIN: string;
  DOMAIN: string;
  NEXT_PUBLIC_ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;

  NEXT_PUBLIC_ENCRYPTION_KEY: string;

  // CDN Storage
  NEXT_PUBLIC_CDN_ENDPOINT: string;
  NEXT_PUBLIC_CDN_SECRET: string; // Only used on admin panel

  // NextAuth
  NEXTAUTH_URL?: string;
  NEXTAUTH_SECRET?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;

  // Stats
  GITHUB_TOKEN: string;
  WAKA_API: string;

  // Recaptcha
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY: string;
  NEXT_PUBLIC_RECAPTCHA_SITE_KEY_DEV?: string;
  RECAPTCHA_SECRET_KEY: string;
  RECAPTCHA_SECRET_KEY_DEV?: string;

  // Database
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_KEY: string; // Anon key
  SUPABASE_KEY: string; // Service key
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Environment {}
  }
}
