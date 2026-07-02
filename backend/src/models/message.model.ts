import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  username: string;
  message: string;
  status: 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 2000,
    },
    status: {
      type: String,
      enum: ['delivered'],
      default: 'delivered',
    },
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
