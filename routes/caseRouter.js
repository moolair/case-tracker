const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const authenticate = require('../authenticate');

// GET /cases — 전체 조회 (필터 지원)
router.get('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { status, priority, category, assigned_to } = req.query;
    const cases = await Case.findAll({ status, priority, category, assigned_to });
    res.json(cases);
  } catch (err) {
    next(err);
  }
});

// GET /cases/:id — 단건 조회
router.get('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const caseItem = await Case.findById(req.params.id);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseItem);
  } catch (err) {
    next(err);
  }
});

// POST /cases — 새 케이스 생성
router.post('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { title, description, priority, category, assigned_to } = req.body;
    const caseItem = await Case.create({
      title, description, priority, category, assigned_to,
      created_by: req.user.id
    });
    res.status(201).json(caseItem);
  } catch (err) {
    next(err);
  }
});

// PUT /cases/:id — 케이스 수정
router.put('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { title, description, status, priority, category, assigned_to } = req.body;
    const caseItem = await Case.update(req.params.id, {
      title, description, status, priority, category, assigned_to
    });
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseItem);
  } catch (err) {
    next(err);
  }
});

// DELETE /cases/:id — 케이스 삭제 (admin only)
router.delete('/:id', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
  try {
    const deleted = await Case.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
