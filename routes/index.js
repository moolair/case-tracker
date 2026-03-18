var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({
    message: 'Case Tracker API',
    version: '2.0.0',
    endpoints: {
      auth: { signup: 'POST /users/signup', login: 'POST /users/login' },
      cases: 'GET|POST /cases, GET|PUT|DELETE /cases/:id',
      notes: 'GET|POST /cases/:caseId/notes, PUT|DELETE /cases/:caseId/notes/:noteId'
    }
  });
});

module.exports = router;
