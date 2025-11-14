import express from 'express';
import mongoose from 'mongoose';

const app = express();
app.use(express.json());

// MongoDB 연결 (인증 정보 추가)
mongoose.connect("mongodb://admin:1234@localhost:27018/my-database?authSource=admin", {});

// 연결 상태 확인
mongoose.connection.on("connected", () => {
  console.log("MongoDB 연결 성공!");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB 연결 실패:", err);
});

// 스키마 정의
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
});

// 모델 생성
const User = mongoose.model("User", userSchema);

// 데이터 조회
app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// 데이터 저장
app.post("/api/users", async (req, res) => {
  const user = new User(req.body);
  await user.save();
  res.json(user);
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});

export default app;