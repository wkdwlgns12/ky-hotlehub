import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './BusinessDashboard.scss';

const BusinessDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('hotels');
  const [hotels, setHotels] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'business') {
      navigate('/');
      return;
    }
    if (!user.businessApproved) {
      navigate('/business/pending');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'hotels') {
        // 자기가 등록한 호텔만 가져오기
        const response = await api.get(`/hotels?ownerId=${user.id}`);
        console.log('Hotels API response:', response);
        console.log('User ID:', user.id);
        const hotelsData = response.data?.data || response.data || [];
        console.log('Hotels data:', hotelsData);
        setHotels(Array.isArray(hotelsData) ? hotelsData : []);
      } else if (activeTab === 'reservations') {
        // Get all reservations for business owner's hotels
        const response = await api.get(`/hotels?ownerId=${user.id}`);
        const myHotels = response.data?.data || response.data || [];
        const hotelIds = myHotels.map(h => h._id);
        
        if (hotelIds.length > 0) {
          const reservationPromises = hotelIds.map(hotelId => 
            api.get(`/reservations/hotel/${hotelId}`).catch(() => ({ data: [] }))
          );
          const reservationResults = await Promise.all(reservationPromises);
          const allReservations = reservationResults.flatMap(res => res.data?.data || res.data || []);
          setReservations(allReservations);
        } else {
          setReservations([]);
        }
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Fetch error:', err);
      // Set empty arrays on error
      if (activeTab === 'hotels') {
        setHotels([]);
      } else {
        setReservations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('호텔을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/hotels/${hotelId}`);
      alert('호텔이 삭제되었습니다.');
      fetchData();
    } catch (err) {
      alert('호텔 삭제에 실패했습니다.');
    }
  };

  const handleManageRooms = async (hotel) => {
    try {
      setSelectedHotel(hotel);
      const response = await api.get(`/hotels/${hotel._id}/rooms`);
      setRooms(response.data?.data || response.data || []);
      setShowRoomModal(true);
    } catch (err) {
      alert('객실 정보를 불러오는데 실패했습니다.');
    }
  };

  const handleAddRoom = () => {
    navigate(`/business/hotels/${selectedHotel._id}/rooms/add`);
  };

  const handleEditRoom = (roomId) => {
    navigate(`/business/hotels/${selectedHotel._id}/rooms/${roomId}/edit`);
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('이 객실을 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/hotels/rooms/${roomId}`);
      alert('객실이 삭제되었습니다.');
      handleManageRooms(selectedHotel);
    } catch (err) {
      alert('객실 삭제에 실패했습니다.');
    }
  };

  const handleUpdateRoomInventory = async (roomId, newInventory) => {
    try {
      await api.put(`/hotels/rooms/${roomId}`, { inventory: Number(newInventory) });
      alert('재고가 업데이트되었습니다.');
      handleManageRooms(selectedHotel);
    } catch (err) {
      alert('재고 업데이트에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '승인 대기', class: 'pending' },
      approved: { text: '운영중', class: 'approved' },
      rejected: { text: '거부됨', class: 'rejected' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const getReservationBadge = (status) => {
    const statusMap = {
      pending: { text: '결제 대기', class: 'pending' },
      confirmed: { text: '예약 완료', class: 'confirmed' },
      cancelled: { text: '취소됨', class: 'cancelled' },
      completed: { text: '이용 완료', class: 'completed' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (!user || user.role !== 'business') return null;

  return (
    <div className="business-dashboard">
      <div className="container">
        <div className="dashboard-header">
          <h1>사업자 대시보드</h1>
          <p className="business-name">{user.businessName}</p>
        </div>

        <div className="stats-cards">
          <div className="stat-card">
            <div className="icon">🏨</div>
            <div className="info">
              <span className="label">등록 호텔</span>
              <span className="value">{hotels?.length || 0}개</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon">📅</div>
            <div className="info">
              <span className="label">총 예약</span>
              <span className="value">{reservations?.length || 0}건</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="icon">💰</div>
            <div className="info">
              <span className="label">총 매출</span>
              <span className="value">
                {(reservations || [])
                  .filter(r => r.status === 'confirmed' || r.status === 'completed')
                  .reduce((sum, r) => sum + (r.totalPrice || 0), 0)
                  .toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={activeTab === 'hotels' ? 'active' : ''}
            onClick={() => setActiveTab('hotels')}
          >
            호텔 관리
          </button>
          <button 
            className={activeTab === 'reservations' ? 'active' : ''}
            onClick={() => setActiveTab('reservations')}
          >
            예약 관리
          </button>
          <button 
            className="coupon-btn"
            onClick={() => navigate('/coupons/manage')}
          >
            🎟️ 쿠폰 생성
          </button>
        </div>

        <div className="tab-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>로딩 중...</p>
            </div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <>
              {activeTab === 'hotels' && (
                <div className="hotels-section">
                  <div className="section-header">
                    <h2>호텔 목록</h2>
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/business/hotels/add')}
                    >
                      + 호텔 등록
                    </button>
                  </div>

                  {!hotels || hotels.length === 0 ? (
                    <div className="empty">
                      <p>등록된 호텔이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="hotels-grid">
                      {hotels.map(hotel => (
                        <div key={hotel._id} className="hotel-card">
                          <img 
                            src={hotel.images?.[0]?.url || '/placeholder-hotel.jpg'} 
                            alt={hotel.name}
                          />
                          <div className="card-body">
                            <div className="header">
                              <h3>{hotel.name}</h3>
                              {getStatusBadge(hotel.status)}
                            </div>
                            <p className="location">📍 {hotel.location?.city}</p>
                            <p className="rating">⭐ {hotel.rating?.toFixed(1)} ({hotel.reviewCount}개 리뷰)</p>
                            
                            <div className="actions">
                              <button 
                                className="btn-rooms"
                                onClick={() => handleManageRooms(hotel)}
                              >
                                객실 관리
                              </button>
                              <button 
                                className="btn-delete"
                                onClick={() => handleDeleteHotel(hotel._id)}
                              >
                                호텔 삭제
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reservations' && (
                <div className="reservations-section">
                  <h2>예약 목록</h2>

                  {!reservations || reservations.length === 0 ? (
                    <div className="empty">
                      <p>예약 내역이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="reservations-table">
                      <table>
                        <thead>
                          <tr>
                            <th>예약일</th>
                            <th>호텔</th>
                            <th>객실</th>
                            <th>투숙객</th>
                            <th>체크인</th>
                            <th>체크아웃</th>
                            <th>인원</th>
                            <th>결제금액</th>
                            <th>상태</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reservations.map(reservation => (
                            <tr key={reservation._id}>
                              <td>{new Date(reservation.createdAt).toLocaleDateString('ko-KR')}</td>
                              <td>{reservation.hotel?.name || reservation.hotelId?.name || '-'}</td>
                              <td>{reservation.room?.name || reservation.roomId?.name || '-'}</td>
                              <td>{reservation.user?.name || reservation.userId?.name || '-'}</td>
                              <td>{new Date(reservation.checkIn).toLocaleDateString('ko-KR')}</td>
                              <td>{new Date(reservation.checkOut).toLocaleDateString('ko-KR')}</td>
                              <td>{reservation.guests}명</td>
                              <td>{reservation.totalPrice?.toLocaleString()}원</td>
                              <td>{getReservationBadge(reservation.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* 객실 관리 모달 */}
        {showRoomModal && selectedHotel && (
          <div className="modal-overlay" onClick={() => setShowRoomModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>객실 관리 - {selectedHotel.name}</h2>
                <button className="modal-close" onClick={() => setShowRoomModal(false)}>✕</button>
              </div>
              
              <div className="modal-body">
                <div className="modal-actions">
                  <button className="btn-add-room" onClick={handleAddRoom}>
                    + 새 객실 등록
                  </button>
                </div>
                
                {rooms.length === 0 ? (
                  <div className="empty">
                    <p>등록된 객실이 없습니다.</p>
                    <p className="empty-hint">위의 버튼을 클릭하여 객실을 등록하세요.</p>
                  </div>
                ) : (
                  <div className="rooms-list">
                    {rooms.map(room => (
                      <div key={room._id} className="room-item">
                        <div className="room-image">
                          <img src={room.images?.[0]?.url || '/placeholder-room.jpg'} alt={room.name} />
                        </div>
                        <div className="room-details">
                          <h3>{room.name}</h3>
                          <p className="room-type">{room.type}</p>
                          <p className="room-price">{room.price?.toLocaleString()}원 / 1박</p>
                          <p className="room-capacity">👥 최대 {room.capacity}명</p>
                          
                          <div className="room-inventory">
                            <label>재고 수량:</label>
                            <input 
                              type="number" 
                              min="0" 
                              max="100"
                              defaultValue={room.inventory}
                              onBlur={(e) => {
                                if (e.target.value !== String(room.inventory)) {
                                  handleUpdateRoomInventory(room._id, e.target.value);
                                }
                              }}
                            />
                          </div>
                        </div>
                        <div className="room-actions">
                          <button 
                            className="btn-edit-room"
                            onClick={() => handleEditRoom(room._id)}
                          >
                            수정
                          </button>
                          <button 
                            className="btn-delete-room"
                            onClick={() => handleDeleteRoom(room._id)}
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDashboard;
