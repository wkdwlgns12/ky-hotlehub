import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB 연결 성공');

    // 관리자 정보
    const adminData = {
      email: 'happysun0142@gmail.com',
      password: 'love7942@',
      name: '최고관리자',
      phone: '010-0000-0000',
      role: 'admin',
      businessApproved: true,
      points: 0
    };

    // 기존 관리자 계정 확인
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('❌ 이미 관리자 계정이 존재합니다.');
      console.log('이메일:', adminData.email);
      process.exit(0);
    }

    // 관리자 계정 생성 (pre-save hook이 자동으로 비밀번호 해싱)
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ 관리자 계정 생성 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('이메일:', adminData.email);
    console.log('비밀번호:', adminData.password);
    console.log('역할:', adminData.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  비밀번호를 반드시 변경하세요!');

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  }
};

createAdmin();
