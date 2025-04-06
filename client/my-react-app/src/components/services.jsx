import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./services.css";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import { useAuth } from "../context/authcontext";
import PlaceholderImg from "./images/plumbing.png";
import { motion, AnimatePresence } from "framer-motion"; // Add framer-motion for animations

const Services = () => {
  // State for listings and categories
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  
  // State for loading and errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for filters
  const [viewMode, setViewMode] = useState("all"); // all, provider
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [tags, setTags] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // State for pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12); // Increased from 10 for better grid layout
  const [totalPages, setTotalPages] = useState(1);
  
  // State for sorting
  const [sortOption, setSortOption] = useState("newest");
  
  // State for favorite services (if user is logged in)
  const [favorites, setFavorites] = useState([]);
  
  // Refs
  const servicesRef = useRef(null);
  
  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    
    // Extract all possible query parameters
    const categoryParam = params.get("category");
    const providerParam = params.get("provider");
    const searchParam = params.get("search");
    const minPriceParam = params.get("minPrice");
    const maxPriceParam = params.get("maxPrice");
    const tagsParam = params.get("tags");
    const pageParam = params.get("page");
    const limitParam = params.get("limit");
    const sortParam = params.get("sort");
    
    // Set state based on URL parameters
    if (categoryParam) setSelectedCategory(categoryParam);
    if (providerParam) {
      setSelectedProvider(providerParam);
      setViewMode("provider");
    }
    if (searchParam) setSearchTerm(searchParam);
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
    if (tagsParam) setTags(tagsParam);
    if (pageParam) setPage(parseInt(pageParam));
    if (limitParam) setLimit(parseInt(limitParam));
    if (sortParam) setSortOption(sortParam);
    
  }, [location.search]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        const fetchedCategories = response.data.data || [];
        setCategories(fetchedCategories);
        
        // Set the first category as selected by default if not already set
        if (!selectedCategory && fetchedCategories.length > 0) {
          setSelectedCategory(fetchedCategories[0]._id);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load service categories. Please try again later.');
      }
    };

    fetchCategories();
    
    // If user is logged in, fetch favorites
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  // Mock function to fetch user favorites - this would need to be implemented in your backend
  const fetchFavorites = async () => {
    // This is a placeholder - replace with actual API call
    try {
      // const response = await axios.get(`http://localhost:5000/api/users/${user.id}/favorites`);
      // setFavorites(response.data.data || []);
      
      // For now, just using localStorage to simulate favorites functionality
      const savedFavorites = localStorage.getItem('serviceFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  // Fetch listings based on filters, sorting, and pagination
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url;
        let params = new URLSearchParams();
        
        // Determine base URL based on view mode
        if (viewMode === "provider" && selectedProvider) {
          // For provider-specific listings
          url = `http://localhost:5000/api/listings/provider/${selectedProvider}`;
        } else {
          // For all listings with filters
          url = 'http://localhost:5000/api/listings';
          
          // Add query parameters
          if (selectedCategory) params.append('category', selectedCategory);
          if (searchTerm) params.append('search', searchTerm);
          if (minPrice) params.append('minPrice', minPrice);
          if (maxPrice) params.append('maxPrice', maxPrice);
          if (tags) params.append('tags', tags);
          if (sortOption) params.append('sort', sortOption);
          
          // Pagination parameters
          params.append('page', page);
          params.append('limit', limit);
        }
        
        // Make the API request
        const response = await axios.get(
          params.toString() ? `${url}?${params.toString()}` : url
        );
        
        // Handle the response
        const data = response.data;
        setListings(data.data || []);
        setFilteredListings(data.data || []);
        
        // Set pagination info if available
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
        }
        
        console.log('Fetched listings:', data.data);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load services. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [
    selectedCategory, 
    viewMode, 
    selectedProvider, 
    searchTerm,
    minPrice,
    maxPrice,
    tags,
    page,
    limit,
    sortOption
  ]);

  // Update URL with current filters
  const updateUrlWithFilters = () => {
    const params = new URLSearchParams();
    
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedProvider) params.append('provider', selectedProvider);
    if (searchTerm) params.append('search', searchTerm);
    if (minPrice) params.append('minPrice', minPrice);
    if (maxPrice) params.append('maxPrice', maxPrice);
    if (tags) params.append('tags', tags);
    if (page > 1) params.append('page', page);
    if (limit !== 12) params.append('limit', limit);
    if (sortOption !== 'newest') params.append('sort', sortOption);
    
    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setViewMode("all");
    setPage(1); // Reset to first page
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('category', categoryId);
    params.delete('provider'); // Clear provider when changing category
    params.set('page', '1');
    navigate(`/services?${params.toString()}`, { replace: true });
    
    // Scroll to services section
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle view details
  const handleViewDetails = (listing) => {
    // Change from /service/ to /listing/ to match your route configuration
    navigate(`/listing/${listing._id}`);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    updateUrlWithFilters();
  };

  // Handle price filter
  const handlePriceFilter = () => {
    setPage(1); // Reset to first page
    updateUrlWithFilters();
    setIsFilterOpen(false); // Close filter panel after applying
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(1); // Reset to first page
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('sort', e.target.value);
    params.set('page', '1');
    navigate(`/services?${params.toString()}`, { replace: true });
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
    
    // Update URL
    const params = new URLSearchParams(location.search);
    params.set('page', newPage.toString());
    navigate(`/services?${params.toString()}`, { replace: true });
    
    // Scroll to top of services section
    if (servicesRef.current) {
      servicesRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setMinPrice("");
    setMaxPrice("");
    setTags("");
    setSortOption("newest");
    setPage(1);
    setViewMode("all");
    setSelectedProvider(null);
    
    // Keep only the category in URL
    navigate(`/services?category=${selectedCategory}`, { replace: true });
  };
  
  // Toggle favorite status
  const toggleFavorite = (listingId) => {
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login', { state: { from: location } });
      return;
    }
    
    // Update local favorites list
    let updatedFavorites;
    if (favorites.includes(listingId)) {
      updatedFavorites = favorites.filter(id => id !== listingId);
    } else {
      updatedFavorites = [...favorites, listingId];
    }
    
    setFavorites(updatedFavorites);
    
    // Save to localStorage (replace with API call in production)
    localStorage.setItem('serviceFavorites', JSON.stringify(updatedFavorites));
    
    // For a real implementation, you'd save to the database
    // axios.post(`http://localhost:5000/api/users/${user.id}/favorites`, { listingId });
  };

  // Find the name of the selected category
  const selectedCategoryName = categories.find(
    cat => cat._id === selectedCategory
  )?.categoryName || 'All Services';

  // Calculate average rating for stars display
  const renderStars = (rating) => {
    if (!rating) return null;
    
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    return (
      <div className="stars-container">
        {[...Array(fullStars)].map((_, i) => (
          <i key={`full-${i}`} className="fas fa-star"></i>
        ))}
        {halfStar && <i key="half" className="fas fa-star-half-alt"></i>}
        {[...Array(emptyStars)].map((_, i) => (
          <i key={`empty-${i}`} className="far fa-star"></i>
        ))}
      </div>
    );
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    // Calculate range of pages to show
    let startPage = Math.max(1, page - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }
    
    // First page button
    if (startPage > 1) {
      buttons.push(
        <button 
          key="first" 
          onClick={() => handlePageChange(1)}
          className="pagination-button page-number"
        >
          1
        </button>
      );
      
      if (startPage > 2) {
        buttons.push(<span key="dots1" className="pagination-ellipsis">...</span>);
      }
    }
    
    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={`pagination-button page-number ${page === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    // Last page button
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="dots2" className="pagination-ellipsis">...</span>);
      }
      
      buttons.push(
        <button 
          key="last" 
          onClick={() => handlePageChange(totalPages)}
          className="pagination-button page-number"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  return (
    <div className="services-page">
      <Navbar />
      
      <div className="hero-section">
        <div className="hero-content">
          <h1>Find Your Perfect Service Provider</h1>
          <p>Professional, Reliable, and Trusted Services for Your Home</p>
          <form onSubmit={handleSearchSubmit} className="hero-search-form">
            <div className="hero-search-container">
              <input
                type="text"
                placeholder="What service do you need today?"
                value={searchTerm}
                onChange={handleSearch}
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-button">
                <i className="fas fa-search"></i> Search
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div className="services-container" ref={servicesRef}>
        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <p>{error}</p>
            <button onClick={() => setError(null)}>Dismiss</button>
          </div>
        )}
        
        <div className="category-selector">
          <h2>Browse Services by Category</h2>
          <div className="category-cards">
            {categories.map((category) => (
              <div 
                key={category._id}
                className={`category-card ${selectedCategory === category._id ? "active" : ""}`}
                onClick={() => handleCategoryChange(category._id)}
              >
                <div className="category-icon">
                  <i className={getCategoryIcon(category.categoryName)}></i>
                </div>
                <h3>{category.categoryName}</h3>
              </div>
            ))}
          </div>
        </div>
        
        <div className="filter-section">
          <div className="filter-header">
            <h2>
              {viewMode === "provider" ? "Provider Services" : selectedCategoryName}
              {searchTerm && ` - "${searchTerm}"`}
            </h2>
            
            <div className="filter-controls">
              <div className="sort-filter">
                <label htmlFor="sort-select">Sort by:</label>
                <select 
                  id="sort-select"
                  value={sortOption} 
                  onChange={handleSortChange}
                  className="sort-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
              
              <button 
                className="filter-toggle-button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <i className="fas fa-sliders-h"></i> Filters
                {(searchTerm || minPrice || maxPrice || tags) && <span className="filter-badge"></span>}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                className="advanced-filters"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="filter-row">
                  <div className="filter-group">
                    <label>Price Range:</label>
                    <div className="price-filter">
                      <input
                        type="number"
                        placeholder="Min $"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="price-input"
                      />
                      <span className="price-separator">to</span>
                      <input
                        type="number"
                        placeholder="Max $"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="price-input"
                      />
                    </div>
                  </div>
                  
                  <div className="filter-group">
                    <label>Tags (comma separated):</label>
                    <input
                      type="text"
                      placeholder="e.g. emergency, weekend, certified"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="tags-input"
                    />
                  </div>
                </div>
                
                <div className="filter-actions">
                  <button 
                    onClick={resetFilters}
                    className="reset-filters-button"
                  >
                    <i className="fas fa-times"></i> Reset Filters
                  </button>
                  <button 
                    onClick={handlePriceFilter}
                    className="apply-filter-button"
                  >
                    <i className="fas fa-check"></i> Apply Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="services-results">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <p>Finding the best services for you...</p>
            </div>
          ) : filteredListings.length > 0 ? (
            <>
              <div className="service-grid">
                <AnimatePresence>
                  {filteredListings.map((listing, index) => (
                    <motion.div
                      className="service-card"
                      key={listing._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="service-image-wrapper">
                        <img 
                          src={listing.serviceImage || PlaceholderImg} 
                          alt={listing.title || listing.serviceTitle} 
                          className="service-image" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = PlaceholderImg;
                          }}
                        />
                        <button 
                          className={`favorite-button ${favorites.includes(listing._id) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(listing._id);
                          }}
                          aria-label={favorites.includes(listing._id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <i className={favorites.includes(listing._id) ? "fas fa-heart" : "far fa-heart"}></i>
                        </button>
                      </div>
                      
                      <div className="service-content">
                        <h3>{listing.title || listing.serviceTitle}</h3>
                        
                        <div className="service-meta-row">
                          <div className="service-price">${listing.price || listing.servicePrice}</div>
                          {listing.rating && (
                            <div className="service-rating">
                              {renderStars(listing.rating)}
                              <span className="rating-value">{listing.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="service-description">
                          {(listing.description || listing.serviceDetails).length > 100 
                            ? `${(listing.description || listing.serviceDetails).substring(0, 100)}...` 
                            : (listing.description || listing.serviceDetails)}
                        </p>
                        
                        {listing.tags && (
                          <div className="service-tags">
                            {(Array.isArray(listing.tags) ? listing.tags : listing.tags.split(','))
                              .slice(0, 3) // Show max 3 tags
                              .map((tag, index) => (
                                <span key={index} className="service-tag">
                                  {typeof tag === 'string' ? tag.trim() : tag}
                                </span>
                              ))}
                            {(Array.isArray(listing.tags) ? listing.tags : listing.tags.split(',')).length > 3 && (
                              <span className="service-tag more-tag">+{(Array.isArray(listing.tags) ? listing.tags : listing.tags.split(',')).length - 3} more</span>
                            )}
                          </div>
                        )}
                        
                        <div className="service-info-row">
                          <div className="service-provider">
                            <i className="fas fa-user-circle"></i>
                            <span>{listing.providerName || 'Service Provider'}</span>
                          </div>
                          
                          {listing.location && (
                            <div className="service-location">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{listing.location}</span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          className="view-details-button"
                          onClick={() => handleViewDetails(listing)}
                        >
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="pagination-button"
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  
                  <div className="pagination-numbers">
                    {renderPaginationButtons()}
                  </div>
                  
                  <button 
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="pagination-button"
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-services">
              <div className="no-results-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Services Found</h3>
              <p>We couldn't find any services matching your criteria.</p>
              <p>Try adjusting your filters or search term to find what you're looking for.</p>
              <button className="reset-filters-button" onClick={resetFilters}>
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function to get appropriate icon for category
function getCategoryIcon(categoryName) {
  const name = categoryName.toLowerCase();
  
  if (name.includes('plumb')) return 'fas fa-faucet';
  if (name.includes('electric')) return 'fas fa-bolt';
  if (name.includes('clean')) return 'fas fa-broom';
  if (name.includes('paint')) return 'fas fa-paint-roller';
  if (name.includes('garden') || name.includes('landscape')) return 'fas fa-leaf';
  if (name.includes('repair') || name.includes('maintenance')) return 'fas fa-tools';
  if (name.includes('heat') || name.includes('air') || name.includes('ac')) return 'fas fa-temperature-high';
  if (name.includes('roof')) return 'fas fa-home';
  if (name.includes('carpet') || name.includes('floor')) return 'fas fa-broom';
  if (name.includes('security')) return 'fas fa-shield-alt';
  if (name.includes('pest')) return 'fas fa-bug';
  if (name.includes('move')) return 'fas fa-truck';
  
  // Default icon
  return 'fas fa-hammer';
}

export default Services;

// Remove this standalone code snippet that's causing the error