require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || 'postgresql://localhost:5432/case_tracker_dev',
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds' }
  },
  test: {
    client: 'pg',
    connection: process.env.TEST_DATABASE_URL || 'postgresql://localhost:5432/case_tracker_test',
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds' }
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: { min: 2, max: 10 },
    migrations: { directory: './db/migrations' },
    seeds: { directory: './db/seeds' }
  }
};
