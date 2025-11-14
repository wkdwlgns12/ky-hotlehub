# HotelHub Backend

MERN 기반 호텔 예약 플랫폼 백엔드 API

## 기술 스택

- Node.js + Express
- MongoDB + Mongoose
- JWT 인증
- Kakao OAuth
- Toss Payments API

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm run dev

# 프로덕션 모드 실행
npm start
```

## 환경 변수

`.env` 파일에 다음 환경 변수를 설정하세요:

```
PORT=3000
MONGO_URI=your_mongodb_uri
FRONT_ORIGIN=http://localhost:5173
JWT_SECRET=your_jwt_secret
TOSS_SECRET_KEY=your_toss_secret
KAKAO_CLIENT_ID=your_kakao_client_id
KAKAO_CLIENT_SECRET=your_kakao_client_secret
KAKAO_REDIRECT_URI=your_kakao_redirect_uri
```

## API 엔드포인트

### 인증 (Auth)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/kakao` - 카카오 로그인
- `POST /api/auth/logout` - 로그아웃

### 사용자 (Users)
- `GET /api/users/me` - 내 정보 조회
- `PUT /api/users/me` - 내 정보 수정

### 호텔 (Hotels)
- `GET /api/hotels` - 호텔 목록 조회
- `GET /api/hotels/:id` - 호텔 상세 조회
- `POST /api/hotels` - 호텔 등록 (사업자)
- `PUT /api/hotels/:id` - 호텔 수정 (사업자)
- `DELETE /api/hotels/:id` - 호텔 삭제 (사업자)

### 예약 (Reservations)
- `GET /api/reservations` - 예약 목록 조회
- `POST /api/reservations` - 예약 생성
- `PUT /api/reservations/:id` - 예약 취소

### 결제 (Payments)
- `POST /api/payments/confirm` - Toss 결제 승인

### 리뷰 (Reviews)
- `GET /api/reviews` - 리뷰 목록 조회
- `POST /api/reviews` - 리뷰 작성
- `POST /api/reviews/:id/report` - 리뷰 신고

### 관리자 (Admin)
- `GET /api/admin/stats` - 통계 조회
- `GET /api/admin/users` - 사용자 관리
- `POST /api/admin/coupons` - 쿠폰 생성
