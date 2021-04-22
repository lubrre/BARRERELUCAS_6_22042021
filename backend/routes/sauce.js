// import framework Express
const express = require('express');

const router = express.Router();

const stuffCtrl = require('../controllers/sauce');
const auth = require('../middleware/auth');

const multer = require('../middleware/multer-config');

const verifySauce = require('../middleware/verifySauce');

// route createSauce
router.post('/', auth, multer, stuffCtrl.createSauce);

// route modifySauce
router.put('/:id', auth, multer, stuffCtrl.modifySauce);

// route deleteSauce
router.delete('/:id', auth, stuffCtrl.deleteSauce);

// route getOneSauce
router.get('/', auth, stuffCtrl.getAllSauce);

// route getAllSauce
router.get('/:id', auth, stuffCtrl.getOneSauce);

// Route qui permet de liker ou disliker une sauce
router.post('/:id/like', auth, stuffCtrl.likeDislikeSauce);

// export router
module.exports = router;