import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import useKakaoMap, { initializeMap, addMarker, geocodeAddress, getKakaoMapUrl } from '../hooks/useKakaoMap';
import './HotelDetail.scss';

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const mapRef = useRef(null);
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [mapCoords, setMapCoords] = useState(null);
  
  // 리뷰 관련 상태
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: ''
  });
  const [reviewLoading, setReviewLoading] = useState(false);

  // 카카오맵 초기화
  useKakaoMap();

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (hotel && mapRef.current) {
      // 카카오맵 SDK 로딩 대기
      const checkKakaoMap = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkKakaoMap);
          initMap();
        }
      }, 100);

      // 10초 후 타임아웃
      setTimeout(() => clearInterval(checkKakaoMap), 10000);

      return () => clearInterval(checkKakaoMap);
    }
  }, [hotel]);

  const initMap = async () => {
    if (!hotel || !mapRef.current) {
      console.log('호텔 정보 또는 맵 컨테이너가 없습니다.');
      return;
    }

    if (!window.kakao || !window.kakao.maps) {
      console.error('카카오맵 SDK가 로드되지 않았습니다.');
      return;
    }

    try {
      let coords = mapCoords;
      
      console.log('지도 초기화 시작 - 호텔:', hotel.name);
      console.log('주소:', hotel.location?.address);
      console.log('기존 좌표:', hotel.location?.coordinates);
      
      // 1. DB에 저장된 좌표가 있으면 사용
      if (hotel.location?.coordinates) {
        const coords_data = hotel.location.coordinates;
        
        // GeoJSON 형식 [경도, 위도] 또는 배열 형태
        if (Array.isArray(coords_data) && coords_data.length === 2) {
          coords = {
            lng: coords_data[0],
            lat: coords_data[1]
          };
          console.log('DB 좌표 사용 (배열):', coords);
        }
        // 객체 형태 {lat, lng} 또는 {latitude, longitude}
        else if (typeof coords_data === 'object') {
          coords = {
            lat: coords_data.lat || coords_data.latitude || coords_data[1],
            lng: coords_data.lng || coords_data.longitude || coords_data[0]
          };
          console.log('DB 좌표 사용 (객체):', coords);
        }
      }
      
      // 2. 좌표가 없거나 유효하지 않으면 주소로 검색
      if ((!coords || !coords.lat || !coords.lng) && hotel.location?.address) {
        console.log('주소로 좌표 검색 중...');
        try {
          coords = await geocodeAddress(hotel.location.address);
          setMapCoords(coords);
          console.log('검색된 좌표:', coords);
        } catch (geocodeError) {
          console.error('주소 검색 실패:', geocodeError);
          // 검색 실패 시 기본 좌표 사용 (전주 한옥마을 중심)
          coords = { lat: 35.8162, lng: 127.1530 };
          console.log('기본 좌표 사용:', coords);
        }
      }

      if (coords && mapRef.current) {
        console.log('지도 생성 - 좌표:', coords);
        const map = initializeMap(mapRef.current, coords.lat, coords.lng, 3);
        if (map) {
          addMarker(map, coords.lat, coords.lng, hotel.name);
          console.log('지도 생성 성공');
        } else {
          console.error('지도 생성 실패');
        }
      } else {
        console.error('좌표를 가져올 수 없습니다.');
      }
    } catch (err) {
      console.error('지도 초기화 실패:', err);
    }
  };

  const fetchHotelDetails = async () => {
    try {
      setLoading(true);
      const [hotelRes, roomsRes, reviewsRes] = await Promise.all([
        api.get(`/hotels/${id}`),
        api.get(`/hotels/${id}/rooms`),
        api.get(`/reviews?hotelId=${id}`)
      ]);

      setHotel(hotelRes.data?.data || hotelRes.data);
      setRooms(roomsRes.data?.data || roomsRes.data);
      setReviews(reviewsRes.data?.data || reviewsRes.data);
    } catch (err) {
      setError('호텔 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewFormChange = (e) => {
    setReviewForm({
      ...reviewForm,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    setReviewLoading(true);
    try {
      if (editingReview) {
        // 수정
        await api.put(`/reviews/${editingReview._id}`, {
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        });
        alert('리뷰가 수정되었습니다.');
      } else {
        // 새 작성
        await api.post('/reviews', {
          hotel: id,
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment
        });
        alert('리뷰가 작성되었습니다.');
      }
      
      setShowReviewForm(false);
      setEditingReview(null);
      setReviewForm({ rating: 5, comment: '' });
      fetchHotelDetails();
    } catch (err) {
      alert(err.response?.data?.message || '리뷰 저장에 실패했습니다.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({
      rating: review.rating,
      comment: review.comment
    });
    setShowReviewForm(true);
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/reviews/${reviewId}`);
      alert('리뷰가 삭제되었습니다.');
      fetchHotelDetails();
    } catch (err) {
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  const handleReportReview = async (reviewId) => {
    const reason = prompt('신고 사유를 입력해주세요:');
    if (!reason) return;

    try {
      await api.post(`/reviews/${reviewId}/report`, { reason });
      alert('리뷰가 신고되었습니다. 관리자가 검토 후 조치합니다.');
    } catch (err) {
      alert(err.response?.data?.message || '신고에 실패했습니다.');
    }
  };

  const canManageReview = (review) => {
    if (!user) return false;
    // 본인이 작성한 리뷰
    if (review.user?._id === user.id || review.user === user.id) return true;
    // 관리자
    if (user.role === 'admin') return true;
    // 호텔 소유자
    if (user.role === 'business' && hotel?.owner?._id === user.id) return true;
    return false;
  };

  const isOwnReview = (review) => {
    if (!user) return false;
    return review.user?._id === user.id || review.user === user.id;
  };

  const handleReservation = (room) => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      navigate('/login');
      return;
    }
    navigate(`/reservation/${hotel._id}/${room._id}`);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>호텔 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="error-container">
        <p>{error || '호텔을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/hotels')} className="btn-back">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const images = hotel.images || [];
  const mainImage = images[selectedImage]?.url || '/placeholder-hotel.jpg';

  return (
    <div className="hotel-detail-page">
      <div className="container">
        {/* Image Gallery */}
        <section className="image-gallery">
          <div className="main-image">
            <img src={mainImage} alt={hotel.name} />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-list">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img.url} alt={`${hotel.name} ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Hotel Info */}
        <section className="hotel-info-section">
          <div className="hotel-header">
            <h1>{hotel.name}</h1>
            {hotel.rating > 0 && (
              <div className="rating">
                <span className="stars">⭐ {hotel.rating.toFixed(1)}</span>
                <span className="review-count">({hotel.reviewCount}개 리뷰)</span>
              </div>
            )}
          </div>

          <div className="location">
            <div className="location-info">
              <span className="address">📍 {hotel.location?.address}</span>
              <span className="city">{hotel.location?.city}</span>
            </div>
            <a 
              href={getKakaoMapUrl(hotel.location?.address, hotel.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kakao-map"
            >
              🗺️ 카카오맵에서 보기
            </a>
          </div>

          {/* 카카오맵 */}
          <div className="map-section">
            <h3>위치</h3>
            <div ref={mapRef} className="kakao-map"></div>
          </div>

          <div className="description">
            <h3>호텔 소개</h3>
            <p>{hotel.description}</p>
          </div>

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="amenities">
              <h3>편의시설</h3>
              <div className="amenity-list">
                {hotel.amenities.map((amenity, idx) => (
                  <span key={idx} className="amenity-tag">✓ {amenity}</span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Rooms */}
        <section className="rooms-section">
          <h2>객실 정보</h2>
          {rooms.length === 0 ? (
            <p className="no-rooms">현재 예약 가능한 객실이 없습니다.</p>
          ) : (
            <div className="rooms-grid">
              {rooms.map(room => (
                <div key={room._id} className="room-card">
                  <div className="room-image">
                    <img src={room.images?.[0]?.url || '/placeholder-room.jpg'} alt={room.name} />
                    {room.isOnSale && room.discountRate > 0 && (
                      <div className="discount-badge">{room.discountRate}% 할인</div>
                    )}
                    {room.inventory <= 0 && (
                      <div className="sold-out-badge">품절</div>
                    )}
                  </div>
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p className="room-type">{room.type}</p>
                    {room.description && (
                      <p className="room-description">{room.description}</p>
                    )}
                    <div className="room-details">
                      <span>👥 최대 {room.capacity}명</span>
                      {room.inventory > 0 && (
                        <span className="inventory">남은 객실: {room.inventory}</span>
                      )}
                    </div>
                    {room.amenities && room.amenities.length > 0 && (
                      <div className="room-amenities">
                        {room.amenities.slice(0, 3).map((amenity, idx) => (
                          <span key={idx} className="amenity">{amenity}</span>
                        ))}
                      </div>
                    )}
                    <div className="room-footer">
                      <div className="price">
                        {room.isOnSale && room.originalPrice && (
                          <span className="original-price">{room.originalPrice.toLocaleString()}원</span>
                        )}
                        <span className="amount">{room.price.toLocaleString()}원</span>
                        <span className="per">/ 1박</span>
                      </div>
                      <button
                        onClick={() => handleReservation(room)}
                        disabled={room.inventory <= 0}
                        className="btn-reservation"
                      >
                        {room.inventory <= 0 ? '품절' : '예약하기'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reviews */}
        <section className="reviews-section">
          <div className="reviews-header">
            <h2>리뷰 ({reviews.length})</h2>
            {isAuthenticated && !showReviewForm && (
              <button 
                className="btn-write-review"
                onClick={() => {
                  setShowReviewForm(true);
                  setEditingReview(null);
                  setReviewForm({ rating: 5, comment: '' });
                }}
              >
                리뷰 작성
              </button>
            )}
          </div>

          {/* 리뷰 작성/수정 폼 */}
          {showReviewForm && (
            <div className="review-form-container">
              <form onSubmit={handleSubmitReview} className="review-form">
                <h3>{editingReview ? '리뷰 수정' : '리뷰 작성'}</h3>
                
                <div className="form-group">
                  <label>별점</label>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`star-btn ${reviewForm.rating >= star ? 'active' : ''}`}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                      >
                        ⭐
                      </button>
                    ))}
                    <span className="rating-text">{reviewForm.rating}점</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>리뷰 내용</label>
                  <textarea
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewFormChange}
                    placeholder="호텔 이용 경험을 자세히 공유해주세요."
                    rows={5}
                    required
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReview(null);
                      setReviewForm({ rating: 5, comment: '' });
                    }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={reviewLoading}
                  >
                    {reviewLoading ? '저장 중...' : editingReview ? '수정 완료' : '리뷰 등록'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="no-reviews">
              <p>아직 리뷰가 없습니다.</p>
              <p className="hint">첫 번째 리뷰를 남겨보세요!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer">
                        <span className="name">{review.user?.name || '알 수 없음'}</span>
                        <span className="rating">⭐ {review.rating}</span>
                      </div>
                      <span className="date">
                        {new Date(review.createdAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {review.updatedAt && new Date(review.updatedAt).getTime() > new Date(review.createdAt).getTime() + 1000 && (
                        <span className="edited-badge">(수정됨)</span>
                      )}
                    </div>
                    
                    <div className="review-actions">
                      {isOwnReview(review) && (
                        <>
                          <button
                            className="btn-action edit"
                            onClick={() => handleEditReview(review)}
                            title="수정"
                          >
                            ✏️
                          </button>
                          <button
                            className="btn-action delete"
                            onClick={() => handleDeleteReview(review._id)}
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </>
                      )}
                      
                      {canManageReview(review) && !isOwnReview(review) && user?.role !== 'user' && (
                        <button
                          className="btn-action delete"
                          onClick={() => handleDeleteReview(review._id)}
                          title="관리자/호텔주 삭제"
                        >
                          🗑️
                        </button>
                      )}
                      
                      {!isOwnReview(review) && user && (
                        <button
                          className="btn-action report"
                          onClick={() => handleReportReview(review._id)}
                          title="신고"
                        >
                          🚨
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <p className="comment">{review.comment}</p>
                  
                  {review.images && review.images.length > 0 && (
                    <div className="review-images">
                      {review.images.map((img, idx) => (
                        <img key={idx} src={img.url} alt={`Review ${idx + 1}`} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HotelDetail;
