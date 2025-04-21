# Fixly - Service Marketplace Platform

![Fixly Logo](https://via.placeholder.com/150x50?text=Fixly) 

Fixly is a modern service marketplace platform connecting customers with service providers. This repository contains both the backend (Node.js/Express) and frontend (React) codebase.

## Features
- User authentication (JWT)
- Service provider registration and management
- Service listings with filtering
- Booking system
- Profile management
- Payment integration

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
3. Create a `.env` file based on `.env.example`
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

## API Documentation

Comprehensive API documentation is available in the [docs](docs/) folder:
- [Authentication API](docs/authapi.txt)
- [Service Provider API](docs/serviceproviderapi.txt)
- [Booking API](docs/bookingapi.txt)
- [Listing API](docs/listingapi.txt)

Postman collection and environment files are also available in the docs folder.

## Tech Stack

### Backend
- Node.js
- Express
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (Image upload)

### Frontend
- React
- Vite
- Tailwind CSS

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](LICENSE)