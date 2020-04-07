const router = require('express').Router();
const { addMessage, sendResume, dowloadResume } = require('../controllers');

router.route('/contacts').post(addMessage);
router.route('/resume').post(sendResume);
router.route('/resume/download').post(dowloadResume);

module.exports = router;
