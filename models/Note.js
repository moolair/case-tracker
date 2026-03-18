const db = require('../db/knex');

const Note = {
  tableName: 'notes',

  async findByCaseId(case_id) {
    return db(this.tableName)
      .where({ case_id })
      .join('users', 'notes.author_id', 'users.id')
      .select('notes.*', 'users.username as author_name',
        db.raw("users.firstname || ' ' || users.lastname as author_fullname"))
      .orderBy('notes.created_at', 'asc');
  },

  async create({ case_id, author_id, content }) {
    const [note] = await db(this.tableName)
      .insert({ case_id, author_id, content })
      .returning('*');
    return note;
  },

  async update(id, content) {
    const [note] = await db(this.tableName)
      .where({ id })
      .update({ content, updated_at: new Date() })
      .returning('*');
    return note;
  },

  async delete(id) {
    return db(this.tableName).where({ id }).del();
  }
};

module.exports = Note;
