
const nextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
       {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  serverExternalPackages: [
    '@genkit-ai/ai-platform',
    '@genkit-ai/googleai',
    '@google-cloud/functions-framework',
    'firebase-admin',
    'gaxios',
    'google-auth-library',
    'google-gax',
    'json-schema',
    'long',
    'protobufjs',
    'zod',
  ],
};

export default nextConfig;
