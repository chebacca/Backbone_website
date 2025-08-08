module.exports = {
  apps: [
    {
      name: 'licensing-api',
      cwd: __dirname,
      script: 'dist/index.js',
      node_args: '--enable-source-maps',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3003
      },
      env_production: {
        NODE_ENV: 'production'
      },
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      time: true
    }
  ]
};
