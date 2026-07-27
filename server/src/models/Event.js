import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  author: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const supplierSchema = new mongoose.Schema({
  role: { type: String, required: true },
  company: { type: String, required: true },
  contact: { type: String, required: true },
  status: { type: String, enum: ['confirmed', 'pending'], default: 'pending' },
}, { _id: false });

const eventSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  contact: { type: String, default: '' },
  email: { type: String, default: '' },
  eventType: { type: String, default: '' },
  venue: { type: String, default: '' },
  eventDate: { type: Date },
  time: { type: String, default: '' },
  guestCount: { type: Number, default: 0 },
  coordinator: { type: String, default: '' },
  status: { type: String, enum: ['hot', 'warm', 'cold', 'pencil', 'confirmed'], default: 'warm' },
  contractStatus: { type: String, enum: ['signed', 'pending'], default: 'pending' },
  followupsCompleted: { type: Number, default: 0 },
  followupsTotal: { type: Number, default: 3 },
  lastActivityAt: { type: Date, default: Date.now },
  notes: [noteSchema],
  suppliers: [supplierSchema],
  instructions: [String],
  featured: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
