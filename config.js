require('dotenv').config();

module.exports = {
  database: process.env.DATABASE_URL || 'postgresql://localhost:5432/case_tracker_dev',
  secretKey: process.env.JWT_SECRET || 'default-dev-secret',
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};
