# 🍽️ Restaurant Finder - Food Delivery Platform

A modern, full-stack food delivery application built with Angular and Node.js, featuring restaurant discovery, order management, and user profile management similar to popular food delivery apps like Zomato and Swiggy.

## 1. Introduction

### Project Overview

Restaurant Finder is a comprehensive food delivery platform designed to bridge the gap between food lovers and local restaurants. The application addresses the growing need for convenient, reliable, and user-friendly food delivery services, especially in the Indian market where food delivery apps like Zomato and Swiggy have gained massive popularity.

**Problem Statement:**

- Difficulty in discovering quality local restaurants
- Lack of centralized platform for restaurant information and ordering
- Poor user experience in existing food delivery applications
- Limited customization options for user preferences and dietary requirements
- Inefficient order management and tracking systems

**Solution:**
Our platform provides a seamless, intuitive interface that allows users to:

- Discover restaurants based on cuisine, location, and ratings
- Browse detailed menus with real-time availability
- Manage multiple delivery addresses and preferences
- Track orders from placement to delivery
- Enjoy a personalized experience with saved preferences

### Technology Stack

This project leverages the **MEAN Stack** (MongoDB, Express.js, Angular, Node.js) for building a robust, scalable full-stack application:

**Why MEAN Stack?**

- **MongoDB**: NoSQL database perfect for handling varied restaurant data, user profiles, and flexible schema requirements
- **Express.js**: Lightweight, fast web framework for Node.js with excellent middleware support
- **Angular**: Comprehensive frontend framework with powerful features like dependency injection, routing, and reactive forms
- **Node.js**: JavaScript runtime enabling full-stack JavaScript development with excellent performance

**Additional Technologies:**

- **TypeScript**: Enhanced type safety and better development experience
- **JWT**: Secure authentication and authorization
- **Mongoose**: Elegant MongoDB object modeling
- **RxJS**: Reactive programming for handling asynchronous operations

## 2. System Design and Architecture

### Requirements Analysis

#### Functional Requirements

- **User Management**: Registration, authentication, profile management
- **Restaurant Discovery**: Search, filter, and browse restaurants by cuisine, location, ratings
- **Menu Management**: Display restaurant menus with item details, prices, and availability
- **Order Management**: Add items to cart, place orders, track order status
- **Address Management**: Multiple delivery addresses with type classification
- **Payment Integration**: Secure payment processing (simulated)
- **Review System**: User reviews and ratings for restaurants
- **Search Functionality**: Real-time search with suggestions and filters

#### Non-Functional Requirements

- **Performance**: Page load time < 3 seconds, API response time < 500ms
- **Scalability**: Support for 1000+ concurrent users
- **Security**: JWT-based authentication, input validation, data encryption
- **Usability**: Intuitive UI/UX with mobile-first responsive design
- **Reliability**: 99.9% uptime with proper error handling
- **Maintainability**: Clean, modular code with comprehensive documentation

### System Architecture

The application follows a **multi-tier architecture** pattern:

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Angular   │  │   Angular   │  │   Angular   │        │
│  │ Components  │  │  Services   │  │   Guards    │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Express   │  │ Middleware  │  │ Controllers │        │
│  │   Server    │  │   (Auth,    │  │             │        │
│  │             │  │  Validation)│  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   MongoDB   │  │   MongoDB   │  │   MongoDB   │        │
│  │  Users      │  │Restaurants  │  │   Orders    │        │
│  │ Collection  │  │ Collection  │  │ Collection  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Architecture Components:**

1. **Frontend (Angular)**: Single Page Application with component-based architecture
2. **Backend (Node.js/Express)**: RESTful API server with middleware support
3. **Database (MongoDB)**: NoSQL database with Mongoose ODM
4. **Authentication**: JWT-based stateless authentication
5. **File Storage**: Local file system for image uploads

### Data Modeling

#### MongoDB Collections and Schemas

