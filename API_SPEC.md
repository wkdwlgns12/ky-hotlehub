# HotelTeamProject API Specification

이 문서는 프로젝트에 구현된 REST API의 통합 명세서입니다. 각 엔드포인트는 경로, HTTP 메서드, 인증 요구사항, 주요 파라미터 및 동작 요약을 포함합니다.

베이스 URL: `/api`

공통 응답 형식 (성공):
{
  "success": true,
  "data": ...,
  "message": "..."
}

공통 오류 형식:
{
  "success": false,
  "message": "...",
  "error": "..."
}

---

**Auth**
- **POST /api/auth/register**: 사용자/사업자 등록
  - 인증: Public
  - Body: `{ email, password, name, phone?, role?, businessName?, businessNumber? }`
  - 성공: `201` 생성된 사용자 + `token`

- **POST /api/auth/login**: 로그인
  - 인증: Public
  - Body: `{ email, password }`
  - 성공: `200` 토큰 + 사용자 정보 (쿠키 `token` 설정)

- **GET /api/auth/kakao**: 카카오 OAuth 시작 (리다이렉트)
  - 인증: Public

- **GET /api/auth/kakao/callback**: 카카오 콜백
  - 인증: Public
  - 동작: 카카오로부터 프로필을 받아 사용자 생성/업데이트, 프론트엔드로 리다이렉트(`?token=`)

- **POST /api/auth/logout**: 로그아웃
  - 인증: Private

---

**Users** (`/api/users`)
- **GET /api/users/me**: 현재 사용자 프로필 조회
  - 인증: Private
  - Response: 사용자 정보 (`password` 제외)

- **PUT /api/users/me**: 프로필 업데이트
  - 인증: Private
  - Body: `{ name?, phone? }`

- **PUT /api/users/me/password**: 비밀번호 변경
  - 인증: Private
  - Body: `{ currentPassword, newPassword }`

- **GET /api/users/me/points**: 포인트 잔액 및 히스토리
  - 인증: Private
  - Response: `{ balance, history: [...] }`

- **POST /api/users/me/points**: 포인트 추가 (테스트/관리용)
  - 인증: Private
  - Body: `{ amount, description, type = 'earned'|'used' }`

- **DELETE /api/users/me**: 계정 삭제
  - 인증: Private

---

**Upload** (`/api/upload`)
- **POST /api/upload/single**: 단일 이미지 업로드
  - 인증: Private
  - FormData: `image` (file)
  - Response: `{ filename, url, size }`

- **POST /api/upload/multiple**: 다중 이미지 업로드 (최대 10)
  - 인증: Private
  - FormData: `images[]`
  - Response: `[{ filename, url, size }, ...]`

---

**Hotels & Rooms** (`/api/hotels`, `/api/rooms`)
- **GET /api/hotels**: 호텔 목록 (필터/페이징)
  - 인증: Public
  - Query: `city, minPrice, maxPrice, amenities (csv), rating, search, ownerId, page, limit`
  - Response: 호텔 리스트 + `lowestPrice` 정보

- **GET /api/hotels/:id**: 호텔 상세
  - 인증: Public

- **POST /api/hotels**: 호텔 생성
  - 인증: Private (role: `business` 또는 `admin`, 사업자는 승인 필요)
  - Body: `{ name, description, location, images, amenities, rooms? }`

- **PUT /api/hotels/:id**: 호텔 수정
  - 인증: Private (오너 또는 admin)

- **DELETE /api/hotels/:id**: 호텔 삭제
  - 인증: Private (오너 또는 admin)

- **GET /api/hotels/:id/rooms**: 호텔의 룸 목록
  - 인증: Public

- **POST /api/hotels/:id/rooms**: 호텔에 룸 추가
  - 인증: Private (business/owner/admin)
  - Body: `{ name, type, price, capacity, inventory, ... }`

- **PUT /api/rooms/:id**: 룸 수정
  - 인증: Private (오너 또는 admin)

- **DELETE /api/rooms/:id**: 룸 삭제
  - 인증: Private (오너 또는 admin)

---

**Reservations** (`/api/reservations`)
- **GET /api/reservations**: 사용자의 예약 목록
  - 인증: Private
  - Query: `status, page, limit`

- **GET /api/reservations/:id**: 예약 상세
  - 인증: Private (예약 소유자, 호텔 오너 또는 admin)

- **POST /api/reservations**: 예약 생성
  - 인증: Private
  - Body: `{ hotelId, roomId, checkIn, checkOut, guests, usedPoints?, couponCode? }`
  - 동작: 재고 차감, 포인트/쿠폰 적용, 결제 대기(`status: 'pending'`)

- **PUT /api/reservations/:id/cancel**: 예약 취소
  - 인증: Private (소유자 또는 admin)
  - 동작: 재고 복구, 포인트 환불, 결제 환불 처리 TODO

- **GET /api/reservations/hotel/:hotelId**: 호텔 예약 확인 (사업자/관리자)
  - 인증: Private (hotel owner 또는 admin)

