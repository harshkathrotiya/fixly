# Fixly API Testing Guide with Postman

This guide explains how to use the provided Postman collection and environment files to test the Fixly API endpoints.

## Files Included

1. `fixly_postman_collection.json` - Contains all API endpoints organized by category
2. `fixly_postman_environment.json` - Contains environment variables needed for testing

## Setup Instructions

### 1. Import the Collection and Environment

1. Open Postman
2. Click on "Import" button in the top left corner
3. Select both JSON files:
   - `fixly_postman_collection.json`
   - `fixly_postman_environment.json`
4. Click "Import" to add them to your Postman workspace

### 2. Select the Environment

1. In the top right corner of Postman, select "Fixly API Environment" from the dropdown menu
2. The environment variables are now active for your requests

## Using the Collection

### Authentication Flow

1. Start by registering a user with the "Register User" request
2. Login with the "Login User" request
   - The auth token will be automatically saved to the environment variables
3. You can now access protected endpoints that require authentication

### Testing Different User Types

The collection supports testing with different user types:

- **Customer**: Register with `userType: "customer"`
- **Service Provider**: Use the "Register as Service Provider" request
- **Admin**: Register with `userType: "admin"`

### Environment Variables

The following variables are available in the environment:

- `baseUrl`: The base URL for the API (default: http://localhost:5000)
- `authToken`: JWT token for authenticated requests (automatically set after login)
- `resetToken`: Token for password reset testing
- `providerId`: ID of a service provider
- `listingId`: ID of a service listing
- `bookingId`: ID of a booking

## API Categories

The collection is organized into the following categories:

1. **Authentication** - User registration, login, profile management
2. **Service Providers** - Provider registration, profile management
3. **Service Listings** - Create, read, update, delete service listings
4. **Bookings** - Manage service bookings

## Testing Tips

1. Run requests in sequence within each category
2. After creating resources (listings, bookings), the IDs will need to be manually copied to the environment variables
3. For image upload endpoints, select an image file from your local system
4. Check the response body and status code to verify successful requests

## Server Configuration

The API server should be running on http://localhost:5000. If your server is running on a different URL, update the `baseUrl` variable in the environment settings.

## Cloudinary Integration

The API uses Cloudinary for image storage. The server is already configured with the following Cloudinary credentials:


These credentials are pre-configured on the server side, so you don't need to provide them in your requests.