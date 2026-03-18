exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('username').notNullable().unique();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.string('firstname').defaultTo('');
    table.string('lastname').defaultTo('');
    table.enum('role', ['admin', 'investigator', 'viewer']).defaultTo('viewer');
    table.timestamps(true, true); // created_at, updated_at
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
