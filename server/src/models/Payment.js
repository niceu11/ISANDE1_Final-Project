import mongoose from 'mongoose';

const tranche = {
  amount: { type: Number, default: 0 },
  dueDate: { type: Date },
  status: { type: String, enum: ['verified', 'pending', 'overdue'], default: 'pending' },
  proofUploaded: { type: Boolean, default: false },
  proofFileName: { type: String, default: '' },
  proofUploadedAt: { type: Date },
};

const historyEntrySchema = new mongoose.Schema({
  label: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['verified', 'pending', 'overdue'], default: 'pending' },
}, { _id: false });

const paymentSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  clientName: { type: String, required: true },
  eventDate: { type: Date },
  totalAmount: { type: Number, required: true },
  downpayment: tranche,
  balance: tranche,
  history: [historyEntrySchema],
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
