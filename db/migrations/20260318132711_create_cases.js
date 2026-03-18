exports.up = function(knex) {
  return knex.schema.createTable('cases', (table) => {
    table.increments('id').primary();
    table.string('title').notNullable();
    table.text('description').notNullable();
    table.enum('status', ['open', 'in_progress', 'resolved', 'closed']).defaultTo('open');
    table.enum('priority', ['low', 'medium', 'high', 'critical']).defaultTo('medium');
    table.enum('category', ['fraud', 'harassment', 'discrimination', 'security', 'ethics', 'other']).defaultTo('other');
    table.integer('assigned_to').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.integer('created_by').unsigned().references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('cases');
};
