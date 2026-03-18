const bcrypt = require('bcryptjs');

exports.seed = async function(knex) {
  await knex('notes').del();
  await knex('cases').del();
  await knex('users').del();

  const hash = await bcrypt.hash('password123', 10);

  await knex('users').insert([
    { id: 1, username: 'admin', email: 'admin@casetracker.io', password_hash: hash, firstname: 'Admin', lastname: 'User', role: 'admin' },
    { id: 2, username: 'investigator1', email: 'inv1@casetracker.io', password_hash: hash, firstname: 'Jane', lastname: 'Smith', role: 'investigator' },
    { id: 3, username: 'viewer1', email: 'viewer1@casetracker.io', password_hash: hash, firstname: 'John', lastname: 'Doe', role: 'viewer' },
  ]);

  // Reset auto-increment sequence
  await knex.raw("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))");
};
