import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);
