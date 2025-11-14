import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './AddHotel.scss';

const AddHotel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    city: '',
    address: '',
    amenities: [],
    images: []
  });
  
  const [rooms, setRooms] = useState([{
    name: '',
    type: '일반',
    description: '',
    price: '',
    capacity: 2,
    inventory: 10,
    amenities: [],
    images: []
  }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadingImages, setUploadingImages] = useState(false);

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: '🌐' },
    { id: 'parking', label: '주차', icon: '🚗' },
    { id: 'pool', label: '수영장', icon: '🏊' },
    { id: 'fitness', label: '피트니스', icon: '💪' },
    { id: 'restaurant', label: '레스토랑', icon: '🍽️' },
    { id: 'bar', label: '바', icon: '🍸' },
    { id: 'spa', label: '스파', icon: '💆' },
    { id: 'sauna', label: '사우나', icon: '🧖' },
    { id: 'beach', label: '해변', icon: '🏖️' },
    { id: 'golf', label: '골프장', icon: '⛳' },
    { id: 'kids', label: '키즈클럽', icon: '👶' },
    { id: 'pets', label: '반려동물', icon: '🐕' }
  ];

  const cities = [
    '서울', '부산', '인천', '대구', '대전', '광주', '울산', '세종',
    '제주', '강릉', '속초', '경주', '전주', '여수', '포항'
  ];

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

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...rooms];
    updatedRooms[index][field] = value;
    setRooms(updatedRooms);
  };

  const handleRoomAmenityToggle = (roomIndex, amenityId) => {
    const updatedRooms = [...rooms];
    const room = updatedRooms[roomIndex];
    room.amenities = room.amenities.includes(amenityId)
      ? room.amenities.filter(a => a !== amenityId)
      : [...room.amenities, amenityId];
    setRooms(updatedRooms);
  };

  const addRoom = () => {
    setRooms([...rooms, {
      name: '',
      type: '일반',
      description: '',
      price: '',
      capacity: 2,
      inventory: 10,
      amenities: [],
      images: []
    }]);
  };

  const removeRoom = (index) => {
    if (rooms.length > 1) {
      setRooms(rooms.filter((_, i) => i !== index));
    }
  };

  const handleImageUrlAdd = () => {
    const url = prompt('이미지 URL을 입력하세요:');
    if (url) {
      setFormData({
        ...formData,
        images: [...formData.images, { url, alt: formData.name }]
      });
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Upload response:', response.data);

        return {
          url: `http://localhost:3000${response.data?.data?.url || response.data?.url}`,
          alt: file.name
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      alert(`${uploadedImages.length}개 이미지가 업로드되었습니다.`);
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
      console.error('Upload error:', err);
    } finally {
      setUploadingImages(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRoomImageUpload = async (roomIndex, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        console.log('Room upload response:', response.data);

        return {
          url: `http://localhost:3000${response.data?.data?.url || response.data?.url}`,
          alt: file.name
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      const updatedRooms = [...rooms];
      updatedRooms[roomIndex].images = [
        ...(updatedRooms[roomIndex].images || []),
        ...uploadedImages
      ];
      setRooms(updatedRooms);

      alert(`${uploadedImages.length}개 객실 이미지가 업로드되었습니다.`);
    } catch (err) {
      setError('이미지 업로드에 실패했습니다.');
      console.error('Upload error:', err);
    } finally {
      setUploadingImages(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRoomImageUrlAdd = (roomIndex) => {
    const url = prompt('객실 이미지 URL을 입력하세요:');
    if (url) {
      const updatedRooms = [...rooms];
      updatedRooms[roomIndex].images = [
        ...(updatedRooms[roomIndex].images || []),
        { url, alt: updatedRooms[roomIndex].name || '객실 이미지' }
      ];
      setRooms(updatedRooms);
    }
  };

  const removeRoomImage = (roomIndex, imageIndex) => {
    const updatedRooms = [...rooms];
    updatedRooms[roomIndex].images = updatedRooms[roomIndex].images.filter(
      (_, i) => i !== imageIndex
    );
    setRooms(updatedRooms);
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name || !formData.city || !formData.address) {
      setError('필수 항목을 모두 입력해주세요.');
      return;
    }

    if (formData.images.length === 0) {
      setError('최소 1개 이상의 호텔 이미지를 추가해주세요.');
      return;
    }

    if (rooms.some(r => !r.name || !r.price)) {
      setError('모든 객실의 이름과 가격을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const hotelData = {
        name: formData.name,
        description: formData.description,
        location: {
          city: formData.city,
          address: formData.address
        },
        amenities: formData.amenities,
        images: formData.images,
        rooms: rooms.map(room => ({
          name: room.name,
          type: room.type || '일반',
          description: room.description,
          price: Number(room.price),
          capacity: Number(room.capacity),
          amenities: room.amenities,
          images: room.images || [],
          inventory: Number(room.inventory) || 10
        })),
        owner: user.id,
        status: 'pending'
      };

      await api.post('/hotels', hotelData);
      alert('호텔이 등록되었습니다. 관리자 승인 후 서비스에 노출됩니다.');
      navigate('/business/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || '호텔 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'business' || !user.businessApproved) {
    navigate('/');
    return null;
  }

  return (
    <div className="add-hotel-page">
      <div className="container">
        <div className="page-header">
          <h1>🏨 호텔 등록</h1>
          <p>새로운 숙소를 등록하고 관리하세요</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="hotel-form">
          {/* 기본 정보 */}
          <section className="form-section">
            <h2>기본 정보</h2>
            
            <div className="form-group">
              <label>호텔명 *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="예: 서울 그랜드 호텔"
                required
              />
            </div>

            <div className="form-group">
              <label>호텔 소개</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="호텔에 대한 상세한 설명을 입력하세요"
                rows={5}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>도시 *</label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                >
                  <option value="">선택하세요</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>주소 *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="상세 주소를 입력하세요"
                  required
                />
              </div>
            </div>
          </section>

          {/* 호텔 편의시설 */}
          <section className="form-section">
            <h2>호텔 편의시설</h2>
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

          {/* 호텔 이미지 */}
          <section className="form-section">
            <h2>호텔 이미지 *</h2>
            <p className="helper-text">호텔의 외관, 로비, 시설 등의 이미지를 추가하세요</p>
            
            <div className="upload-buttons">
              <label className="btn-upload">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                  style={{ display: 'none' }}
                />
                {uploadingImages ? '업로드 중...' : '📷 이미지 업로드'}
              </label>
              
              <button type="button" className="btn-add-url" onClick={handleImageUrlAdd}>
                🔗 URL 추가
              </button>
            </div>

            {formData.images.length > 0 && (
              <div className="images-preview">
                {formData.images.map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={img.url} alt={img.alt} />
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* 객실 정보 */}
          <section className="form-section">
            <div className="section-header">
              <h2>객실 정보</h2>
              <button type="button" className="btn-add-room" onClick={addRoom}>
                + 객실 추가
              </button>
            </div>

            {rooms.map((room, index) => (
              <div key={index} className="room-card">
                <div className="room-header">
                  <h3>객실 #{index + 1}</h3>
                  {rooms.length > 1 && (
                    <button
                      type="button"
                      className="btn-remove-room"
                      onClick={() => removeRoom(index)}
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>객실명 *</label>
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                      placeholder="예: 디럭스 더블룸"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>객실 타입 *</label>
                    <select
                      value={room.type}
                      onChange={(e) => handleRoomChange(index, 'type', e.target.value)}
                      required
                    >
                      <option value="일반">일반</option>
                      <option value="디럭스">디럭스</option>
                      <option value="스위트">스위트</option>
                      <option value="프리미엄">프리미엄</option>
                      <option value="이그제큐티브">이그제큐티브</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>가격 (1박) *</label>
                    <input
                      type="number"
                      value={room.price}
                      onChange={(e) => handleRoomChange(index, 'price', e.target.value)}
                      placeholder="100000"
                      min="0"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>최대 인원 *</label>
                    <input
                      type="number"
                      value={room.capacity}
                      onChange={(e) => handleRoomChange(index, 'capacity', e.target.value)}
                      min="1"
                      max="10"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>재고 수량 *</label>
                    <input
                      type="number"
                      value={room.inventory}
                      onChange={(e) => handleRoomChange(index, 'inventory', e.target.value)}
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>객실 설명</label>
                  <textarea
                    value={room.description}
                    onChange={(e) => handleRoomChange(index, 'description', e.target.value)}
                    placeholder="객실에 대한 설명을 입력하세요"
                    rows={3}
                  />
                </div>

                <div className="form-group">
                  <label>객실 편의시설</label>
                  <div className="amenities-grid small">
                    {amenitiesList.slice(0, 8).map(amenity => (
                      <button
                        key={amenity.id}
                        type="button"
                        className={`amenity-btn ${room.amenities.includes(amenity.id) ? 'active' : ''}`}
                        onClick={() => handleRoomAmenityToggle(index, amenity.id)}
                      >
                        <span className="icon">{amenity.icon}</span>
                        <span className="label">{amenity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>객실 이미지</label>
                  <div className="upload-buttons">
                    <label className="btn-upload">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleRoomImageUpload(index, e)}
                        disabled={uploadingImages}
                        style={{ display: 'none' }}
                      />
                      {uploadingImages ? '업로드 중...' : '📷 이미지 업로드'}
                    </label>
                    
                    <button 
                      type="button" 
                      className="btn-add-url" 
                      onClick={() => handleRoomImageUrlAdd(index)}
                    >
                      🔗 URL 추가
                    </button>
                  </div>

                  {room.images && room.images.length > 0 && (
                    <div className="images-preview small">
                      {room.images.map((img, imgIndex) => (
                        <div key={imgIndex} className="image-item">
                          <img src={img.url} alt={img.alt} />
                          <button
                            type="button"
                            className="btn-remove"
                            onClick={() => removeRoomImage(index, imgIndex)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '등록 중...' : '호텔 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddHotel;
