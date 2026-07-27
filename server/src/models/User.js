import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ae', 'manager', 'ceo', 'staff'], required: true },
  title: { type: String, default: '' },
});

export default mongoose.model('User', userSchema);
