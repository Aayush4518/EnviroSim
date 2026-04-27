/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  rewrites: async () => {
    return {
      beforeFiles: [
        {
          source: '/simulate',
          destination: 'http://localhost:6969/simulate',
        },
        {
          source: '/health',
          destination: 'http://localhost:6969/health',
        },
      ],
    };
  },
};

module.exports = nextConfig;