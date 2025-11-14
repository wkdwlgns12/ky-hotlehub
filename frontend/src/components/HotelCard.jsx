import React from 'react';
import { Link } from 'react-router-dom';
import './HotelCard.scss';

const HotelCard = ({ hotel }) => {
  const mainImage = hotel.images?.[0]?.url || '/placeholder-hotel.jpg';
  const hasDiscount = hotel.isOnSale && hotel.discountRate > 0;

  return (
    <Link to={`/hotels/${hotel._id}`} className="hotel-card">
      <div className="hotel-image">
        <img src={mainImage} alt={hotel.name} />
        {hasDiscount && (
          <div className="discount-badge">
            {hotel.discountRate}% 할인
          </div>
        )}
        {hotel.rating > 0 && (
          <div className="rating">
            <span>⭐</span>
            <span>{hotel.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="hotel-info">
        <h3>{hotel.name}</h3>
        <p className="location">📍 {hotel.location?.city}</p>
        
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="amenities">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="amenity-tag">{amenity}</span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="amenity-tag">+{hotel.amenities.length - 3}</span>
            )}
          </div>
        )}

        <div className="hotel-footer">
          <div className="reviews">
            💬 리뷰 {hotel.reviewCount || 0}개
          </div>
          {hotel.lowestPrice && (
            <div className="price-info">
              {hasDiscount && hotel.originalPrice && (
                <span className="original-price">{hotel.originalPrice.toLocaleString()}원</span>
              )}
              <span className="current-price">{hotel.lowestPrice.toLocaleString()}원~</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default HotelCard;
