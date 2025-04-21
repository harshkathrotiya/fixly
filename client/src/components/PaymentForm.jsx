import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/authcontext';
import './PaymentForm.css';

function PaymentForm() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBooking(response.data.data);
        
        // Check if booking is pending
        if (response.data.data.bookingStatus !== 'Pending') {
          setError('This booking has already been processed.');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking details. Please try again.');
      }
    };

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, token]);

  const handlePaymentMethodChange = (e) => {
    setPaymentMethod(e.target.value);
  };

  const validateForm = () => {
    if (paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') {
      if (!cardNumber.trim()) {
        setError('Please enter card number');
        return false;
      }
      if (!cardName.trim()) {
        setError('Please enter cardholder name');
        return false;
      }
      if (!expiryDate.trim()) {
        setError('Please enter expiry date');
        return false;
      }
      if (!cvv.trim()) {
        setError('Please enter CVV');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    setError(null);
    
    try {
      // Generate a mock transaction ID
      const transactionId = 'TXN' + Date.now().toString();
      
      await axios.post('http://localhost:5000/api/payments', {
        bookingId,
        paymentMethod,
        transactionId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/appointments');
      }, 3000);
    } catch (err) {
      console.error('Error processing payment:', err);
      setError(err.response?.data?.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking && !error) {
    return <div className="loading">Loading booking details...</div>;
  }

  return (
    <div className="payment-form-container">
      <h2>Payment Details</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {success ? (
        <div className="success-message">
          <h3>Payment Successful!</h3>
          <p>Your booking has been confirmed.</p>
          <p>Redirecting to your appointments...</p>
        </div>
      ) : (
        booking && booking.bookingStatus === 'Pending' && (
          <div className="payment-content">
            <div className="booking-summary">
              <h3>Booking Summary</h3>
              <div className="summary-item">
                <span>Service:</span>
                <span>{booking.serviceListingId?.serviceTitle}</span>
              </div>
              <div className="summary-item">
                <span>Provider:</span>
                <span>{booking.serviceProviderId?.userId?.firstName} {booking.serviceProviderId?.userId?.lastName}</span>
              </div>
              <div className="summary-item">
                <span>Date:</span>
                <span>{new Date(booking.serviceDateTime).toLocaleDateString()}</span>
              </div>
              <div className="summary-item">
                <span>Time:</span>
                <span>{new Date(booking.serviceDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="summary-item total">
                <span>Total Amount:</span>
                <span>₹{booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="payment-form">
              <div className="form-group">
                <label>Payment Method:</label>
                <select 
                  value={paymentMethod} 
                  onChange={handlePaymentMethodChange}
                  className="payment-select"
                >
                  <option value="Credit Card">Credit Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              
              {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                <>
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number:</label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cardName">Cardholder Name:</label>
                    <input
                      type="text"
                      id="cardName"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group half">
                      <label htmlFor="expiryDate">Expiry Date:</label>
                      <input
                        type="text"
                        id="expiryDate"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                      />
                    </div>
                    
                    <div className="form-group half">
                      <label htmlFor="cvv">CVV:</label>
                      <input
                        type="text"
                        id="cvv"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        placeholder="123"
                        maxLength={3}
                      />
                    </div>
                  </div>
                </>
              )}
              
              {paymentMethod === 'UPI' && (
                <div className="form-group">
                  <label htmlFor="upiId">UPI ID:</label>
                  <input
                    type="text"
                    id="upiId"
                    placeholder="yourname@upi"
                  />
                </div>
              )}
              
              {paymentMethod === 'Bank Transfer' && (
                <div className="bank-details">
                  <p>Please transfer the amount to the following account:</p>
                  <div className="bank-info">
                    <div className="bank-info-item">
                      <span>Account Name:</span>
                      <span>Fixly Services</span>
                    </div>
                    <div className="bank-info-item">
                      <span>Account Number:</span>
                      <span>1234567890</span>
                    </div>
                    <div className="bank-info-item">
                      <span>IFSC Code:</span>
                      <span>ABCD0001234</span>
                    </div>
                    <div className="bank-info-item">
                      <span>Bank:</span>
                      <span>Example Bank</span>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                type="submit" 
                className="pay-button"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ₹${booking?.totalAmount.toFixed(2)}`}
              </button>
            </form>
          </div>
        )
      )}
    </div>
  );
}

export default PaymentForm;