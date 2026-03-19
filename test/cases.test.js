const { app, expect, chai, resetDB, getToken, seedCases } = require('./setup');

describe('Cases API', () => {
  let users, cases, adminToken, investigatorToken, viewerToken;

  before(async () => {
    users = await resetDB();
    cases = await seedCases(users.admin.id, users.investigator.id);
    adminToken = getToken(users.admin);
    investigatorToken = getToken(users.investigator);
    viewerToken = getToken(users.viewer);
  });

  describe('GET /cases', () => {
    // 1. 인증된 유저 — 전체 케이스 조회
    it('should return all cases for authenticated user', async () => {
      const res = await chai.request(app)
        .get('/cases')
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(2);
    });

    // 2. 필터 — status로 조회
    it('should filter cases by status', async () => {
      const res = await chai.request(app)
        .get('/cases?status=open')
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(200);
      res.body.forEach(c => {
        expect(c.status).to.equal('open');
      });
    });

    // 3. 필터 — priority로 조회
    it('should filter cases by priority', async () => {
      const res = await chai.request(app)
        .get('/cases?priority=critical')
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(200);
      res.body.forEach(c => {
        expect(c.priority).to.equal('critical');
      });
    });

    // 4. 인증 없이 접근 거부
    it('should reject unauthenticated request', async () => {
      const res = await chai.request(app)
        .get('/cases');

      expect(res).to.have.status(401);
    });
  });

  describe('GET /cases/:id', () => {
    // 5. 단건 조회 성공
    it('should return a single case by ID', async () => {
      const res = await chai.request(app)
        .get(`/cases/${cases.case1.id}`)
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.title).to.equal('Test fraud case');
      expect(res.body.priority).to.equal('high');
    });
  });

  describe('POST /cases', () => {
    // 6. 새 케이스 생성
    it('should create a new case', async () => {
      const res = await chai.request(app)
        .post('/cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'New security incident',
          description: 'Unauthorized access detected.',
          priority: 'high',
          category: 'security'
        });

      expect(res).to.have.status(201);
      expect(res.body.title).to.equal('New security incident');
      expect(res.body.status).to.equal('open');
      expect(res.body.created_by).to.equal(users.admin.id);
    });
  });

  describe('PUT /cases/:id', () => {
    // 7. 케이스 상태 업데이트
    it('should update case status', async () => {
      const res = await chai.request(app)
        .put(`/cases/${cases.case1.id}`)
        .set('Authorization', `Bearer ${investigatorToken}`)
        .send({ status: 'in_progress' });

      expect(res).to.have.status(200);
      expect(res.body.status).to.equal('in_progress');
    });
  });

  describe('DELETE /cases/:id', () => {
    // 8. admin만 삭제 가능
    it('should allow admin to delete a case', async () => {
      // 삭제용 케이스 하나 생성
      const createRes = await chai.request(app)
        .post('/cases')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'To be deleted',
          description: 'This case will be deleted.',
          priority: 'low',
          category: 'other'
        });

      const caseId = createRes.body.id;

      const res = await chai.request(app)
        .delete(`/cases/${caseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;

      // 삭제 확인
      const getRes = await chai.request(app)
        .get(`/cases/${caseId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(getRes).to.have.status(404);
    });
  });
});