---

**Payments** (`/api/payments`)
- **POST /api/payments/confirm**: 결제 완료 확인 (Toss 연동)
  - 인증: Private
  - Body: `{ paymentKey, orderId, amount }` (orderId = reservationId)
  - 동작: Toss API 호출, 예약 상태 `confirmed`, 포인트 적립

- **POST /api/payments/cancel**: 결제 취소/환불 (Toss)
  - 인증: Private
  - Body: `{ reservationId, cancelReason? }`

- **GET /api/payments/:paymentKey**: 결제 상세 조회 (Toss 조회)
  - 인증: Private

- **POST /api/payments/webhook**: Toss webhook 수신
  - 인증: Public (Toss)
  - 동작: 결제 상태 변경 처리

---

**Reviews** (`/api/reviews`)
- **GET /api/reviews**: 리뷰 리스트 (필터)
  - 인증: Public
  - Query: `hotelId, userId, rating, page, limit`

- **GET /api/reviews/:id**: 리뷰 상세
  - 인증: Public

- **POST /api/reviews**: 리뷰 작성
  - 인증: Private
  - Body: `{ hotel, reservationId?, rating, comment, images? }`
  - 동작: 예약 완료 확인, 중복 작성 방지, 호텔 평점/리뷰카운트 업데이트, 포인트 지급

- **PUT /api/reviews/:id**: 리뷰 수정 (작성자만)
  - 인증: Private

- **DELETE /api/reviews/:id**: 리뷰 삭제 (작성자 또는 admin 또는 호텔 오너)
  - 인증: Private

- **POST /api/reviews/:id/report**: 리뷰 신고
  - 인증: Private
  - Body: `{ reason }`

- **GET /api/reviews/admin/reported**: 신고된 리뷰 목록 (관리자)
  - 인증: Private (admin)

---

**Support (문의)** (`/api/support`)
- **POST /api/support/inquiries**: 문의 등록
  - 인증: Public (로그인된 경우 `userId` 포함 가능)
  - Body: `{ name, email, category, subject, message }`

- **GET /api/support/inquiries**: 문의 목록 조회 (관리자)
  - 인증: Private (admin)
  - Query: `status, category, page, limit`

- **GET /api/support/inquiries/:id**: 문의 상세 (관리자)
  - 인증: Private (admin)

- **PUT /api/support/inquiries/:id/reply**: 문의 답변 등록 (관리자)
  - 인증: Private (admin)
  - Body: `{ reply }`

- **PUT /api/support/inquiries/:id/status**: 문의 상태 업데이트 (관리자)
  - 인증: Private (admin)
  - Body: `{ status }`

---

**Coupons** (`/api/coupons`)
- **GET /api/coupons**: 활성 쿠폰 목록 (Public)
  - Query: `page, limit`

- **GET /api/coupons/my**: 현재 사용자가 생성한 쿠폰 (사업자/관리자)
  - 인증: Private (business/admin)

- **GET /api/coupons/verify/:code**: 쿠폰 코드 검증
  - 인증: Private

- **POST /api/coupons**: 쿠폰 생성 (사업자/관리자)
  - 인증: Private (business/admin)
  - Body: `{ code, name, discountType, discountValue, validFrom, validUntil, ... }`

- **PUT /api/coupons/:id**: 쿠폰 수정 (생성자 또는 admin)
  - 인증: Private

- **DELETE /api/coupons/:id**: 쿠폰 삭제 (생성자 또는 admin)
  - 인증: Private

---

**Admin** (`/api/admin`)
- 모든 라우트는 `auth` + `requireRole('admin')` 미들웨어 적용

- **GET /api/admin/stats**: 대시보드 통계
- **GET /api/admin/users**: 사용자 관리 (필터/페이징)
- **PUT /api/admin/users/:id/approve**: 사업자 승인
- **PUT /api/admin/users/:id/block**: 사용자 차단/차단해제
- **GET /api/admin/hotels**: 모든 호텔 조회 (승인 대기 포함)
- **PUT /api/admin/hotels/:id/status**: 호텔 승인/반려/대기 상태 변경
- **PUT /api/admin/reviews/:id/report**: 신고된 리뷰 처리 (approve/reject)
- **GET /api/admin/coupons** / **POST /api/admin/coupons** / **PUT /api/admin/coupons/:id** / **DELETE /api/admin/coupons/:id**: 쿠폰 관리

---

Notes
- 인증 미들웨어: `auth` (JWT 기반, `req.user`에 사용자 정보 저장)
- 역할 검사: `requireRole(...)` 미들웨어 사용 (예: `admin`, `business`)
- 날짜 형식: ISO 8601 권장 (예: `2025-11-14T00:00:00Z`)
- 페이징: 대부분 `page`(1 기반), `limit` 사용

추가로 예시 요청/응답이나 OpenAPI 스키마가 필요하면 알려주세요.
