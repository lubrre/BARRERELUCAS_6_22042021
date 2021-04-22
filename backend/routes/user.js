// import framework Express
const express = require('express');

// appel router avec methode mise à disposition par Express
const router = express.Router();

// import middleware verifyPassword
const verifyPassword = require('../middleware/verifyPassword');

// import middleware verifyEmail
const verifyEmail = require('../middleware/verifyEmail');

// import controller
const userCtrl = require('../controllers/user');

// route inscription et connexion de l'api
router.post('/signup', verifyPassword, verifyEmail, userCtrl.signup);
router.post('/login', verifyEmail, userCtrl.login);


module.exports = router;