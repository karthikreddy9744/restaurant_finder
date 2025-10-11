const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET api/restaurants/nearby
// @desc    Get nearby restaurants
// @access  Public
router.get('/nearby', restaurantController.getNearbyRestaurants);


// @route   POST api/restaurants/upload
// @desc    Upload images for a restaurant
// @access  Private
router.post('/upload', auth, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.status(400).json({ msg: err });
    } else {
      if (req.files == undefined) {
        res.status(400).json({ msg: 'Error: No File Selected!' });
      } else {
        const filePaths = req.files.map(file => file.path);
        res.json({ 
          msg: 'Files Uploaded!',
          files: filePaths
        });
      }
    }
  });
});

// @route   GET api/restaurants
// @desc    Get all restaurants
// @access  Public
router.get('/', restaurantController.getRestaurants);

// @route   GET api/restaurants/search
// @desc    Search restaurants
// @access  Public
router.get('/search', restaurantController.searchRestaurants);

// @route   GET api/restaurants/:id
// @desc    Get single restaurant
// @access  Public
router.get('/:id', restaurantController.getRestaurantById);

// @route   POST api/restaurants
// @desc    Create a restaurant
// @access  Private
router.post('/', auth, restaurantController.createRestaurant);

// @route   PUT api/restaurants/:id
// @desc    Update a restaurant
// @access  Private
router.put('/:id', auth, restaurantController.updateRestaurant);

// @route   DELETE api/restaurants/:id
// @desc    Delete a restaurant
// @access  Private
router.delete('/:id', auth, restaurantController.deleteRestaurant);

// @route   POST api/restaurants/:id/reviews
// @desc    Add a review to a restaurant
// @access  Private
router.post('/:id/reviews', auth, restaurantController.addReview);

module.exports = router;