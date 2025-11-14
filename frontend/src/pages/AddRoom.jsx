import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AddRoom.scss';

const AddRoom = () => {
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const { user } = useAuth();
  
  const [hotel, setHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '일반',
    description: '',
    price: '',
    originalPrice: '',
    discountRate: 0,
    isOnSale: false,
    capacity: 2,
    inventory: 10,
    amenities: [],
    images: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: '🌐' },
    { id: 'tv', label: 'TV', icon: '📺' },
    { id: 'minibar', label: '미니바', icon: '🍷' },
    { id: 'balcony', label: '발코니', icon: '🏞️' },
    { id: 'bathtub', label: '욕조', icon: '🛁' },
    { id: 'aircon', label: '에어컨', icon: '❄️' },
    { id: 'safe', label: '금고', icon: '🔒' },
    { id: 'breakfast', label: '조식', icon: '🍳' }
  ];

  useEffect(() => {
    if (!user || user.role !== 'business' || !user.businessApproved) {
      navigate('/');
      return;
    }
    fetchHotel();
  }, [user, hotelId]);

  const fetchHotel = async () => {
    try {
      const response = await api.get(`/hotels/${hotelId}`);
      const hotelData = response.data?.data || response.data;
      
      // Check if user owns this hotel
      if (hotelData.owner?._id !== user.id && hotelData.owner !== user.id) {
        alert('권한이 없습니다.');
        navigate('/business/dashboard');
        return;
      }
      
      setHotel(hotelData);
    } catch (err) {
      alert('호텔 정보를 불러오는데 실패했습니다.');
      navigate('/business/dashboard');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAmenityToggle = (amenityId) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.includes(amenityId)
        ? formData.amenities.filter(a => a !== amenityId)
        : [...formData.amenities, amenityId]
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const formDataUpload = new FormData();
        formDataUpload.append('image', file);

        const response = await api.post('/upload/single', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        return {
          url: `http://localhost:3000${response.data?.data?.url || response.data?.url}`,
          alt: file.name
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedImages]
      });

      alert(`${uploadedImages.length}개 이미지가 업로드되었습니다.`);
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
      console.error('Upload error:', err);
    } finally {
      setUploadingImages(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.price) {
      setError('객실명과 가격은 필수 항목입니다.');
      return;
    }

    if (formData.images.length === 0) {
      setError('최소 1개 이상의 객실 이미지를 추가해주세요.');
      return;
    }

    setLoading(true);

    try {
      const roomData = {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        discountRate: Number(formData.discountRate),
        isOnSale: formData.isOnSale,
        capacity: Number(formData.capacity),
        inventory: Number(formData.inventory),
        amenities: formData.amenities,
        images: formData.images
      };

      await api.post(`/hotels/${hotelId}/rooms`, roomData);
      alert('객실이 등록되었습니다.');
      navigate('/business/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '객실 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!hotel) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="add-room-page">
      <div className="container">
        <div className="page-header">
          <h1>🛏️ 객실 등록</h1>
          <p>{hotel.name}에 새로운 객실을 추가합니다</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="room-form">
          {/* 기본 정보 */}
          <section className="form-section">
            <h2>기본 정보</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label>객실명 *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="예: 디럭스 더블룸"
                  required
                />
              </div>

              <div className="form-group">
                <label>객실 타입 *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="일반">일반</option>
                  <option value="디럭스">디럭스</option>
                  <option value="스위트">스위트</option>
                  <option value="프리미엄">프리미엄</option>
                  <option value="이그제큐티브">이그제큐티브</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>객실 설명</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="객실에 대한 설명을 입력하세요"
                rows={4}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>판매 가격 (1박) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="100000"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>원가 (할인 전 가격)</label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={(e) => {
                    const original = Number(e.target.value);
                    const current = Number(formData.price);
                    const discount = original > 0 && current > 0 
                      ? Math.round((1 - current / original) * 100)
                      : 0;
                    
                    setFormData({
                      ...formData,
                      originalPrice: e.target.value,
                      discountRate: discount,
                      isOnSale: discount > 0
                    });
                  }}
                  placeholder="150000"
                  min="0"
                />
              </div>
            </div>

            {formData.isOnSale && (
              <div className="discount-info">
                🎉 <strong>{formData.discountRate}% 할인</strong> 이벤트 진행중!
                (원가: {Number(formData.originalPrice).toLocaleString()}원 → 판매가: {Number(formData.price).toLocaleString()}원)
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>최대 인원 *</label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>재고 수량 *</label>
                <input
                  type="number"
                  name="inventory"
                  value={formData.inventory}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>
          </section>

          {/* 편의시설 */}
          <section className="form-section">
            <h2>객실 편의시설</h2>
            <div className="amenities-grid">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  className={`amenity-btn ${formData.amenities.includes(amenity.id) ? 'active' : ''}`}
                  onClick={() => handleAmenityToggle(amenity.id)}
                >
                  <span className="icon">{amenity.icon}</span>
                  <span className="label">{amenity.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* 객실 이미지 */}
          <section className="form-section">
            <h2>객실 이미지 *</h2>
            <div className="image-upload">
              <label className="upload-btn">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
                {uploadingImages ? '업로드 중...' : '+ 이미지 선택'}
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="images-preview">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img.url} alt={img.alt} />
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 제출 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate('/business/dashboard')}
            >
              취소
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? '등록 중...' : '객실 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoom;
