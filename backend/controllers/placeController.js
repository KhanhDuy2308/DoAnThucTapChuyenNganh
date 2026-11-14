const { searchFoodPlace } = require('../services/googleMapsService');
const Review = require('../model/Review');

// API: GET /api/places/search?q=...
const searchPlace = async (req, res) => {
  console.log("1. Đã nhận được request tìm kiếm với query:", req.query.q);
  try {
    const query = req.query.q;
    if (!query || query.trim() === '') {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập tên hoặc địa chỉ quán!' });
    }

    console.log("2. Đang chuẩn bị gọi searchFoodPlace...");
    const placeData = await searchFoodPlace(query);
    console.log("3. Đã gọi xong searchFoodPlace, kết quả:", placeData ? placeData.name : 'null');

    if (!placeData) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy địa điểm ăn uống nào phù hợp với từ khóa này!'
      });
    }

    // Lấy danh sách review từ MongoDB của quán này (hỗ trợ cả trường 'author' và 'userName' để không bị lỗi)
    let localReviews = [];
    try {
      if (Review.db.readyState === 1) {
        localReviews = await Review.find({ placeId: placeData.placeId }).sort({ createdAt: -1 });
      }
    } catch (dbErr) {
      console.error("Lỗi query MongoDB review:", dbErr.message);
    }

    console.log("4. Đang chuẩn bị trả về kết quả cho frontend...");
    return res.status(200).json({
      success: true,
      data: {
        ...placeData,
        localReviews
      }
    });
  } catch (error) {
    console.error("Lỗi trong searchPlace:", error.message);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// API: POST /api/places/review
const addReview = async (req, res) => {
  try {
    const { placeId, placeName, userName, author, rating, comment } = req.body;

    if (!placeId || !comment || !rating) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin đánh giá!' });
    }

    // Lấy tên tác giả ưu tiên từ author hoặc userName, nếu không có thì là 'Khách'
    const finalAuthor = author || userName || 'Khách';

    const newReview = await Review.create({
      placeId,
      placeName,
      author: finalAuthor,     // Khớp tuyệt đối với schema MongoDB
      userName: finalAuthor,   // Lưu luôn để tương thích ngược nếu frontend đọc field này
      rating: Number(rating),
      comment
    });

    return res.status(201).json({
      success: true,
      message: 'Đã lưu đánh giá thành công vào MongoDB!',
      data: newReview
    });
  } catch (error) {
    console.error('Lỗi khi lưu đánh giá:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi khi lưu đánh giá: ' + error.message });
  }
};

module.exports = { searchPlace, addReview };








// 3. API: PUT /api/places/review/:id (Sửa bình luận)
const updateReview = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của review từ URL
    const { comment, rating } = req.body;

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { comment, rating },
      { new: true } // Trả về bản ghi sau khi đã cập nhật mới
    );

    if (!updatedReview) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận cần sửa!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Cập nhật bình luận thành công!',
      data: updatedReview
    });
  } catch (error) {
    console.error('Lỗi khi sửa bình luận:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi sửa bình luận' });
  }
};

// 4. API: DELETE /api/places/review/:id (Xóa bình luận)
const deleteReview = async (req, res) => {
  try {
    const { id } = req.params; // Lấy ID của review từ URL

    const deletedReview = await Review.findByIdAndDelete(id);

    if (!deletedReview) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bình luận cần xóa!' });
    }

    return res.status(200).json({
      success: true,
      message: 'Xóa bình luận thành công!'
    });
  } catch (error) {
    console.error('Lỗi khi xóa bình luận:', error.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xóa bình luận' });
  }
};

// Nhớ xuất (export) thêm 2 hàm này ở cuối file
module.exports = { searchPlace, addReview, updateReview, deleteReview };