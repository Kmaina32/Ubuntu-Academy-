
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
  webpack: (config, { isServer }) => {
    // This rule prevents the processing of .ico files by the default loader,
    // which is causing the build error with the invalid favicon.ico.
    config.module.rules.push({
      test: /\.ico$/,
      use: [
        {
          loader: 'null-loader',
        },
      ],
    });

    return config;
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
    'axios'
  ],
};

export default nextConfig;