**1. Users Collection**

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  role: String (enum: ['user', 'admin'], default: 'user'),
  addresses: [{
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
    type: String (enum: ['home', 'work', 'other']),
    isDefault: Boolean
  }],
  preferences: {
    cuisine: [String],
    dietaryRestrictions: [String],
    deliveryInstructions: String,
    notificationSettings: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    }
  },
  date: Date (default: Date.now)
}
```

**2. Restaurants Collection**

```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  address: String (required),
  city: String (required),
  state: String (required),
  pincode: String (required),
  phone: String,
  email: String,
  cuisine: String (required),
  rating: Number (default: 0),
  image: String,
  menu: [{
    name: String (required),
    description: String,
    price: Number (required),
    category: String,
    availability: Boolean (default: true)
  }],
  reviews: [{
    user: ObjectId (ref: 'User'),
    rating: Number (min: 1, max: 5),
    comment: String,
    date: Date (default: Date.now)
  }],
  location: {
    type: String (default: 'Point'),
    coordinates: [Number] // [longitude, latitude]
  },
  isActive: Boolean (default: true),
  date: Date (default: Date.now)
}
```

**3. Orders Collection**

```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User', required),
  restaurant: ObjectId (ref: 'Restaurant', required),
  items: [{
    name: String (required),
    price: Number (required),
    quantity: Number (required)
  }],
  total: Number (required),
  status: String (enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'], default: 'Pending'),
  deliveryAddress: {
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String
  },
  paymentMethod: String,
  date: Date (default: Date.now)
}
```

**Relationships:**

- Users can have multiple addresses (One-to-Many)
- Users can place multiple orders (One-to-Many)
- Restaurants can have multiple menu items (One-to-Many)
- Orders belong to one user and one restaurant (Many-to-One)
- Orders contain multiple items (One-to-Many)

## 3. Backend Development: Node.js and Express

### Server Setup

The Node.js server is configured with Express.js and essential middleware for a production-ready application:

```javascript
// server/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/restaurants", require("./routes/restaurants"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/users", require("./routes/users"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### API Implementation

The RESTful API follows REST principles with proper HTTP methods and status codes:

#### Authentication Endpoints

**POST /api/auth/register**

```javascript
// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create user
    user = new User({ name, email, password });
    await user.save();

    // Generate JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
```

**POST /api/auth/login**

```javascript
// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
```

#### Restaurant Endpoints

**GET /api/restaurants**

```javascript
// Get all restaurants with search and filter
exports.getRestaurants = async (req, res) => {
  try {
    const { search, cuisine, city, sortBy } = req.query;
    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { cuisine: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by cuisine
    if (cuisine) {
      query.cuisine = cuisine;
    }

    // Filter by city
    if (city) {
      query.city = city;
    }

    let restaurants = await Restaurant.find(query);

    // Sort results
    if (sortBy === "rating") {
      restaurants = restaurants.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "name") {
      restaurants = restaurants.sort((a, b) => a.name.localeCompare(b.name));
    }

    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
```

**GET /api/restaurants/:id**

```javascript
// Get restaurant by ID
exports.getRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ msg: "Restaurant not found" });
    }
    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
```

#### Order Endpoints

**POST /api/orders**

```javascript
// Create new order
exports.createOrder = async (req, res) => {
  try {
    const { restaurant, items, total } = req.body;

    const newOrder = new Order({
      user: req.user.id,
      restaurant,
      items,
      total,
    });

    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
```

**GET /api/orders**

```javascript
// Get user orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("restaurant")
      .sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
```

### Authentication and Authorization

**JWT Implementation:**

```javascript
// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
```

**Password Hashing:**

```javascript
// Using bcrypt for password security
const bcrypt = require("bcryptjs");

// Hash password before saving
const salt = await bcrypt.genSalt(10);
user.password = await bcrypt.hash(password, salt);
```

## 4. Frontend Development: Angular

### Frontend Structure

The Angular application follows a modular, component-based architecture:

