const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const authenticate = require('../authenticate');
const { cacheGet, cacheInvalidate, cacheDel } = require('../db/redis');

// GET /cases — 전체 조회 (캐시 적용)
router.get('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { status, priority, category, assigned_to } = req.query;

    // 쿼리 파라미터 기반 캐시 키 생성
    const cacheKey = `cases:list:${status || 'all'}:${priority || 'all'}:${category || 'all'}:${assigned_to || 'all'}`;

    const cases = await cacheGet(cacheKey, () => {
      return Case.findAll({ status, priority, category, assigned_to });
    }, 120); // 2분 TTL (목록은 자주 변함)

    res.json(cases);
  } catch (err) {
    next(err);
  }
});

// GET /cases/:id — 단건 조회 (캐시 적용)
router.get('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const cacheKey = `cases:${req.params.id}`;

    const caseItem = await cacheGet(cacheKey, () => {
      return Case.findById(req.params.id);
    }, 300); // 5분 TTL

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    res.json(caseItem);
  } catch (err) {
    next(err);
  }
});

// POST /cases — 새 케이스 생성 + 목록 캐시 무효화
router.post('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { title, description, priority, category, assigned_to } = req.body;
    const caseItem = await Case.create({
      title, description, priority, category, assigned_to,
      created_by: req.user.id
    });

    // 목록 캐시 무효화 (새 케이스가 추가됐으니)
    await cacheInvalidate('cases:list:*');

    res.status(201).json(caseItem);
  } catch (err) {
    next(err);
  }
});

// PUT /cases/:id — 케이스 수정 + 캐시 무효화
router.put('/:id', authenticate.verifyUser, async (req, res, next) => {
  try {
    const { title, description, status, priority, category, assigned_to } = req.body;
    const caseItem = await Case.update(req.params.id, {
      title, description, status, priority, category, assigned_to
    });

    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // 단건 + 목록 캐시 둘 다 무효화
    await cacheDel(`cases:${req.params.id}`);
    await cacheInvalidate('cases:list:*');

    res.json(caseItem);
  } catch (err) {
    next(err);
  }
});

// DELETE /cases/:id — 케이스 삭제 + 캐시 무효화
router.delete('/:id', authenticate.verifyUser, authenticate.verifyAdmin, async (req, res, next) => {
  try {
    const deleted = await Case.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Case not found' });
    }

    await cacheDel(`cases:${req.params.id}`);
    await cacheInvalidate('cases:list:*');

    res.json({ success: true, message: 'Case deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
