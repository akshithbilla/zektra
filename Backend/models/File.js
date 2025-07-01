import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  s3Key: { type: String, required: true },
  url: { type: String, required: true },
  contentType: { type: String, required: true },
  size: { type: Number, required: true },
  storageType: { type: String, required: true },
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

export const File = mongoose.model('File', fileSchema);