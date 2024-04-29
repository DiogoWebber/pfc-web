// routes/transactionRoutes.js
const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/api/transactions', transactionController.addTransaction);
router.get('/api/transactions', transactionController.getTransactions);
router.delete('/api/transactions/:id', transactionController.deleteTransaction);

module.exports = router;
