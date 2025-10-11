
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, userController.getMe);

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, userController.updateProfile);

// @route   POST api/users/addresses
// @desc    Add new address
// @access  Private
router.post('/addresses', auth, userController.addAddress);

// @route   PUT api/users/addresses/:addressId
// @desc    Update address
// @access  Private
router.put('/addresses/:addressId', auth, userController.updateAddress);

// @route   DELETE api/users/addresses/:addressId
// @desc    Delete address
// @access  Private
router.delete('/addresses/:addressId', auth, userController.deleteAddress);

// @route   PUT api/users/addresses/:addressId/default
// @desc    Set default address
// @access  Private
router.put('/addresses/:addressId/default', auth, userController.setDefaultAddress);

// @route   PUT api/users/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', auth, userController.updatePreferences);

module.exports = router;
