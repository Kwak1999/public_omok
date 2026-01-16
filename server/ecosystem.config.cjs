// PM2 프로세스 매니저 설정 파일
// 사용법: pm2 start ecosystem.config.cjs
// 참고: PM2는 CommonJS 형식을 사용하므로 .cjs 확장자 사용

module.exports = {
  apps: [{
    name: 'omok-server',
    script: './server.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3001,
      CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