```
src/app/
├── components/           # Reusable UI components
│   ├── cart/            # Shopping cart functionality
│   ├── footer/          # Enhanced footer with features
│   ├── header/          # Navigation header
│   ├── map/             # Interactive maps
│   └── profile-form/    # User profile management
├── pages/               # Page components
│   ├── home/            # Home page with search
│   ├── profile/         # User profile page
│   ├── restaurants/     # Restaurant listing and details
│   ├── login/           # Authentication pages
│   └── register/
├── services/            # Angular services
│   ├── auth.service.ts  # Authentication service
│   ├── restaurant.service.ts
│   ├── cart.service.ts
│   ├── order.service.ts
│   └── user.service.ts
├── models/              # TypeScript interfaces
│   ├── User.ts
│   ├── Restaurant.ts
│   └── Order.ts
├── guards/              # Route guards
└── app.routes.ts        # Application routing
```

### Data Consumption

**HTTP Service Implementation:**

```typescript
// services/restaurant.service.ts
import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Restaurant } from "../models/Restaurant";

@Injectable({
  providedIn: "root",
})
export class RestaurantService {
  private apiUrl = "http://localhost:3000/api/restaurants";

  constructor(private http: HttpClient) {}

  getRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  getRestaurant(id: string): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  searchRestaurants(query: string): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}?search=${query}`);
  }
}
```

**Authentication Service:**

```typescript
// services/auth.service.ts
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { email, password }).pipe(
      tap((response: any) => {
        localStorage.setItem("token", response.token);
        this.getCurrentUser().subscribe();
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const headers = new HttpHeaders(this.getAuthHeaders());
    return this.http
      .get<User>(`${this.apiUrl}/me`, { headers })
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem("token");
    return token ? { "x-auth-token": token } : {};
  }
}
```

### User Interface and Routing

**Key UI Pages:**

1. **Home Page** - Interactive hero section with advanced search
2. **Restaurant Listing** - Grid view with filtering and sorting
3. **Restaurant Details** - Comprehensive restaurant information
4. **User Profile** - Complete profile management system
5. **Shopping Cart** - Smart cart with order placement
6. **Order History** - Order tracking and management

**Angular Routing:**

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "restaurants", component: RestaurantListComponent },
  { path: "restaurants/:id", component: RestaurantDetailComponent },
  { path: "profile", component: ProfileComponent, canActivate: [AuthGuard] },
  { path: "login", component: LoginComponent },
  { path: "register", component: RegisterComponent },
  { path: "admin", component: AdminComponent, canActivate: [AdminGuard] },
  { path: "**", redirectTo: "" },
];
```

**Route Guards:**

```typescript
// guards/auth.guard.ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(["/login"]);
      return false;
    }
  }
}
```

## 5. Deployment

### Deployment Strategy

**Frontend Deployment (Angular):**

```bash
# Build for production
cd client
ng build --prod

# Deploy to hosting service (Netlify, Vercel, etc.)
# Upload dist/ folder contents
```

**Backend Deployment (Node.js):**

```bash
# Prepare for production
cd server
npm install --production

# Deploy to cloud platform (Heroku, Render, AWS, etc.)
# Configure environment variables
# Set up MongoDB Atlas for database
```

**Environment Configuration:**

```bash
# Production environment variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant-finder
JWT_SECRET=your_production_jwt_secret
NODE_ENV=production
PORT=3000
```

## 6. Conclusion and Future Scope

### Conclusion

The Restaurant Finder project successfully demonstrates the power of the MEAN stack in building modern, scalable web applications. Through this project-based learning approach, we achieved:

**Technical Achievements:**

- Built a complete full-stack application with modern technologies
- Implemented secure authentication and authorization
- Created a responsive, mobile-first user interface
- Developed a robust API with proper error handling
- Integrated real-time search and filtering capabilities
- Implemented comprehensive user profile management

**Learning Outcomes:**

- Mastered Angular component architecture and reactive programming
- Gained expertise in Node.js and Express.js backend development
- Learned MongoDB schema design and Mongoose ODM
- Understood JWT-based authentication and security best practices
- Developed skills in responsive web design and user experience
- Gained experience in API design and integration

**Project Impact:**
The application provides a solid foundation for a food delivery platform that can compete with established players in the market. The modular architecture ensures easy maintenance and future enhancements.

### Future Enhancements

**Short-term Improvements:**

- **Payment Integration**: Integrate with payment gateways (Razorpay, Stripe)
- **Real-time Notifications**: WebSocket implementation for order updates
- **Advanced Search**: Elasticsearch integration for better search capabilities
- **Image Upload**: Cloud storage integration for restaurant and food images
- **Mobile App**: React Native or Flutter mobile application

**Medium-term Features:**

- **Delivery Tracking**: Real-time GPS tracking of delivery partners
- **Recommendation Engine**: AI-powered restaurant and food recommendations
- **Multi-language Support**: Internationalization for global markets
- **Admin Dashboard**: Comprehensive admin panel for restaurant management
- **Analytics**: User behavior analytics and business intelligence

**Long-term Vision:**

- **Microservices Architecture**: Break down monolith into microservices
- **Machine Learning**: Predictive analytics for demand forecasting
- **Blockchain Integration**: Transparent supply chain and food safety tracking
- **IoT Integration**: Smart kitchen equipment and inventory management
- **Global Expansion**: Multi-region deployment with localized content

**Technical Debt and Improvements:**

- **Testing**: Comprehensive unit and integration test coverage
- **Performance**: Caching strategies and database optimization
- **Security**: Enhanced security measures and vulnerability scanning
- **Monitoring**: Application performance monitoring and logging
- **CI/CD**: Automated deployment pipelines and quality gates

This project serves as a stepping stone for more complex applications and demonstrates the practical application of modern web development technologies in solving real-world problems.

## ✨ Features

### 🏠 **Home Page**

- **Interactive Hero Section**: Animated gradient text with floating food icons
- **Advanced Search Bar**: Real-time search suggestions with debouncing
- **Search Features**:
  - Recent searches with local storage
  - Popular search suggestions
  - Restaurant name and cuisine search
  - Auto-complete functionality
- **Featured Restaurants**: Showcase of top restaurants with ratings
- **Responsive Design**: Mobile-first approach with smooth animations

### 🍕 **Restaurant Management**

- **Restaurant Listing**: Grid view with filtering and sorting
- **Restaurant Details**: Comprehensive restaurant information
- **Menu Display**: Interactive menu with item details
- **Location Integration**: Interactive maps with restaurant locations
- **Rating System**: User reviews and ratings display

### 🛒 **Shopping Cart & Orders**

- **Smart Cart System**: Add/remove items with quantity management
- **Order Placement**: Complete order flow with confirmation
- **Order Confirmation Modal**: Professional popup with order details
- **Order History**: Complete order tracking in user profile
- **Cart Persistence**: Items saved across sessions

### 👤 **User Profile System**

- **Personal Information**: Name, email, and phone management
- **Address Management**: Multiple addresses with type classification
  - Home, Work, and Other address types
  - Default address selection
  - Complete address validation
- **Food Preferences**:
  - Cuisine preferences
  - Dietary restrictions
  - Delivery instructions
- **Notification Settings**: Email, SMS, and push notification controls

### 📱 **Modern UI/UX**

- **Zomato-Inspired Design**: Orange gradient theme with professional styling
- **Responsive Layout**: Works perfectly on all device sizes
- **Smooth Animations**: CSS animations and transitions
- **Interactive Elements**: Hover effects and loading states
- **Professional Typography**: Clear hierarchy and readable fonts

### 🔧 **Technical Features**

- **TypeScript**: Full type safety throughout the application
- **Reactive Forms**: Angular reactive forms with validation
- **State Management**: Proper state handling and error management
- **API Integration**: Complete backend integration with error handling
- **Authentication**: JWT-based authentication system
- **Data Validation**: Client and server-side validation

## 🚀 **Getting Started**

### Prerequisites

- Node.js (v16 or higher)
- Angular CLI (v15 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/restaurant-finder.git
   cd restaurant-finder
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**

   ```bash
   # In server directory, create .env file
   MONGODB_URI=mongodb://localhost:27017/restaurant-finder
   JWT_SECRET=your_jwt_secret_here
   PORT=3000
   ```

5. **Start the development servers**

   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run dev

   # Terminal 2 - Start frontend development server
   cd client
   ng serve
   ```

6. **Access the application**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:3000

## 📁 **Project Structure**

```
restaurant-finder/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/     # Reusable components
│   │   │   │   ├── cart/       # Shopping cart component
│   │   │   │   ├── footer/     # Enhanced footer
│   │   │   │   ├── header/     # Navigation header
│   │   │   │   ├── map/        # Interactive maps
│   │   │   │   └── profile-form/ # User profile form
│   │   │   ├── pages/          # Page components
│   │   │   │   ├── home/       # Home page with search
│   │   │   │   ├── profile/    # User profile page
│   │   │   │   ├── restaurants/ # Restaurant listing
│   │   │   │   └── ...
│   │   │   ├── services/       # Angular services
│   │   │   ├── models/         # TypeScript interfaces
│   │   │   └── guards/         # Route guards
│   │   └── styles.css
│   └── angular.json
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   └── index.js
└── README.md
```

## 🛠️ **Technologies Used**

### Frontend

- **Angular 15+**: Modern web framework
- **TypeScript**: Type-safe JavaScript
- **RxJS**: Reactive programming
- **CSS3**: Advanced styling with animations
- **HTML5**: Semantic markup

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Multer**: File upload handling

### Development Tools

- **Angular CLI**: Development and build tools
- **Nodemon**: Development server auto-restart
- **ESLint**: Code linting
- **Prettier**: Code formatting

## 📋 **API Endpoints**

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Restaurants

- `GET /api/restaurants` - Get all restaurants
- `GET /api/restaurants/:id` - Get restaurant by ID
- `POST /api/restaurants` - Create restaurant (admin)
- `PUT /api/restaurants/:id` - Update restaurant (admin)
- `DELETE /api/restaurants/:id` - Delete restaurant (admin)

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order by ID

### User Profile

- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/addresses` - Add new address
- `PUT /api/users/addresses/:id` - Update address
- `DELETE /api/users/addresses/:id` - Delete address
- `PUT /api/users/addresses/:id/default` - Set default address
- `PUT /api/users/preferences` - Update preferences

## 🎨 **Design System**

### Color Palette

- **Primary**: Orange gradient (#ff6b35, #f7931e)
- **Secondary**: Blue gradient (#667eea, #764ba2)
- **Success**: Green gradient (#28a745, #20c997)
- **Warning**: Yellow gradient (#ffc107, #ff8c00)
- **Danger**: Red gradient (#dc3545, #c82333)

### Typography

- **Headings**: Bold, gradient text with proper hierarchy
- **Body**: Clean, readable fonts with good contrast
- **Interactive**: Clear call-to-action buttons

### Components

- **Cards**: Rounded corners with subtle shadows
- **Buttons**: Gradient backgrounds with hover effects
- **Forms**: Clean inputs with validation states
- **Modals**: Professional overlays with smooth animations

## 📱 **Responsive Design**

The application is fully responsive and optimized for:

- **Desktop**: Full-featured experience with all animations
- **Tablet**: Adapted layout with touch-friendly interactions
- **Mobile**: Mobile-first design with optimized performance

## 🔒 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Both client and server-side validation
- **CORS Configuration**: Proper cross-origin resource sharing
- **Environment Variables**: Sensitive data protection

## 🚀 **Deployment**

### Frontend Deployment (Angular)

```bash
cd client
ng build --prod
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment (Node.js)

```bash
cd server
npm install --production
# Deploy to your server (Heroku, AWS, DigitalOcean, etc.)
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 **Authors**

- **Your Name** - _Initial work_ - [YourGitHub](https://github.com/yourusername)

## 🙏 **Acknowledgments**

- Inspired by popular food delivery apps like Zomato and Swiggy
- Built with modern web technologies and best practices
- Special thanks to the Angular and Node.js communities

## 📞 **Contact**

- **Email**: hello@restaurantfinder.com
- **Phone**: +91 98765 43210
- **Address**: Hitech City, Hyderabad, Telangana 500081

---

**Made with ❤️ for food lovers everywhere!**
