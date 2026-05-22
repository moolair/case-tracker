const db = require('../db/knex');
const bcrypt = require('bcryptjs');

const User = {
  tableName: 'users',

  async findById(id) {
    return db(this.tableName).where({ id }).first();
  },

  async findByUsername(username) {
    return db(this.tableName).where({ username }).first();
  },

  async create({ username, email, password, firstname, lastname, role }) {
    const password_hash = await bcrypt.hash(password, 10);
    const [user] = await db(this.tableName)
      .insert({ username, email, password_hash, firstname, lastname, role })
      .returning('*');
    return user;
  },

  async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  },

  async findAll() {
    return db(this.tableName).select('id', 'username', 'email', 'firstname', 'lastname', 'role', 'created_at');
  }
};

module.exports = User;
