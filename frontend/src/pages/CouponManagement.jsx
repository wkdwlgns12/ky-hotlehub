import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import './CouponManagement.scss';

const CouponManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '100'
  });

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'business')) {
      navigate('/');
      return;
    }
    fetchCoupons();
  }, [user, navigate]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coupons/my');
      setCoupons(response.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
      alert('쿠폰 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.code || !formData.name || !formData.discountValue || !formData.validFrom || !formData.validUntil) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.discountType === 'percentage' && (formData.discountValue <= 0 || formData.discountValue > 100)) {
      alert('퍼센트 할인은 1~100 사이의 값이어야 합니다.');
      return;
    }

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon._id}`, formData);
        alert('쿠폰이 수정되었습니다.');
      } else {
        await api.post('/coupons', formData);
        alert('쿠폰이 생성되었습니다.');
      }
      
      setShowCreateForm(false);
      setEditingCoupon(null);
      resetForm();
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || '쿠폰 저장에 실패했습니다.');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchase: '',
      maxDiscount: '',
      validFrom: '',
      validUntil: '',
      usageLimit: '100'
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || '',
      maxDiscount: coupon.maxDiscount || '',
      validFrom: new Date(coupon.validFrom).toISOString().split('T')[0],
      validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
      usageLimit: coupon.usageLimit,
      isActive: coupon.isActive
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;

    try {
      await api.delete(`/coupons/${id}`);
      alert('쿠폰이 삭제되었습니다.');
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || '쿠폰 삭제에 실패했습니다.');
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await api.put(`/coupons/${coupon._id}`, {
        isActive: !coupon.isActive
      });
      fetchCoupons();
    } catch (error) {
      alert('쿠폰 상태 변경에 실패했습니다.');
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    alert(`쿠폰 코드 "${code}"가 복사되었습니다!`);
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% 할인`;
    } else {
      return `${coupon.discountValue.toLocaleString()}원 할인`;
    }
  };

  const isExpired = (coupon) => {
    return new Date(coupon.validUntil) < new Date();
  };

  const isUpcoming = (coupon) => {
    return new Date(coupon.validFrom) > new Date();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="coupon-management-page">
      <div className="container">
        <div className="page-header">
          <h1>🎟️ 쿠폰 관리</h1>
          <button 
            className="btn-create"
            onClick={() => {
              setShowCreateForm(true);
              setEditingCoupon(null);
              resetForm();
            }}
          >
            + 새 쿠폰 만들기
          </button>
        </div>

        {showCreateForm && (
          <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingCoupon ? '쿠폰 수정' : '새 쿠폰 만들기'}</h2>
                <button className="btn-close" onClick={() => setShowCreateForm(false)}>×</button>
              </div>

              <form onSubmit={handleSubmit} className="coupon-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>쿠폰 코드 *</label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="예: WELCOME2024"
                      disabled={!!editingCoupon}
                      required
                    />
                    <small>영문, 숫자 조합 (자동 대문자 변환)</small>
                  </div>

                  <div className="form-group">
                    <label>쿠폰 이름 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="예: 신규 회원 환영 쿠폰"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>설명</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="쿠폰에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>할인 유형 *</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      disabled={!!editingCoupon}
                      required
                    >
                      <option value="percentage">퍼센트 할인 (%)</option>
                      <option value="fixed">고정 금액 할인 (원)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>할인 값 *</label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'percentage' ? '1~100' : '금액'}
                      disabled={!!editingCoupon}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>최소 구매 금액</label>
                    <input
                      type="number"
                      name="minPurchase"
                      value={formData.minPurchase}
                      onChange={handleInputChange}
                      placeholder="0 (제한 없음)"
                    />
                  </div>

                  {formData.discountType === 'percentage' && (
                    <div className="form-group">
                      <label>최대 할인 금액</label>
                      <input
                        type="number"
                        name="maxDiscount"
                        value={formData.maxDiscount}
                        onChange={handleInputChange}
                        placeholder="미입력 시 제한 없음"
                      />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>시작일 *</label>
                    <input
                      type="date"
                      name="validFrom"
                      value={formData.validFrom}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>종료일 *</label>
                    <input
                      type="date"
                      name="validUntil"
                      value={formData.validUntil}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>사용 가능 횟수</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                  />
                  <small>여러 사용자가 사용할 수 있는 총 횟수</small>
                </div>

                {editingCoupon && (
                  <div className="form-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      />
                      활성화
                    </label>
                  </div>
                )}

                <div className="form-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>
                    취소
                  </button>
                  <button type="submit" className="btn-submit">
                    {editingCoupon ? '수정' : '생성'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="coupons-grid">
          {coupons.length === 0 ? (
            <div className="empty-state">
              <p>생성된 쿠폰이 없습니다.</p>
              <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
                첫 쿠폰 만들기
              </button>
            </div>
          ) : (
            coupons.map(coupon => (
              <div key={coupon._id} className={`coupon-card ${!coupon.isActive ? 'inactive' : ''} ${isExpired(coupon) ? 'expired' : ''}`}>
                <div className="coupon-header">
                  <div className="coupon-code" onClick={() => copyToClipboard(coupon.code)}>
                    {coupon.code}
                    <span className="copy-icon">📋</span>
                  </div>
                  <div className="coupon-status">
                    {isExpired(coupon) && <span className="badge expired">만료됨</span>}
                    {isUpcoming(coupon) && <span className="badge upcoming">예정</span>}
                    {!coupon.isActive && <span className="badge inactive">비활성</span>}
                    {coupon.isActive && !isExpired(coupon) && !isUpcoming(coupon) && (
                      <span className="badge active">사용 가능</span>
                    )}
                  </div>
                </div>

                <div className="coupon-body">
                  <h3>{coupon.name}</h3>
                  {coupon.description && <p className="description">{coupon.description}</p>}
                  
                  <div className="coupon-details">
                    <div className="detail-item">
                      <span className="label">할인:</span>
                      <span className="value discount">{getDiscountText(coupon)}</span>
                    </div>
                    {coupon.minPurchase > 0 && (
                      <div className="detail-item">
                        <span className="label">최소 구매:</span>
                        <span className="value">{coupon.minPurchase.toLocaleString()}원</span>
                      </div>
                    )}
                    {coupon.maxDiscount && (
                      <div className="detail-item">
                        <span className="label">최대 할인:</span>
                        <span className="value">{coupon.maxDiscount.toLocaleString()}원</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="label">기간:</span>
                      <span className="value">
                        {new Date(coupon.validFrom).toLocaleDateString('ko-KR')} ~ {new Date(coupon.validUntil).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="label">사용:</span>
                      <span className="value">{coupon.usedCount} / {coupon.usageLimit}회</span>
                    </div>
                  </div>
                </div>

                <div className="coupon-actions">
                  <button 
                    className={`btn-toggle ${coupon.isActive ? 'active' : 'inactive'}`}
                    onClick={() => handleToggleActive(coupon)}
                    disabled={isExpired(coupon)}
                  >
                    {coupon.isActive ? '비활성화' : '활성화'}
                  </button>
                  <button className="btn-edit" onClick={() => handleEdit(coupon)}>
                    수정
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(coupon._id)}>
                    삭제
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponManagement;
