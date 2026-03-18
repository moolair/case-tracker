exports.up = function(knex) {
  return knex.schema.createTable('notes', (table) => {
    table.increments('id').primary();
    table.integer('case_id').unsigned().notNullable().references('id').inTable('cases').onDelete('CASCADE');
    table.integer('author_id').unsigned().notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('notes');
};
