const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const db = require('../db/knex');
const bcrypt = require('bcryptjs');
const authenticate = require('../authenticate');

chai.use(chaiHttp);
const { expect } = chai;

// 테스트용 유저 데이터
const testUsers = {
  admin: {
    username: 'testadmin',
    email: 'testadmin@test.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'Admin',
    role: 'admin'
  },
  investigator: {
    username: 'testinvestigator',
    email: 'testinv@test.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'Investigator',
    role: 'investigator'
  },
  viewer: {
    username: 'testviewer',
    email: 'testviewer@test.com',
    password: 'password123',
    firstname: 'Test',
    lastname: 'Viewer',
    role: 'viewer'
  }
};

// DB 초기화 — 각 테스트 파일 시작 전에 호출
async function resetDB() {
  await db('notes').del();
  await db('cases').del();
  await db('users').del();

  const hash = await bcrypt.hash('password123', 10);

  const [admin] = await db('users').insert({
    username: testUsers.admin.username,
    email: testUsers.admin.email,
    password_hash: hash,
    firstname: testUsers.admin.firstname,
    lastname: testUsers.admin.lastname,
    role: testUsers.admin.role
  }).returning('*');

  const [investigator] = await db('users').insert({
    username: testUsers.investigator.username,
    email: testUsers.investigator.email,
    password_hash: hash,
    firstname: testUsers.investigator.firstname,
    lastname: testUsers.investigator.lastname,
    role: testUsers.investigator.role
  }).returning('*');

  const [viewer] = await db('users').insert({
    username: testUsers.viewer.username,
    email: testUsers.viewer.email,
    password_hash: hash,
    firstname: testUsers.viewer.firstname,
    lastname: testUsers.viewer.lastname,
    role: testUsers.viewer.role
  }).returning('*');

  return { admin, investigator, viewer };
}

// 토큰 생성 헬퍼
function getToken(user) {
  return authenticate.getToken({ id: user.id, username: user.username, role: user.role });
}

// 테스트용 케이스 삽입
async function seedCases(adminId, investigatorId) {
  const [case1] = await db('cases').insert({
    title: 'Test fraud case',
    description: 'Suspicious expense reports detected.',
    status: 'open',
    priority: 'high',
    category: 'fraud',
    assigned_to: investigatorId,
    created_by: adminId
  }).returning('*');

  const [case2] = await db('cases').insert({
    title: 'Test harassment case',
    description: 'Anonymous complaint received.',
    status: 'in_progress',
    priority: 'critical',
    category: 'harassment',
    assigned_to: investigatorId,
    created_by: adminId
  }).returning('*');

  return { case1, case2 };
}

// 테스트용 노트 삽입
async function seedNotes(caseId, authorId) {
  const [note1] = await db('notes').insert({
    case_id: caseId,
    author_id: authorId,
    content: 'Initial investigation note.'
  }).returning('*');

  return { note1 };
}

module.exports = {
  app,
  expect,
  chai,
  db,
  testUsers,
  resetDB,
  getToken,
  seedCases,
  seedNotes
};
