import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  senderName: string;
  recipient?: mongoose.Types.ObjectId | null;
  recipientName?: string | null;
  content: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "User", default: null },
    recipientName: { type: String, default: null },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

messageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
