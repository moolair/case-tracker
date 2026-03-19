const { app, expect, chai, resetDB, getToken, seedCases, seedNotes } = require('./setup');

describe('Notes API', () => {
  let users, cases, notes, adminToken, investigatorToken;

  before(async () => {
    users = await resetDB();
    cases = await seedCases(users.admin.id, users.investigator.id);
    notes = await seedNotes(cases.case1.id, users.investigator.id);
    adminToken = getToken(users.admin);
    investigatorToken = getToken(users.investigator);
  });

  describe('GET /cases/:caseId/notes', () => {
    // 1. 케이스별 노트 조회
    it('should return notes for a case', async () => {
      const res = await chai.request(app)
        .get(`/cases/${cases.case1.id}/notes`)
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(200);
      expect(res.body).to.be.an('array');
      expect(res.body.length).to.be.at.least(1);
      expect(res.body[0]).to.have.property('content');
      expect(res.body[0]).to.have.property('author_name');
    });

    // 2. 존재하지 않는 케이스 → 404
    it('should return 404 for non-existent case', async () => {
      const res = await chai.request(app)
        .get('/cases/99999/notes')
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(404);
    });
  });

  describe('POST /cases/:caseId/notes', () => {
    // 3. 노트 추가
    it('should add a note to a case', async () => {
      const res = await chai.request(app)
        .post(`/cases/${cases.case1.id}/notes`)
        .set('Authorization', `Bearer ${investigatorToken}`)
        .send({ content: 'Follow-up interview completed with witness.' });

      expect(res).to.have.status(201);
      expect(res.body.content).to.equal('Follow-up interview completed with witness.');
      expect(res.body.case_id).to.equal(cases.case1.id);
      expect(res.body.author_id).to.equal(users.investigator.id);
    });
  });

  describe('PUT /cases/:caseId/notes/:noteId', () => {
    // 4. 노트 수정
    it('should update a note', async () => {
      const res = await chai.request(app)
        .put(`/cases/${cases.case1.id}/notes/${notes.note1.id}`)
        .set('Authorization', `Bearer ${investigatorToken}`)
        .send({ content: 'Updated: Investigation note with new findings.' });

      expect(res).to.have.status(200);
      expect(res.body.content).to.equal('Updated: Investigation note with new findings.');
    });
  });

  describe('DELETE /cases/:caseId/notes/:noteId', () => {
    // 5. 노트 삭제
    it('should delete a note', async () => {
      // 삭제용 노트 생성
      const createRes = await chai.request(app)
        .post(`/cases/${cases.case1.id}/notes`)
        .set('Authorization', `Bearer ${investigatorToken}`)
        .send({ content: 'Note to be deleted.' });

      const noteId = createRes.body.id;

      const res = await chai.request(app)
        .delete(`/cases/${cases.case1.id}/notes/${noteId}`)
        .set('Authorization', `Bearer ${investigatorToken}`);

      expect(res).to.have.status(200);
      expect(res.body.success).to.be.true;
    });
  });
});
