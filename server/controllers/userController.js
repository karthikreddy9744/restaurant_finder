
const User = require('../models/User');

// Get current user profile
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, select: '-password' }
    );
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Add new address
exports.addAddress = async (req, res) => {
  try {
    const address = req.body;
    const user = await User.findById(req.user.id);
    
    // If this is the first address, make it default
    if (!user.addresses || user.addresses.length === 0) {
      address.isDefault = true;
    }
    
    user.addresses.push(address);
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update address
exports.updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const addressData = req.body;
    
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }
    
    Object.assign(address, addressData);
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete address
exports.deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user.id);
    const address = user.addresses.id(addressId);
    
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }
    
    const wasDefault = address.isDefault;
    address.remove();
    
    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }
    
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    
    const user = await User.findById(req.user.id);
    
    // Remove default from all addresses
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
    
    // Set new default
    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ msg: 'Address not found' });
    }
    
    address.isDefault = true;
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update preferences
exports.updatePreferences = async (req, res) => {
  try {
    const preferences = req.body;
    
    const user = await User.findById(req.user.id);
    user.preferences = preferences;
    await user.save();
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
