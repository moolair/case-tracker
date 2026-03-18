const db = require('../db/knex');

const Case = {
  tableName: 'cases',

  async findAll({ status, priority, category, assigned_to } = {}) {
    const query = db(this.tableName).select('cases.*',
      db.raw("users.firstname || ' ' || users.lastname as assigned_name"))
      .leftJoin('users', 'cases.assigned_to', 'users.id')
      .orderBy('cases.created_at', 'desc');

    if (status) query.where('cases.status', status);
    if (priority) query.where('cases.priority', priority);
    if (category) query.where('cases.category', category);
    if (assigned_to) query.where('cases.assigned_to', assigned_to);

    return query;
  },

  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  async create(data) {
    const [caseItem] = await db(this.tableName).insert(data).returning('*');
    return caseItem;
  },

  async update(id, data) {
    data.updated_at = new Date();
    const [caseItem] = await db(this.tableName).where({ id }).update(data).returning('*');
    return caseItem;
  },

  async delete(id) {
    return db(this.tableName).where({ id }).del();
  }
};

module.exports = Case;
