import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  entityType: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  entityLabel: { type: String, default: '' },
  actorName: { type: String, default: '' },
  actorRole: { type: String, default: '' },
  detail: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
