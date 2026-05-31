const express = require('express');
const router = express.Router();
const { recommend, getHistory } = require('../controllers/ai.controller');

router.post('/recommend', recommend);
router.get('/history/:sessionId', getHistory);

module.exports = router;
