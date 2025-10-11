
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Restaurant = require('./models/Restaurant');

const cafes = [
  {
    name: 'PS Cheese Cafe',
    address: 'Road No. 10, Guttala Begumpet, Kavuri Hills, Jubilee Hills, Hyderabad, Telangana 500033',
    cuisine: 'Cafe',
    location: {
      type: 'Point',
      coordinates: [78.397324, 17.441384],
    },
    menu: [
      { name: 'Cappuccino', description: 'Hot milk coffee.', price: 192, category: 'Beverages' },
      { name: 'Mexican Chicken And Cheese Sandwich', description: 'A delicious sandwich with chicken and cheese.', price: 435, category: 'Sandwiches' },
      { name: 'Pesto Cheese Sauce Pasta', description: 'Pasta in a creamy pesto cheese sauce.', price: 598, category: 'Pasta' },
    ],
  },
  {
    name: 'Mirosa Cafe & Kitchen',
    address: '3-6-288/1/A, Hyderguda, Himayath Nagar, Hyderabad, Telangana 500029',
    cuisine: 'Cafe',
    location: {
      type: 'Point',
      coordinates: [78.474838, 17.395436],
    },
    menu: [
        { name: 'Mushroom Bianco', description: 'Creamy mushroom dish.', price: 350, category: 'Appetizers' },
        { name: 'Fish and chips', description: 'Classic fish and chips.', price: 450, category: 'Main Course' },
        { name: 'Hazelnut Cappuccino', description: 'Cappuccino with hazelnut flavor.', price: 250, category: 'Beverages' },
    ],
  },
  {
    name: 'Era Bistro',
    address: '8-2-293/82/A/788, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.4086, 17.4316],
    },
    menu: [
        { name: 'Margherita Pizza', description: 'Classic pizza with tomato and mozzarella.', price: 400, category: 'Pizza' },
        { name: 'Arrabbiata Pasta', description: 'Pasta in a spicy tomato sauce.', price: 380, category: 'Pasta' },
        { name: 'Chicken Tikka', description: 'Tender chicken tikka.', price: 420, category: 'Main Course' },
    ],
  },
  {
    name: 'Sobremesa - Bakehouse Cafe Kitchen',
    address: 'Plot 137, Road No. 10, Jubilee Hills, Hyderabad, Telangana 500033',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.4095, 17.4325],
    },
    menu: [
        { name: 'Babka', description: 'Sweet braided bread.', price: 300, category: 'Bakery' },
        { name: 'Quinoa Salad', description: 'Healthy quinoa salad.', price: 350, category: 'Salads' },
        { name: 'Chicken Rice Bowl', description: 'A hearty bowl of chicken and rice.', price: 450, category: 'Main Course' },
    ],
  },
  {
    name: 'Last House Coffee',
    address: 'H.No. 8-2-293/82/A/796, Road No. 36, Jubilee Hills, Hyderabad, Telangana 500033',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.402, 17.428],
    },
    menu: [
        { name: 'Robusta Coffee', description: 'Strong Robusta coffee.', price: 200, category: 'Beverages' },
        { name: 'Chocolate Cake', description: 'Rich chocolate cake.', price: 250, category: 'Desserts' },
        { name: 'Croissant', description: 'Flaky croissant.', price: 150, category: 'Bakery' },
    ],
  },
  {
    name: 'Coffee Cup',
    address: 'E-89, Above Canara Bank, Sainikpuri, Secunderabad, Telangana 500094',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.549, 17.492],
    },
    menu: [
        { name: 'Chicken Penne Pasta', description: 'Penne pasta with chicken.', price: 400, category: 'Pasta' },
        { name: 'Fish n Chips', description: 'Classic fish and chips.', price: 450, category: 'Main Course' },
        { name: 'Chocolate Brownie Cold Coffee', description: 'Cold coffee with brownie.', price: 300, category: 'Beverages' },
    ],
  },
  {
    name: 'The Roastery Coffee House',
    address: 'House 418, Road 14, Banjara Hills, Hyderabad, Telangana 500034',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.433, 17.418],
    },
    menu: [
        { name: 'Pour-Over Coffee', description: 'Hand-poured coffee.', price: 250, category: 'Beverages' },
        { name: 'Mac \'n\' Cheese', description: 'Creamy mac and cheese.', price: 350, category: 'Pasta' },
        { name: 'Onion Rings', description: 'Crispy onion rings.', price: 200, category: 'Appetizers' },
    ],
  },
  {
    name: 'Ta.Ma.Sha',
    address: 'Plot 111, Road No. 10, Jubilee Hills, Hyderabad, Telangana 500033',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.410, 17.433],
    },
    menu: [
        { name: 'Corn and cheese bites', description: 'Cheesy corn bites.', price: 300, category: 'Appetizers' },
        { name: 'Spinach-tofu rolls', description: 'Healthy spinach and tofu rolls.', price: 350, category: 'Appetizers' },
        { name: 'Cottage cheese bao buns', description: 'Soft bao buns with cottage cheese.', price: 400, category: 'Main Course' },
    ],
  },
  {
    name: 'Cafe Nera',
    address: 'MCH 1-10-9/2/A/A, Ground Floor, Circle 30, Begumpet, Hyderabad, Telangana 500016',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.462, 17.443],
    },
    menu: [
        { name: 'Thin-Crust Tandoori Paneer Pizza', description: 'Pizza with tandoori paneer.', price: 450, category: 'Pizza' },
        { name: 'Soya Keema Burger', description: 'Burger with soya keema.', price: 350, category: 'Burgers' },
        { name: 'Cranberry Cold Brew', description: 'Cold brew with cranberry.', price: 280, category: 'Beverages' },
    ],
  },
  {
    name: 'The House Of Koyilaa',
    address: 'Plot 53, 3, Road No. 205, Myscape Rd, near Financial District, Hyderabad, Telangana 500032',
    cuisine: 'Cafe',
    location: {
        type: 'Point',
        coordinates: [78.333, 17.422],
    },
    menu: [
        { name: 'Butter Chicken with Naan', description: 'Classic butter chicken with naan.', price: 500, category: 'Main Course' },
        { name: 'Chicken Alfredo Pasta', description: 'Creamy alfredo pasta with chicken.', price: 450, category: 'Pasta' },
        { name: 'Nutella Banana Pizza', description: 'Sweet pizza with nutella and banana.', price: 400, category: 'Desserts' },
    ],
  },
];

const seedDB = async () => {
  await connectDB();
  try {
    await Restaurant.deleteMany({});
    await Restaurant.insertMany(cafes);
    console.log('Data seeded successfully');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding data:', error);
    mongoose.connection.close();
  }
};

seedDB();
