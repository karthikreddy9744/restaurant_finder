const Restaurant = require('../models/Restaurant');

// Get all restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ date: -1 });
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get nearby restaurants
exports.getNearbyRestaurants = async (req, res) => {
  const { lng, lat, maxDistance } = req.query;

  try {
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseInt(maxDistance) // in meters
        }
      }
    });
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create a restaurant
exports.createRestaurant = async (req, res) => {
  const { name, address, cuisine, location, images } = req.body;

  try {
    const newRestaurant = new Restaurant({
      name,
      address,
      cuisine,
      location,
      images,
      owner: req.user.id
    });

    const restaurant = await newRestaurant.save();
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update a restaurant
exports.updateRestaurant = async (req, res) => {
  const { name, address, cuisine, location, images } = req.body;

  // Build restaurant object
  const restaurantFields = {};
  if (name) restaurantFields.name = name;
  if (address) restaurantFields.address = address;
  if (cuisine) restaurantFields.cuisine = cuisine;
  if (location) restaurantFields.location = location;
  if (images) restaurantFields.images = images;

  try {
    let restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) return res.status(404).json({ msg: 'Restaurant not found' });

    // Check user
    if(restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { $set: restaurantFields },
      { new: true }
    );

    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }

    // Check user
    if(restaurant.owner.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Restaurant removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Restaurant not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Search restaurants
exports.searchRestaurants = async (req, res) => {
  const { q } = req.query;

  try {
    const restaurants = await Restaurant.find({
      name: { $regex: q, $options: 'i' }
    });
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add a review to a restaurant
exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const restaurant = await Restaurant.findById(req.params.id);

    const newReview = {
      user: req.user.id,
      rating: Number(rating),
      comment,
    };

    restaurant.reviews.unshift(newReview);

    await restaurant.save();

    res.json(restaurant.reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};