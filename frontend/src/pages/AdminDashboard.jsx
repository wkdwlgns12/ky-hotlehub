import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AdminDashboard.scss';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      switch (activeTab) {
        case 'stats':
          const statsRes = await api.get('/admin/stats');
          setStats(statsRes.data.data || statsRes.data);
          break;
        case 'users':
          const usersRes = await api.get('/admin/users');
          setUsers(usersRes.data.data || usersRes.data);
          break;
        case 'hotels':
          const hotelsRes = await api.get('/admin/hotels');
          setHotels(hotelsRes.data.data || hotelsRes.data);
          break;
        case 'reviews':
          const reviewsRes = await api.get('/reviews/admin/reported');
          setReviews(reviewsRes.data.data || reviewsRes.data);
          break;
        case 'coupons':
          const couponsRes = await api.get('/admin/coupons');
          setCoupons(couponsRes.data.data || couponsRes.data);
          break;
        case 'inquiries':
          const inquiriesRes = await api.get('/support/inquiries');
          setInquiries(inquiriesRes.data.data || inquiriesRes.data);
          break;
      }
    } catch (err) {
      setError('데이터를 불러오는데 실패했습니다.');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/approve`);
      alert('사업자가 승인되었습니다.');
      fetchData();
    } catch (err) {
      alert('승인에 실패했습니다.');
    }
  };

  const handleBlockUser = async (userId) => {
    if (!window.confirm('이 사용자를 차단하시겠습니까?')) return;
    try {
      await api.put(`/admin/users/${userId}/block`);
      alert('사용자가 차단되었습니다.');
      fetchData();
    } catch (err) {
      alert('차단에 실패했습니다.');
    }
  };

  const handleApproveHotel = async (hotelId) => {
    try {
      await api.put(`/admin/hotels/${hotelId}/status`, { status: 'approved' });
      alert('호텔이 승인되었습니다.');
      fetchData();
    } catch (err) {
      alert('승인에 실패했습니다.');
    }
  };

  const handleRejectHotel = async (hotelId) => {
    if (!window.confirm('이 호텔을 거부하시겠습니까?')) return;
    try {
      await api.put(`/admin/hotels/${hotelId}/status`, { status: 'rejected' });
      alert('호텔이 거부되었습니다.');
      fetchData();
    } catch (err) {
      alert('거부에 실패했습니다.');
    }
  };

  const handleResolveReport = async (reviewId) => {
    if (!window.confirm('신고를 처리하시겠습니까?')) return;
    try {
      await api.put(`/admin/reviews/${reviewId}/report`, { resolved: true });
      alert('신고가 처리되었습니다.');
      fetchData();
    } catch (err) {
      alert('처리에 실패했습니다.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('리뷰를 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      alert('리뷰가 삭제되었습니다.');
      fetchData();
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  const handleCreateCoupon = async () => {
    const code = prompt('쿠폰 코드를 입력하세요:');
    if (!code) return;

    const discount = parseInt(prompt('할인 금액을 입력하세요 (원):'));
    if (!discount || discount <= 0) {
      alert('올바른 금액을 입력하세요.');
      return;
    }

    const expiresAt = prompt('만료일을 입력하세요 (YYYY-MM-DD):');
    if (!expiresAt) return;

    try {
      await api.post('/admin/coupons', {
        code,
        discount,
        expiresAt
      });
      alert('쿠폰이 생성되었습니다.');
      fetchData();
    } catch (err) {
      alert('쿠폰 생성에 실패했습니다.');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('쿠폰을 삭제하시겠습니까?')) return;
    try {
      await api.delete(`/admin/coupons/${couponId}`);
      alert('쿠폰이 삭제되었습니다.');
      fetchData();
    } catch (err) {
      alert('삭제에 실패했습니다.');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>관리자 대시보드</h1>

        <div className="tabs">
          <button 
            className={activeTab === 'stats' ? 'active' : ''}
            onClick={() => setActiveTab('stats')}
          >
            통계
          </button>
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            사용자 관리
          </button>
          <button 
            className={activeTab === 'hotels' ? 'active' : ''}
            onClick={() => setActiveTab('hotels')}
          >
            호텔 승인
          </button>
          <button 
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            신고 리뷰
          </button>
          <button 
            className={activeTab === 'coupons' ? 'active' : ''}
            onClick={() => navigate('/coupons/manage')}
          >
            🎟️ 쿠폰 생성
          </button>
          <button 
            className={activeTab === 'inquiries' ? 'active' : ''}
            onClick={() => setActiveTab('inquiries')}
          >
            고객 문의
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
              {activeTab === 'stats' && (
                <div className="stats-section">
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="icon">👥</div>
                      <div className="info">
                        <span className="label">총 회원자</span>
                        <span className="value">{((stats.overview?.totalUsers || 0) + (stats.overview?.totalBusinesses || 0))}명</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="icon">🏨</div>
                      <div className="info">
                        <span className="label">총 호텔</span>
                        <span className="value">{stats.overview?.totalHotels || 0}개</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="icon">📅</div>
                      <div className="info">
                        <span className="label">총 예약</span>
                        <span className="value">{stats.overview?.totalReservations || 0}건</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="icon">💰</div>
                      <div className="info">
                        <span className="label">총 매출</span>
                        <span className="value">{(stats.overview?.totalRevenue || 0).toLocaleString()}원</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="icon">⭐</div>
                      <div className="info">
                        <span className="label">총 리뷰</span>
                        <span className="value">{stats.overview?.totalReviews || 0}개</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="icon">🏢</div>
                      <div className="info">
                        <span className="label">승인 대기 사업자</span>
                        <span className="value">{stats.pending?.pendingBusinesses || 0}명</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'users' && (
                <div className="users-section">
                  <h2>사용자 목록</h2>
                  {users.length === 0 ? (
                    <div className="empty">사용자가 없습니다.</div>
                  ) : (
                    <div className="table-container">
                      <table>
                        <thead>
                          <tr>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>역할</th>
                            <th>사업자명</th>
                            <th>승인 상태</th>
                            <th>가입일</th>
                            <th>관리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map(user => (
                            <tr key={user._id}>
                              <td>{user.name}</td>
                              <td>{user.email}</td>
                              <td>{user.role === 'business' ? '사업자' : user.role === 'admin' ? '관리자' : '일반'}</td>
                              <td>{user.businessName || '-'}</td>
                              <td>
                                {user.role === 'business' && (
                                  <span className={`badge ${user.businessApproved ? 'approved' : 'pending'}`}>
                                    {user.businessApproved ? '승인됨' : '승인 대기'}
                                  </span>
                                )}
                              </td>
                              <td>{new Date(user.createdAt).toLocaleDateString('ko-KR')}</td>
                              <td>
                                <div className="action-buttons">
                                  {user.role === 'business' && !user.businessApproved && (
                                    <button 
                                      className="btn-approve"
                                      onClick={() => handleApproveUser(user._id)}
                                    >
                                      승인
                                    </button>
                                  )}
                                  <button 
                                    className="btn-block"
                                    onClick={() => handleBlockUser(user._id)}
                                  >
                                    차단
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'hotels' && (
                <div className="hotels-section">
                  <h2>호텔 승인 관리</h2>
                  {hotels.length === 0 ? (
                    <div className="empty">승인 대기 중인 호텔이 없습니다.</div>
                  ) : (
                    <div className="hotels-grid">
                      {hotels.map(hotel => (
                        <div key={hotel._id} className="hotel-card">
                          <img src={hotel.images?.[0]?.url || '/placeholder-hotel.jpg'} alt={hotel.name} />
                          <div className="card-body">
                            <h3>{hotel.name}</h3>
                            <p className="location">📍 {hotel.location?.city}</p>
                            <p className="business">🏢 {hotel.businessId?.businessName}</p>
                            <span className={`status-badge ${hotel.status}`}>
                              {hotel.status === 'pending' ? '승인 대기' : hotel.status === 'approved' ? '승인됨' : '거부됨'}
                            </span>
                            <div className="actions">
                              <button 
                                className="btn-approve"
                                onClick={() => handleApproveHotel(hotel._id)}
                                disabled={hotel.status === 'approved'}
                              >
                                승인
                              </button>
                              <button 
                                className="btn-reject"
                                onClick={() => handleRejectHotel(hotel._id)}
                                disabled={hotel.status === 'rejected'}
                              >
                                {hotel.status === 'rejected' ? '거절됨' : '거절'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="reviews-section">
                  <h2>신고된 리뷰</h2>
                  {reviews.length === 0 ? (
                    <div className="empty">신고된 리뷰가 없습니다.</div>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map(review => (
                        <div key={review._id} className="review-card">
                          <div className="review-header">
                            <span className="author">{review.userId?.name}</span>
                            <span className="rating">⭐ {review.rating}</span>
                          </div>
                          <p className="content">{review.content}</p>
                          <p className="hotel">호텔: {review.hotelId?.name}</p>
                          <p className="reports">신고 횟수: {review.reportCount || 0}회</p>
                          <div className="actions">
                            <button 
                              className="btn-resolve"
                              onClick={() => handleResolveReport(review._id)}
                            >
                              신고 처리
                            </button>
                            <button 
                              className="btn-delete"
                              onClick={() => handleDeleteReview(review._id)}
                            >
                              리뷰 삭제
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'coupons' && (
                <div className="coupons-section">
                  <div className="section-header">
                    <h2>쿠폰 관리</h2>
                    <button className="btn-create" onClick={handleCreateCoupon}>
                      + 쿠폰 생성
                    </button>
                  </div>
                  {coupons.length === 0 ? (
                    <div className="empty">생성된 쿠폰이 없습니다.</div>
                  ) : (
                    <div className="coupons-grid">
                      {coupons.map(coupon => (
                        <div key={coupon._id} className="coupon-card">
                          <div className="coupon-code">{coupon.code}</div>
                          <div className="coupon-info">
                            <p className="discount">{coupon.discount.toLocaleString()}원 할인</p>
                            <p className="expires">
                              만료: {new Date(coupon.expiresAt).toLocaleDateString('ko-KR')}
                            </p>
                            <p className="status">
                              {coupon.isActive ? '✅ 활성' : '❌ 비활성'}
                            </p>
                          </div>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteCoupon(coupon._id)}
                          >
                            삭제
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'inquiries' && (
                <div className="inquiries-section">
                  <h2>고객 문의 관리</h2>
                  {inquiries.length === 0 ? (
                    <div className="empty">접수된 문의가 없습니다.</div>
                  ) : (
                    <div className="table-wrapper">
                      <table>
                        <thead>
                          <tr>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>유형</th>
                            <th>제목</th>
                            <th>상태</th>
                            <th>등록일</th>
                            <th>작업</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inquiries.map(inquiry => (
                            <tr key={inquiry._id}>
                              <td>{inquiry.name}</td>
                              <td>{inquiry.email}</td>
                              <td>
                                {inquiry.category === 'general' ? '일반' :
                                 inquiry.category === 'reservation' ? '예약' :
                                 inquiry.category === 'payment' ? '결제/환불' :
                                 inquiry.category === 'account' ? '계정' :
                                 inquiry.category === 'business' ? '사업자' :
                                 inquiry.category === 'technical' ? '기술지원' : '기타'}
                              </td>
                              <td>{inquiry.subject}</td>
                              <td>
                                <span className={`badge ${inquiry.status}`}>
                                  {inquiry.status === 'pending' ? '대기' :
                                   inquiry.status === 'in-progress' ? '처리중' :
                                   inquiry.status === 'resolved' ? '해결' : '완료'}
                                </span>
                              </td>
                              <td>{new Date(inquiry.createdAt).toLocaleDateString('ko-KR')}</td>
                              <td>
                                <button 
                                  className="btn-view"
                                  onClick={() => {
                                    alert(`문의 내용:\n\n${inquiry.message}\n\n답변: ${inquiry.adminReply || '아직 답변이 없습니다.'}`);
                                  }}
                                >
                                  보기
                                </button>
                              </td>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
