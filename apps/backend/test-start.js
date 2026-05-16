process.env.DATABASE_URL = 'postgresql://postgres:root@localhost:5432/convertforge';
const app = require('./dist/main');
setTimeout(() => {
  console.log('Backend started successfully');
  process.exit(0);
}, 6000);
