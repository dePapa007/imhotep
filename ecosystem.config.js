module.exports = {
  apps: [
    {
      name: 'imfa-app',
      cwd: '/var/www/app.imfa.be/.next/standalone',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3010,
      },
    },
  ],
};
