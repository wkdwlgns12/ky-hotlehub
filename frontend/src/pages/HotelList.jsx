import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import HotelCard from '../components/HotelCard';
import SearchBar from '../components/SearchBar';
import './HotelList.scss';

const HotelList = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params = Object.fromEntries(searchParams);
      const response = await api.get('/hotels', { params });
      
      setHotels(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError('호텔 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, [searchParams]);

  const handleSearch = (filters) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      if (value !== '' && value !== null && value !== undefined) {
        // 배열인 경우 길이가 0보다 클 때만 추가
        if (Array.isArray(value)) {
          if (value.length > 0) {
            params.set(key, value.join(','));
          }
        } else {
          params.set(key, value);
        }
      }
    });
    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <div className="hotel-list-page">
      <SearchBar onSearch={handleSearch} />

      <div className="container">
        <div className="hotels-header">
          <h2>호텔 목록</h2>
          {pagination.total && (
            <p className="results-count">{pagination.total}개의 호텔</p>
          )}
        </div>

        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>호텔을 검색중입니다...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {!loading && !error && hotels.length === 0 && (
          <div className="no-results">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}

        <div className="hotels-grid">
          {hotels.map(hotel => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>

        {pagination.pages > 1 && (
          <div className="pagination">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={pagination.page === page ? 'active' : ''}
                onClick={() => {
                  const params = new URLSearchParams(searchParams);
                  params.set('page', page);
                  navigate(`/hotels?${params.toString()}`);
                }}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelList;
