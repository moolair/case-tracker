const { app, expect, chai, resetDB, getToken, testUsers } = require('./setup');

describe('Auth API', () => {
  let users;

  before(async () => {
    users = await resetDB();
  });

  // 1. 회원가입 성공
  describe('POST /users/signup', () => {
    it('should create a new user and return a token', async () => {
      const res = await chai.request(app)
        .post('/users/signup')
        .send({
          username: 'newuser',
          email: 'newuser@test.com',
          password: 'password123',
          firstname: 'New',
          lastname: 'User'
        });

      expect(res).to.have.status(201);
      expect(res.body.success).to.be.true;
      expect(res.body.token).to.be.a('string');
      expect(res.body.user).to.have.property('username', 'newuser');
      expect(res.body.user).to.have.property('role', 'viewer');
    });

    // 2. 중복 유저네임 거부
    it('should reject duplicate username', async () => {
      const res = await chai.request(app)
        .post('/users/signup')
        .send({
          username: testUsers.admin.username,
          email: 'different@test.com',
          password: 'password123',
          firstname: 'Dup',
          lastname: 'User'
        });

      expect(res).to.have.status(409);
      expect(res.body.error).to.include('already exists');
    });
  });

  describe('POST /users/login', () => {
    // 3. 로그인 성공
    it('should login with valid credentials and return a token', async () => {
      const res = await chai.request(app)
        .post('/users/login')
        .send({
          username: testUsers.admin.username,
          password: testUsers.admin.password
        });

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
      expect(res.body.token).to.be.a('string');
      expect(res.body.user.role).to.equal('admin');
    });

    // 4. 잘못된 비밀번호 거부
    it('should reject invalid password', async () => {
      const res = await chai.request(app)
        .post('/users/login')
        .send({
          username: testUsers.admin.username,
          password: 'wrongpassword'
        });

      expect(res).to.have.status(401);
      expect(res.body.error).to.include('Invalid');
    });

    // 5. 존재하지 않는 유저 거부
    it('should reject non-existent user', async () => {
      const res = await chai.request(app)
        .post('/users/login')
        .send({
          username: 'ghostuser',
          password: 'password123'
        });

      expect(res).to.have.status(401);
    });
  });
});
