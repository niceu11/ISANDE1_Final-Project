import AuditLog from './models/AuditLog.js';

export async function logAudit({ action, entityType, entityId, entityLabel = '', actorName = '', actorRole = '', detail = '' }) {
  try {
    await AuditLog.create({ action, entityType, entityId, entityLabel, actorName, actorRole, detail });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}
