const express = require('express');
const router = express.Router();
const { createUser, toggleStatus, getDistance, getUserListing } = require('../controllers/userController');
const { verifyToken } = require('../middlewares/auth');
const { registerUser } = require('../validators/userValidator');

router.post('/register', async (req, res, next) => {
  const { error } = registerUser.validate(req.body);
  if (error) return res.status(400).json({ status_code: 400, message: error.details[0].message });
  next();
}, createUser);

router.patch('/change-status', verifyToken, toggleStatus);
router.get('/get-distance', verifyToken, getDistance);
router.get('/user-listing', verifyToken, getUserListing);

module.exports = router;
