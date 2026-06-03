module.exports = {
  apps: [
    {
      name: 'imfa-app',
      cwd: '/var/www/app.imfa.be/.next/standalone',
      script: 'server.js',
      env_file: '/var/www/app.imfa.be/.env',
      env: {
        NODE_ENV: 'production',
        PORT: 3010,
      },
    },
  ],
};
