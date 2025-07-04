# Fixly - Service Marketplace Platform

Fixly is a modern service marketplace platform connecting customers with service providers. This repository contains both the backend (Node.js/Express) and frontend (React/Vite) codebase.

## Features
- User authentication with JWT and secure cookie sessions
- Service provider registration and profile management
- Service listings with categories and search functionality
- Booking and scheduling system
- Review and rating system
- Secure payment processing
- Admin dashboard for platform management
- Email notifications using Nodemailer
- Cloud-based image storage with Cloudinary

## Prerequisites
- Node.js (Latest LTS version)
- MongoDB database
- Cloudinary account for image storage
- SMTP server for email notifications

## Installation

### Backend Setup
1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
SMTP_HOST=your_smtp_host
SMTP_PORT=your_smtp_port
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

4. Start the development server:
```bash
npm run dev
```

### Frontend Setup
1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Tech Stack

### Backend
- Node.js with Express (^4.18.2)
- MongoDB with Mongoose (^7.0.3)
- JWT Authentication (^9.0.0)
- Cloudinary for image upload (^1.41.3)
- Nodemailer for emails (^6.9.1)
- Express Middleware:
  - cors (^2.8.5)
  - cookie-parser (^1.4.6)
  - multer (^1.4.5-lts.2)

### Frontend
- React (^19.0.0)
- Vite (^6.2.0)
- React Router DOM (^7.5.3)
- Tailwind CSS (^4.1.3)
- Axios (^1.8.2)
- React-Toastify (^11.0.5)
- Framer Motion (^12.6.3)
- React Chart.js 2 (^5.3.0)

## API Documentation

API documentation is available in the [docs](docs/) folder:
- [Authentication API](docs/authapi.txt)
- [Service Provider API](docs/serviceproviderapi.txt)
- [Booking API](docs/bookingapi.txt)
- [Listing API](docs/listingapi.txt)

A Postman collection and environment are available in the docs folder for testing:
- [Postman Collection](docs/fixly_postman_collection.json)
- [Postman Environment](docs/fixly_postman_environment.json)
- [Postman Testing Guide](docs/postman_testing_guide.md)

## Project Structure
```
fixly/
├── client/           # React frontend
├── server/           # Node.js backend
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── utils/        # Utility functions
└── docs/            # API documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](LICENSE)