import type { NextConfig } from "next";

// Publish the Firebase web config to the client bundle at build time. It is
// public by design (Firestore rules are the access control), and inlining it
// removes a serverless round trip that blocked every read behind a cold start.
// Accepts either naming so it works with the vars already set on Netlify.
const firebaseEnv = Object.fromEntries(
  Object.entries({
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
  }).map(([key, fallback]) => [key, process.env[key] ?? fallback ?? ""])
);

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  env: firebaseEnv,
};

export default nextConfig;
