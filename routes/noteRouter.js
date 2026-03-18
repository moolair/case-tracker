const express = require('express');
const router = express.Router({ mergeParams: true }); // :caseId 접근 위해
const Note = require('../models/Note');
const Case = require('../models/Case');
const authenticate = require('../authenticate');

// GET /cases/:caseId/notes
router.get('/', authenticate.verifyUser, async (req, res, next) => {
  try {
    const caseItem = await Case.findById(req.params.caseId);
    if (!caseItem) {
      return res.status(404).json({ error: 'Case not found' });
    }
    const notes = await Note.findByCaseId(req.params.caseId);
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// POST /cases/:caseId/notes
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
    res.status(201).json(note);
  } catch (err) {
    next(err);
  }
});

// PUT /cases/:caseId/notes/:noteId
router.put('/:noteId', authenticate.verifyUser, async (req, res, next) => {
  try {
    const note = await Note.update(req.params.noteId, req.body.content);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    next(err);
  }
});

// DELETE /cases/:caseId/notes/:noteId
router.delete('/:noteId', authenticate.verifyUser, async (req, res, next) => {
  try {
    const deleted = await Note.delete(req.params.noteId);
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
