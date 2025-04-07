const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  reviewText: {
    type: String,
    required: [true, 'Please provide review text'],
    maxlength: [500, 'Review text cannot be more than 500 characters']
  },
  reviewDateTime: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Update service provider rating when a review is added
ReviewSchema.post('save', async function() {
  try {
    const Booking = mongoose.model('Booking');
    const ServiceListing = mongoose.model('ServiceListing');
    const ServiceProvider = mongoose.model('ServiceProvider');
    
    // Get the booking to find the service provider
    const booking = await Booking.findById(this.bookingId);
    
    if (booking) {
      // Update service listing rating
      const listing = await ServiceListing.findById(booking.serviceListingId);
      if (listing) {
        // Get all reviews for this listing
        const Review = mongoose.model('Review');
        const listingBookings = await Booking.find({ serviceListingId: listing._id });
        const bookingIds = listingBookings.map(b => b._id);
        const reviews = await Review.find({ bookingId: { $in: bookingIds } });
        
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
        
        // Update listing
        listing.averageRating = averageRating;
        listing.reviewCount = reviews.length;
        await listing.save();
      }
      
      // Update service provider rating
      const provider = await ServiceProvider.findById(booking.serviceProviderId);
      if (provider) {
        // Get all reviews for this provider
        const providerBookings = await Booking.find({ serviceProviderId: provider._id });
        const providerBookingIds = providerBookings.map(b => b._id);
        const Review = mongoose.model('Review');
        const providerReviews = await Review.find({ bookingId: { $in: providerBookingIds } });
        
        // Calculate average rating
        const totalRating = providerReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = providerReviews.length > 0 ? totalRating / providerReviews.length : 0;
        
        // Update provider
        provider.rating = averageRating;
        await provider.save();
      }
    }
  } catch (err) {
    console.error('Error updating ratings:', err);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);