import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

const deleteAdmin = async () => {
  try {
    // MongoDB 연결
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB 연결 성공');

    // 기존 관리자 계정 삭제
    const result = await User.deleteOne({ email: 'happysun0142@gmail.com' });

    if (result.deletedCount > 0) {
      console.log('✅ 기존 관리자 계정 삭제 완료!');
    } else {
      console.log('ℹ️  삭제할 관리자 계정이 없습니다.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  }
};

deleteAdmin();
