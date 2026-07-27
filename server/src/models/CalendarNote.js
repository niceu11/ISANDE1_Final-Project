import mongoose from 'mongoose';

const calendarNoteSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  text: { type: String, required: true },
  type: { type: String, enum: ['note', 'deadline', 'announcement'], default: 'note' },
  createdBy: { type: String, default: '' },
  createdByRole: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('CalendarNote', calendarNoteSchema);
