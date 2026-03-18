const express = require('express');
const path = require('path');
const logger = require('morgan');
const config = require('./config');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const caseRouter = require('./routes/caseRouter');
const noteRouter = require('./routes/noteRouter');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/cases', caseRouter);
app.use('/cases/:caseId/notes', noteRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: config.env === 'development' ? err.message : 'Internal server error'
  });
});

module.exports = app;
