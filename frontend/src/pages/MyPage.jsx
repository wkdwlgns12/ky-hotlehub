import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './MyPage.scss';

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('reservations');
  const [reservations, setReservations] = useState([]);
  const [points, setPoints] = useState({ balance: 0, history: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Profile edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: ''
  });
  
  // Password change states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchData();
    // Initialize profile data
    setProfileData({
      name: user.name || '',
      phone: user.phone || ''
    });
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (activeTab === 'reservations') {
        const response = await api.get('/reservations');
        // 취소된 예약 제외
        const activeReservations = (response.data?.data || response.data || []).filter(
          res => res.status !== 'cancelled'
        );
        setReservations(activeReservations);
      } else if (activeTab === 'points') {
        const response = await api.get('/users/me/points');
        // Handle both old and new API response formats
        if (response.data.data) {
          setPoints(response.data.data);
        } else if (response.data.balance !== undefined) {
          setPoints(response.data);
        } else {
          // Fallback for old format
          setPoints({ balance: response.data.points || 0, history: [] });
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('데이터를 불러오는데 실패했습니다.');
      // Set default values on error
      if (activeTab === 'points') {
        setPoints({ balance: 0, history: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('예약을 취소하시겠습니까?')) return;

    try {
      await api.put(`/reservations/${reservationId}/cancel`);
      alert('예약이 취소되었습니다.');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || '예약 취소에 실패했습니다.');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { text: '결제 대기', class: 'pending' },
      confirmed: { text: '예약 완료', class: 'confirmed' },
      cancelled: { text: '취소됨', class: 'cancelled' },
      completed: { text: '이용 완료', class: 'completed' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  const handleProfileUpdate = async () => {
    try {
      const response = await api.put('/users/me', profileData);
      
      // Update user in context and localStorage
      updateUser(profileData);
      
      alert('프로필이 수정되었습니다.');
      setIsEditingProfile(false);
    } catch (err) {
      alert(err.response?.data?.message || '프로필 수정에 실패했습니다.');
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
    let formattedPhone = '';

    if (value.length <= 3) {
      formattedPhone = value;
    } else if (value.length <= 7) {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length <= 11) {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7)}`;
    } else {
      formattedPhone = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setProfileData({ ...profileData, phone: formattedPhone });
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      alert('비밀번호가 변경되었습니다.');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      alert(err.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('정말로 회원 탈퇴하시겠습니까? 모든 데이터가 삭제됩니다.')) return;
    
    const confirmText = prompt('탈퇴하시려면 "탈퇴"를 입력하세요:');
    if (confirmText !== '탈퇴') {
      alert('탈퇴가 취소되었습니다.');
      return;
    }

    try {
      await api.delete('/users/me');
      alert('회원 탈퇴가 완료되었습니다.');
      logout();
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || '회원 탈퇴에 실패했습니다.');
    }
  };

  if (!user) return null;

  return (
    <div className="mypage">
      <div className="container">
        <div className="mypage-header">
          <h1>마이페이지</h1>
          <div className="user-info">
            <div className="info-card">
              <h3>{user.name}님</h3>
              <p>{user.email}</p>
              <div className="points-display">
                <span className="label">보유 포인트</span>
                <span className="amount">{(user.points || 0).toLocaleString()}P</span>
              </div>
            </div>
          </div>
        </div>

        <div className="tabs">
          <button 
            className={activeTab === 'reservations' ? 'active' : ''}
            onClick={() => setActiveTab('reservations')}
          >
            예약 내역
          </button>
          <button 
            className={activeTab === 'points' ? 'active' : ''}
            onClick={() => setActiveTab('points')}
          >
            포인트 내역
          </button>
          <button 
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            프로필 수정
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
              {activeTab === 'reservations' && (
                <div className="reservations-list">
                  {reservations.length === 0 ? (
                    <div className="empty">
                      <p>예약 내역이 없습니다.</p>
                      <button onClick={() => navigate('/hotels')} className="btn-primary">
                        호텔 둘러보기
                      </button>
                    </div>
                  ) : (
                    reservations.map(reservation => (
                      <div key={reservation._id} className="reservation-card">
                        <div className="card-header">
                          {getStatusBadge(reservation.status)}
                          <span className="reservation-date">
                            예약일: {new Date(reservation.createdAt).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        
                        <div className="card-body">
                          <div className="hotel-info">
                            <img 
                              src={reservation.hotelId?.images?.[0]?.url || '/placeholder-hotel.jpg'} 
                              alt={reservation.hotelId?.name}
                            />
                            <div className="details">
                              <h3>{reservation.hotelId?.name}</h3>
                              <p className="room-name">{reservation.roomId?.name}</p>
                              <p className="dates">
                                📅 {new Date(reservation.checkIn).toLocaleDateString('ko-KR')} ~ {new Date(reservation.checkOut).toLocaleDateString('ko-KR')}
                              </p>
                              <p className="guests">👥 {reservation.guests}명</p>
                            </div>
                          </div>
                          
                          <div className="price-info">
                            <span className="label">결제 금액</span>
                            <span className="amount">{reservation.totalPrice?.toLocaleString()}원</span>
                          </div>
                        </div>

                        <div className="card-actions">
                          {reservation.status === 'pending' && (
                            <>
                              <button 
                                className="btn-secondary"
                                onClick={() => navigate(`/payment/${reservation._id}`)}
                              >
                                결제하기
                              </button>
                              <button 
                                className="btn-cancel"
                                onClick={() => handleCancelReservation(reservation._id)}
                              >
                                예약 취소
                              </button>
                            </>
                          )}
                          {reservation.status === 'confirmed' && (
                            <button 
                              className="btn-cancel"
                              onClick={() => handleCancelReservation(reservation._id)}
                            >
                              예약 취소
                            </button>
                          )}
                          {reservation.status === 'completed' && (
                            <button 
                              className="btn-primary"
                              onClick={() => navigate(`/review/write/${reservation.hotelId?._id}/${reservation._id}`)}
                            >
                              리뷰 작성
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'points' && (
                <div className="points-section">
                  <div className="points-summary">
                    <h2>보유 포인트</h2>
                    <p className="balance">{(points?.balance || 0).toLocaleString()}P</p>
                  </div>

                  <div className="points-history">
                    <h3>포인트 내역</h3>
                    {!points?.history || points.history.length === 0 ? (
                      <p className="empty">포인트 내역이 없습니다.</p>
                    ) : (
                      <div className="history-list">
                        {points.history.map((item, index) => (
                          <div key={index} className="history-item">
                            <div className="info">
                              <span className="description">{item.description}</span>
                              <span className="date">
                                {new Date(item.date).toLocaleDateString('ko-KR')}
                              </span>
                            </div>
                            <span className={`amount ${item.type}`}>
                              {item.type === 'earned' ? '+' : '-'}{(item.amount || 0).toLocaleString()}P
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="profile-section">
                  <div className="profile-form">
                    <div className="form-header">
                      <h3>프로필 정보</h3>
                      {!isEditingProfile && (
                        <button 
                          className="btn-edit"
                          onClick={() => setIsEditingProfile(true)}
                        >
                          수정하기
                        </button>
                      )}
                    </div>
                    
                    <div className="form-group">
                      <label>이름</label>
                      <input 
                        type="text" 
                        value={isEditingProfile ? profileData.name : user.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>이메일</label>
                      <input type="email" value={user.email} readOnly className="readonly" />
                      <small>이메일은 변경할 수 없습니다</small>
                    </div>
                    
                    <div className="form-group">
                      <label>전화번호</label>
                      <input 
                        type="tel" 
                        value={isEditingProfile ? profileData.phone : (user.phone || '')}
                        onChange={handlePhoneChange}
                        placeholder="010-1234-5678"
                        readOnly={!isEditingProfile}
                        maxLength={13}
                      />
                    </div>
                    
                    {isEditingProfile ? (
                      <div className="button-group">
                        <button 
                          className="btn-primary"
                          onClick={handleProfileUpdate}
                        >
                          저장하기
                        </button>
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setProfileData({
                              name: user.name || '',
                              phone: user.phone || ''
                            });
                          }}
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="button-group">
                        <button 
                          className="btn-primary"
                          onClick={() => setShowPasswordModal(true)}
                        >
                          비밀번호 변경
                        </button>
                        <button className="btn-danger" onClick={logout}>로그아웃</button>
                      </div>
                    )}
                  </div>

                  <div className="danger-zone">
                    <h3>회원 탈퇴</h3>
                    <p>계정을 삭제하면 모든 정보가 영구적으로 삭제됩니다.</p>
                    <button 
                      className="btn-delete-account"
                      onClick={handleDeleteAccount}
                    >
                      회원 탈퇴
                    </button>
                  </div>

                  {/* Password Change Modal */}
                  {showPasswordModal && (
                    <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                          <h3>비밀번호 변경</h3>
                          <button 
                            className="modal-close"
                            onClick={() => setShowPasswordModal(false)}
                          >
                            ✕
                          </button>
                        </div>
                        
                        <div className="modal-body">
                          <div className="form-group">
                            <label>현재 비밀번호</label>
                            <input 
                              type="password"
                              value={passwordData.currentPassword}
                              onChange={(e) => setPasswordData({ 
                                ...passwordData, 
                                currentPassword: e.target.value 
                              })}
                              placeholder="현재 비밀번호를 입력하세요"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>새 비밀번호</label>
                            <input 
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({ 
                                ...passwordData, 
                                newPassword: e.target.value 
                              })}
                              placeholder="최소 6자 이상"
                            />
                          </div>
                          
                          <div className="form-group">
                            <label>새 비밀번호 확인</label>
                            <input 
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({ 
                                ...passwordData, 
                                confirmPassword: e.target.value 
                              })}
                              placeholder="새 비밀번호를 다시 입력하세요"
                            />
                          </div>
                        </div>
                        
                        <div className="modal-footer">
                          <button 
                            className="btn-primary"
                            onClick={handlePasswordChange}
                          >
                            변경하기
                          </button>
                          <button 
                            className="btn-secondary"
                            onClick={() => {
                              setShowPasswordModal(false);
                              setPasswordData({
                                currentPassword: '',
                                newPassword: '',
                                confirmPassword: ''
                              });
                            }}
                          >
                            취소
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;
