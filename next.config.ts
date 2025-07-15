import type { NextConfig } from 'next';
import { i18n } from './next-i18next.config'; // ✅ Only use i18n key

const nextConfig: NextConfig = {
  reactStrictMode: true,
  i18n, // ✅ Only spread the i18n field — not the full config!
};

export default nextConfig;



