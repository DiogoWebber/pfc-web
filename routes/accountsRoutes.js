// routes/accountsRoutes.js
const express = require('express');
const accountsController = require('../controllers/accountsController');

const router = express.Router();

router.post('/', accountsController.addAccounts);
router.get('/', accountsController.getAccounts);
router.delete('/:id', accountsController.deleteAccount);

module.exports = router;
