const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  placeId: { type: String, required: true },       // Mã định danh quán ăn (để gắn review vào đúng quán)
  author: { type: String, required: true },        // Tên người đánh giá
  rating: { type: Number, required: true, min: 1, max: 5 }, // Số sao (1-5)
  comment: { type: String, required: true },       // Nội dung bình luận
  createdAt: { type: Date, default: Date.now },     // Thời gian bình luận
  userId: { type: String, default: 'abc' }
});

module.exports = mongoose.model('Review', reviewSchema);