import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB 연결 성공\n');

    const admin = await User.findOne({ email: 'happysun0142@gmail.com' });
    
    if (admin) {
      console.log('✅ 관리자 계정 정보:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('이메일:', admin.email);
      console.log('이름:', admin.name);
      console.log('역할:', admin.role);
      console.log('가입일:', admin.createdAt);
      console.log('비밀번호 해시:', admin.password ? '설정됨' : '없음');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    } else {
      console.log('❌ 관리자 계정이 존재하지 않습니다.');
      console.log('\n모든 사용자 목록:');
      const allUsers = await User.find({}, 'email name role');
      console.log(allUsers);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러:', error.message);
    process.exit(1);
  }
};

checkAdmin();
