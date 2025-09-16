import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: Types.ObjectId;
  event: 'USER_REGISTERED' | 'USER_LOGIN_SUCCESS' | 'USER_LOGIN_FAILED' | 'USER_AVATAR_UPDATED';
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    event: { type: String, required: true, enum: ['USER_REGISTERED', 'USER_LOGIN_SUCCESS', 'USER_LOGIN_FAILED', 'USER_AVATAR_UPDATED'] },
    ip: String,
    userAgent: String,
    metadata: Object
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
