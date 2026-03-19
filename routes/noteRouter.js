const express = require('express');
const router = express.Router({ mergeParams: true });
const Note = require('../models/Note');
const Case = require('../models/Case');
const authenticate = require('../authenticate');
const { cacheGet, cacheDel } = require('../db/redis');

// GET /cases/:caseId/notes (캐시 적용)
router.get('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const cacheKey = `notes:case:${req.params.caseId}`;
    const notes = await cacheGet(cacheKey, () => {
      return Note.findByCaseId(req.params.caseId);
    }, 180); // 3분 TTL

    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// POST /cases/:caseId/notes + 캐시 무효화
router.post('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const note = await Note.create({
      case_id: req.params.caseId,
      author_id: req.user.id,
      content: req.body.content
    });

    await cacheDel(`notes:case:${req.params.caseId}`);

    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /cases/:caseId/notes/:noteId + 캐시 무효화
router.put('/:noteId', authenticate.verifyUser, async (req, res, next) => {
  try {
    const note = await Note.update(req.params.noteId, req.body.content);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await cacheDel(`notes:case:${req.params.caseId}`);

    res.json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE /cases/:caseId/notes/:noteId + 캐시 무효화
router.delete('/:noteId', authenticate.verifyUser, async (req, res, next) => {
  try {
    const deleted = await Note.delete(req.params.noteId);
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }

    await cacheDel(`notes:case:${req.params.caseId}`);

    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
