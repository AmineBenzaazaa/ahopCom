const express = require('express');
const router = express.Router();
const meetingCtrl = require('./meeting');
const auth = require('../../middelwares/auth');

// Secure all routes
router.use(auth);

// Meeting endpoints
router.get('/', meetingCtrl.index);
router.get('/view/:id', meetingCtrl.view);
router.post('/', meetingCtrl.add);
router.delete('/delete/:id', meetingCtrl.deleteData);
router.post('/deleteMany', meetingCtrl.deleteMany);

module.exports = router;
