import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './ReviewWrite.scss';

const ReviewWrite = () => {
  const { hotelId, reservationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    rating: 5,
    content: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length + imagePreviews.length > 5) {
      alert('이미지는 최대 5장까지 업로드 가능합니다.');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await api.post('/upload/single', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        return {
          url: response.data.url,
          preview: URL.createObjectURL(file)
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages.map(img => img.url)]
      }));
      
      setImagePreviews(prev => [...prev, ...uploadedImages.map(img => img.preview)]);
    } catch (err) {
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.content.trim()) {
      setError('리뷰 내용을 입력해주세요.');
      return;
    }

    if (formData.content.length < 10) {
      setError('리뷰는 최소 10자 이상 작성해주세요.');
      return;
    }

    try {
      await api.post('/reviews', {
        hotelId,
        reservationId,
        rating: formData.rating,
        content: formData.content,
        images: formData.images
      });

      alert('리뷰가 등록되었습니다! 500P가 적립되었습니다.');
      navigate(`/hotels/${hotelId}`);
    } catch (err) {
      setError(err.response?.data?.message || '리뷰 등록에 실패했습니다.');
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="review-write-page">
      <div className="container">
        <h1>리뷰 작성</h1>
        <p className="subtitle">솔직한 후기를 작성해주시면 500P를 드립니다!</p>

        <form onSubmit={handleSubmit} className="review-form">
          {error && <div className="error-message">{error}</div>}

          {/* Rating */}
          <div className="form-section">
            <label className="section-label">평점 *</label>
            <div className="rating-selector">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star ${star <= formData.rating ? 'active' : ''}`}
                  onClick={() => handleRatingClick(star)}
                >
                  ★
                </button>
              ))}
              <span className="rating-text">{formData.rating}점</span>
            </div>
          </div>

          {/* Content */}
          <div className="form-section">
            <label className="section-label" htmlFor="content">
              리뷰 내용 * (최소 10자)
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="숙박 경험을 자세히 작성해주세요.&#10;&#10;- 객실 청결도는 어땠나요?&#10;- 직원 서비스는 만족스러우셨나요?&#10;- 편의시설은 잘 갖춰져 있었나요?&#10;- 위치와 접근성은 어땠나요?"
              rows="10"
              required
            />
            <div className="char-count">
              {formData.content.length}자 / 최소 10자
            </div>
          </div>

          {/* Images */}
          <div className="form-section">
            <label className="section-label">사진 추가 (선택, 최대 5장)</label>
            
            <div className="image-upload-section">
              {imagePreviews.length < 5 && (
                <label className="upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    disabled={uploading}
                  />
                  <div className="upload-placeholder">
                    {uploading ? '업로드 중...' : '+ 사진 추가'}
                  </div>
                </label>
              )}

              <div className="image-preview-list">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-image"
                      onClick={() => removeImage(index)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <p className="upload-notice">
              * JPG, PNG, GIF, WEBP 형식만 가능하며, 파일당 최대 5MB입니다.
            </p>
          </div>

          {/* Guidelines */}
          <div className="guidelines">
            <h3>리뷰 작성 가이드</h3>
            <ul>
              <li>실제 경험을 바탕으로 솔직하게 작성해주세요.</li>
              <li>욕설, 비방, 허위 사실 등이 포함된 경우 삭제될 수 있습니다.</li>
              <li>개인정보(연락처, 주소 등)는 포함하지 마세요.</li>
              <li>리뷰 등록 시 500P가 즉시 적립됩니다.</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="button-group">
            <button type="submit" className="btn-submit" disabled={uploading}>
              리뷰 등록하기
            </button>
            <button
              type="button"
              className="btn-cancel"
              onClick={() => navigate(-1)}
            >
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewWrite;
