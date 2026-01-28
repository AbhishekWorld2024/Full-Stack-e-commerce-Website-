# Full-Stack-e-commerce-Website-

Website URL: https://ecom-sphere.preview.emergentagent.com

# Full-Stack E-Commerce Web Application

A fully functional e-commerce website developed using React.js for the frontend and FastAPI (Python) for the backend, with MongoDB as the database.

## Project Overview

This project demonstrates a complete online shopping platform for a fashion/clothing store with features including user authentication, product catalog management, shopping cart functionality, and order processing.

## Features

### Customer Features
- User registration and login with JWT-based authentication
- Browse products with category filtering
- View detailed product information with size and color selection
- Add products to shopping cart with quantity management
- Secure checkout process with shipping information
- View order history and track order status

### Admin Features
- Admin dashboard with analytics (total products, orders, revenue)
- Full CRUD operations for product management
- Order management with status updates (Confirmed, Processing, Shipped, Delivered)

## Tech Stack

### Frontend
- **React.js 19** - Component-based UI library
- **React Router v7** - Client-side routing and navigation
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Axios** - Promise-based HTTP client for API requests
- **Context API** - State management for authentication and cart
- **Shadcn/UI** - Pre-built accessible UI components

### Backend
- **FastAPI** - High-performance Python web framework
- **Motor** - Asynchronous MongoDB driver for Python
- **PyJWT** - JSON Web Token implementation for authentication
- **Bcrypt** - Password hashing for secure credential storage
- **Pydantic** - Data validation using Python type annotations

### Database
- **MongoDB** - NoSQL document database for flexible data storage

## API Endpoints

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| Auth | POST | `/api/auth/register` | Register new user |
| Auth | POST | `/api/auth/login` | User login |
| Auth | GET | `/api/auth/me` | Get current user |
| Products | GET | `/api/products` | Get all products (with filters) |
| Products | GET | `/api/products/:id` | Get product by ID |
| Products | GET | `/api/products/categories` | Get all categories |
| Cart | GET | `/api/cart` | Get user's cart |
| Cart | POST | `/api/cart/items` | Add item to cart |
| Cart | PUT | `/api/cart/items/:id` | Update cart item quantity |
| Cart | DELETE | `/api/cart/items/:id` | Remove item from cart |
| Orders | POST | `/api/orders` | Create new order |
| Orders | GET | `/api/orders` | Get user's orders |
| Admin | POST | `/api/admin/products` | Create product |
| Admin | PUT | `/api/admin/products/:id` | Update product |
| Admin | DELETE | `/api/admin/products/:id` | Delete product |
| Admin | GET | `/api/admin/orders` | Get all orders |
| Admin | PUT | `/api/admin/orders/:id/status` | Update order status |

## Database Schema

### Users Collection
- `id`, `username`, `email`, `password_hash`, `is_admin`, `created_at`

### Products Collection
- `id`, `name`, `description`, `price`, `category`, `sizes`, `colors`, `image_url`, `stock`, `featured`, `created_at`

### Carts Collection
- `user_id`, `items[]` (product_id, quantity, size, color)

### Orders Collection
- `id`, `user_id`, `items[]`, `shipping_address`, `total`, `status`, `created_at`

## Installation & Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --port 8001
