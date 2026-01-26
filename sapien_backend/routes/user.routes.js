const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const {authMiddleware} = require('../middlewares/authMiddleware');

router.post('/create', userController.createUser);
router.get('/user', authMiddleware,userController.getUser);
router.get('/usernames', authMiddleware,userController.getUserNames);
router.get('/userbyemailorphone', authMiddleware,userController.getUserByWorkEmailOrPhoneNumber);
router.put('/user', authMiddleware,userController.updateUser);

module.exports = router;
