// userRoutes.js
const express = require('express');
const path = require('path');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/login', userController.login);
router.get('/create-user', userController.createUserForm);
router.post('/create-user', userController.createUser);
router.get('/user-created', userController.userCreated);
router.get('/users', userController.getAllUsers);
router.put('/update-level/:userId', userController.updateUserLevel);

module.exports = router;
