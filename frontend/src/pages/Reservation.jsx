import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './Reservation.scss';

const Reservation = () => {
  const { hotelId, roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  
  const [pricing, setPricing] = useState({
    basePrice: 0,
    nights: 0,
    subtotal: 0,
    pointsToUse: 0,
    couponCode: '',
    discount: 0,
    finalPrice: 0
  });

  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, [hotelId, roomId]);

  useEffect(() => {
    calculatePricing();
  }, [formData, pricing.pointsToUse, pricing.couponCode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [hotelRes, roomRes] = await Promise.all([
        api.get(`/hotels/${hotelId}`),
        api.get(`/hotels/${hotelId}/rooms`)
      ]);
      
      setHotel(hotelRes.data);
      const selectedRoom = roomRes.data.find(r => r._id === roomId);
      setRoom(selectedRoom);
      setPricing(prev => ({ ...prev, basePrice: selectedRoom.price }));
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!formData.checkIn || !formData.checkOut || !room) return;

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    if (nights <= 0) {
      setPricing(prev => ({ ...prev, nights: 0, subtotal: 0, finalPrice: 0 }));
      return;
    }

    const subtotal = room.price * nights;
    let discount = 0;

    // Apply points
    if (pricing.pointsToUse > 0) {
      discount += Math.min(pricing.pointsToUse, user?.points || 0);
    }

    const finalPrice = Math.max(subtotal - discount, 0);

    setPricing(prev => ({
      ...prev,
      nights,
      subtotal,
      discount,
      finalPrice
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePointsChange = (e) => {
    const points = parseInt(e.target.value) || 0;
    const maxPoints = Math.min(user?.points || 0, pricing.subtotal);
    setPricing(prev => ({
      ...prev,
      pointsToUse: Math.min(points, maxPoints)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.checkIn || !formData.checkOut) {
      setError('체크인/체크아웃 날짜를 선택해주세요.');
      return;
    }

    const checkIn = new Date(formData.checkIn);
    const checkOut = new Date(formData.checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      setError('체크인 날짜는 오늘 이후여야 합니다.');
      return;
    }

    if (checkOut <= checkIn) {
      setError('체크아웃 날짜는 체크인 날짜 이후여야 합니다.');
      return;
    }

    if (formData.guests > room.capacity) {
      setError(`최대 인원은 ${room.capacity}명입니다.`);
      return;
    }

    setSubmitting(true);

    try {
      const reservationData = {
        hotelId,
        roomId,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: parseInt(formData.guests),
        usedPoints: pricing.pointsToUse,
        couponCode: pricing.couponCode || undefined
      };

      const response = await api.post('/reservations', reservationData);
      
      // Redirect to payment page
      navigate(`/payment/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || '예약에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>예약 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (!hotel || !room) {
    return (
      <div className="error-container">
        <p>호텔 또는 객실 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate('/hotels')} className="btn-back">
          목록으로 돌아가기
        </button>
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="reservation-page">
      <div className="container">
        <h1>예약하기</h1>

        <div className="reservation-content">
          {/* Left: Booking Form */}
          <div className="booking-form-section">
            <div className="hotel-summary">
              <img src={hotel.images?.[0]?.url || '/placeholder-hotel.jpg'} alt={hotel.name} />
              <div className="info">
                <h2>{hotel.name}</h2>
                <p className="location">📍 {hotel.location?.city}</p>
                <div className="room-info">
                  <h3>{room.name}</h3>
                  <p>{room.type} | 최대 {room.capacity}명</p>
                </div>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="checkIn">체크인 날짜 *</label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={formData.checkIn}
                    onChange={handleChange}
                    min={today}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="checkOut">체크아웃 날짜 *</label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={formData.checkOut}
                    onChange={handleChange}
                    min={formData.checkIn || today}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="guests">투숙 인원 *</label>
                <select
                  id="guests"
                  name="guests"
                  value={formData.guests}
                  onChange={handleChange}
                  required
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num}>{num}명</option>
                  ))}
                </select>
              </div>

              <div className="divider"></div>

              <div className="discount-section">
                <h3>할인 적용</h3>

                <div className="form-group">
                  <label htmlFor="points">포인트 사용</label>
                  <div className="points-input">
                    <input
                      type="number"
                      id="points"
                      value={pricing.pointsToUse}
                      onChange={handlePointsChange}
                      min="0"
                      max={Math.min(user?.points || 0, pricing.subtotal)}
                      placeholder="0"
                    />
                    <span className="available">
                      사용 가능: {(user?.points || 0).toLocaleString()}P
                    </span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="coupon">쿠폰 코드</label>
                  <input
                    type="text"
                    id="coupon"
                    value={pricing.couponCode}
                    onChange={(e) => setPricing(prev => ({ ...prev, couponCode: e.target.value }))}
                    placeholder="쿠폰 코드 입력"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-submit"
                disabled={submitting || !formData.checkIn || !formData.checkOut}
              >
                {submitting ? '처리 중...' : '결제하기'}
              </button>
            </form>
          </div>

          {/* Right: Price Summary */}
          <div className="price-summary">
            <h3>요금 상세</h3>

            <div className="summary-item">
              <span>객실 요금</span>
              <span>{room.price.toLocaleString()}원 / 1박</span>
            </div>

            {pricing.nights > 0 && (
              <>
                <div className="summary-item">
                  <span>숙박 기간</span>
                  <span>{pricing.nights}박</span>
                </div>

                <div className="summary-item">
                  <span>소계</span>
                  <span>{pricing.subtotal.toLocaleString()}원</span>
                </div>

                {pricing.pointsToUse > 0 && (
                  <div className="summary-item discount">
                    <span>포인트 할인</span>
                    <span>-{pricing.pointsToUse.toLocaleString()}원</span>
                  </div>
                )}

                <div className="divider"></div>

                <div className="summary-item total">
                  <span>총 결제 금액</span>
                  <span>{pricing.finalPrice.toLocaleString()}원</span>
                </div>

                <div className="info-box">
                  <p>💡 예약 완료 시 {Math.floor(pricing.finalPrice * 0.01).toLocaleString()}P가 적립됩니다.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reservation;
