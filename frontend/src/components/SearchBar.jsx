import React, { useState } from 'react';
import './SearchBar.scss';

const SearchBar = ({ onSearch }) => {
  const [filters, setFilters] = useState({
    search: '',
    city: '',
    checkIn: '',
    checkOut: '',
    minPrice: 50000,
    maxPrice: 500000,
    rating: '',
    amenities: [],
    guests: 2
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const amenitiesList = [
    { id: 'WiFi', label: '🌐 WiFi', icon: '📶' },
    { id: '주차', label: '🚗 주차', icon: '🅿️' },
    { id: '수영장', label: '🏊 수영장', icon: '🏊' },
    { id: '피트니스', label: '💪 피트니스', icon: '🏋️' },
    { id: '레스토랑', label: '🍽️ 레스토랑', icon: '🍴' },
    { id: '바', label: '🍸 바', icon: '🥂' },
    { id: '스파', label: '💆 스파', icon: '🧖' },
    { id: '사우나', label: '🧖 사우나', icon: '♨️' },
    { id: '해변', label: '🏖️ 해변', icon: '🏝️' },
    { id: '골프장', label: '⛳ 골프', icon: '🏌️' },
    { id: '키즈클럽', label: '👶 키즈클럽', icon: '🎈' },
    { id: '반려동물', label: '🐕 반려동물', icon: '🐾' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handlePriceChange = (type, value) => {
    setFilters({
      ...filters,
      [type]: Number(value)
    });
  };

  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities;
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    setFilters({
      ...filters,
      amenities: newAmenities
    });
  };

  const handleReset = () => {
    setFilters({
      search: '',
      city: '',
      checkIn: '',
      checkOut: '',
      minPrice: 50000,
      maxPrice: 500000,
      rating: '',
      amenities: [],
      guests: 2
    });
  };

  // 오늘 날짜 (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];

  // 가격 포맷팅 (50000 -> 5만원)
  const formatPrice = (price) => {
    if (price >= 10000) {
      return `${(price / 10000).toFixed(0)}만원`;
    }
    return `${price.toLocaleString()}원`;
  };

  return (
    <div className="search-bar">
      <div className="container">
        <form onSubmit={handleSubmit}>
          <div className="search-inputs">
            <input
              type="text"
              name="search"
              placeholder="호텔 이름 또는 주소 검색"
              value={filters.search}
              onChange={handleChange}
            />
            
            <select name="city" value={filters.city} onChange={handleChange}>
              <option value="">도시 선택</option>
              <option value="서울">서울</option>
              <option value="부산">부산</option>
              <option value="인천">인천</option>
              <option value="대구">대구</option>
              <option value="대전">대전</option>
              <option value="광주">광주</option>
              <option value="울산">울산</option>
              <option value="세종">세종</option>
              <option value="제주">제주</option>
              <option value="강릉">강릉</option>
              <option value="속초">속초</option>
              <option value="경주">경주</option>
              <option value="전주">전주</option>
              <option value="여수">여수</option>
              <option value="포항">포항</option>
            </select>

            <select name="rating" value={filters.rating} onChange={handleChange}>
              <option value="">평점</option>
              <option value="5">⭐⭐⭐⭐⭐ (5성급)</option>
              <option value="4">⭐⭐⭐⭐ (4성급 이상)</option>
              <option value="3">⭐⭐⭐ (3성급 이상)</option>
              <option value="2">⭐⭐ (2성급 이상)</option>
              <option value="1">⭐ (1성급 이상)</option>
            </select>

            <button type="submit" className="btn-search">
              🔍 검색
            </button>
          </div>

          <div className="date-price-range">
            <div className="date-inputs">
              <input
                type="date"
                name="checkIn"
                placeholder="체크인"
                value={filters.checkIn}
                onChange={handleChange}
                min={today}
              />
              <span>~</span>
              <input
                type="date"
                name="checkOut"
                placeholder="체크아웃"
                value={filters.checkOut}
                onChange={handleChange}
                min={filters.checkIn || today}
              />
            </div>

            <div className="price-slider">
              <div className="price-labels">
                <span className="price-label">💰 가격 범위</span>
                <span className="price-values">
                  {formatPrice(filters.minPrice)} ~ {formatPrice(filters.maxPrice)}
                </span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  name="minPrice"
                  min="30000"
                  max="500000"
                  step="10000"
                  value={filters.minPrice}
                  onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                  className="slider slider-min"
                />
                <input
                  type="range"
                  name="maxPrice"
                  min="30000"
                  max="500000"
                  step="10000"
                  value={filters.maxPrice}
                  onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                  className="slider slider-max"
                />
              </div>
            </div>
          </div>

          {/* 상세 검색 토글 버튼 */}
          <div className="advanced-toggle">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="btn-toggle"
            >
              {showAdvanced ? '🔼 상세 검색 접기' : '🔽 상세 검색 펼치기'}
            </button>
          </div>

          {/* 상세 검색 옵션 */}
          {showAdvanced && (
            <div className="advanced-filters">
              <div className="filter-section">
                <h4>👥 인원</h4>
                <div className="guest-selector">
                  <button
                    type="button"
                    onClick={() => setFilters({...filters, guests: Math.max(1, filters.guests - 1)})}
                    className="btn-guest"
                  >
                    -
                  </button>
                  <span className="guest-count">{filters.guests}명</span>
                  <button
                    type="button"
                    onClick={() => setFilters({...filters, guests: Math.min(10, filters.guests + 1)})}
                    className="btn-guest"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="filter-section amenities-section">
                <h4>✨ 편의시설</h4>
                <div className="amenities-grid">
                  {amenitiesList.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      className={`amenity-btn ${filters.amenities.includes(amenity.id) ? 'active' : ''}`}
                      onClick={() => handleAmenityToggle(amenity.id)}
                    >
                      <span className="amenity-icon">{amenity.icon}</span>
                      <span className="amenity-label">{amenity.id}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-actions">
                <button type="button" onClick={handleReset} className="btn-reset">
                  🔄 초기화
                </button>
                <button type="submit" className="btn-apply">
                  ✅ 적용하기
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
