const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportroom.controller');

const {authMiddleware} = require('../middlewares/authMiddleware');
// User routes
router.post('/', authMiddleware, reportController.createReport);
router.get('/', authMiddleware, reportController.getAllReports);
router.get('/:id', authMiddleware, reportController.getReport);

router.delete('/:id', 
  authMiddleware, 
  reportController.deleteReport
);

module.exports = router;