const express = require('express');
const transactionController = require('../controllers/transactionController');

const router = express.Router();

router.post('/transactions', transactionController.addTransaction);
router.get('/transactions', transactionController.getTransactions);
router.delete('/transactions/:id', transactionController.deleteTransaction);
router.put('/transactions/:id', transactionController.updateTransaction);
module.exports = router;
