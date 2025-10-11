
const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  street: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
  },
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});

const UserPreferencesSchema = new mongoose.Schema({
  cuisine: [String],
  dietaryRestrictions: [String],
  deliveryInstructions: String,
  notificationSettings: {
    email: {
      type: Boolean,
      default: true,
    },
    sms: {
      type: Boolean,
      default: true,
    },
    push: {
      type: Boolean,
      default: true,
    },
  },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  addresses: [AddressSchema],
  preferences: UserPreferencesSchema,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', UserSchema);
