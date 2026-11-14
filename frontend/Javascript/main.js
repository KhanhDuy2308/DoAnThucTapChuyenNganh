console.log("dang chay");
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const messageBox = document.getElementById('messageBox');
const resultCard = document.getElementById('resultCard');

const placeNameEl = document.getElementById('placeName');
const placeRatingEl = document.getElementById('placeRating');
const placeAddressEl = document.getElementById('placeAddress');
const directionsLinkEl = document.getElementById('directionsLink');
const reviewsListEl = document.getElementById('reviewsList');

const submitReviewBtn = document.getElementById('submitReviewBtn');

let currentPlace = null; // Lưu thông tin quán đang xem

// Lấy hoặc tạo một clientId duy nhất cho trình duyệt này
let myClientId = localStorage.getItem('app_client_id');
if (!myClientId) {
  myClientId = 'user_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('app_client_id', myClientId);
}

const showMessage = (text, type = 'error') => {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
};

const hideMessage = () => {
  messageBox.className = 'message hidden';
};

// Hàm render danh sách đánh giá (gộp cả đánh giá trên web và Google Maps)
const renderReviews = (localReviews, googleReviews) => {
  reviewsListEl.innerHTML = '';

  // 1. Hiển thị đánh giá từ hệ thống web (MongoDB) 
  localReviews.forEach((rev) => {
    const div = document.createElement('div');
    div.className = 'review-item';
    // Kiểm tra xem comment này có phải do chính trình duyệt này viết không
  const isOwner = rev.userId === myClientId;
 div.innerHTML = `
    <strong>${rev.author || 'Ẩn danh'}</strong> - ⭐ ${rev.rating}/5
    <span class="review-source source-local">Đánh giá trên Web</span>
    <p>${rev.comment}</p>
    
    <!-- Chỉ hiện nút Sửa/Xóa nếu là chính chủ (isOwner = true) -->
    ${isOwner ? `
      <div class="review-actions" style="margin-top: 8px;">
        <button onclick="editReview('${rev._id}', '${rev.comment}')" style="background: #f39c12; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer; margin-right: 5px;">Sửa</button>
        <button onclick="deleteReview('${rev._id}')" style="background: #e74c3c; color: #fff; border: none; padding: 4px 10px; border-radius: 4px; cursor: pointer;">Xóa</button>
      </div>
    ` : ''}
  `;

    
    reviewsListEl.appendChild(div);
  });

  // 2. Hiển thị đánh giá có sẵn từ Google Maps
  googleReviews.forEach((rev) => {
    const author = rev.authorAttribution?.displayName || 'Người dùng Google';
    const text = rev.text?.text || '(Không có nội dung)';
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `
      <strong>${author}</strong> - ⭐ ${rev.rating}/5
      <span class="review-source source-google">Google Maps</span>
      <p>${text}</p>
    `;
    reviewsListEl.appendChild(div);
  });

  if (localReviews.length === 0 && googleReviews.length === 0) {
    reviewsListEl.innerHTML = '<p>Chưa có đánh giá nào cho địa điểm này.</p>';
  }
};

const handleSearch = async () => {
  const query = searchInput.value.trim();
  if (!query) {
    showMessage('Vui lòng nhập địa chỉ hoặc tên quán ăn!', 'error');
    return;
  }

  resultCard.classList.add('hidden');
  showMessage('Đang tìm kiếm địa điểm...', 'loading');

  try {
    const res = await fetch(`http://localhost:3000/api/places/search?q=${encodeURIComponent(query)}`);
    const result = await res.json();

    if (!result.success) {
      showMessage(result.message, 'error');
      return;
    }

    hideMessage();
    currentPlace = result.data;

    placeNameEl.textContent = currentPlace.name;
    placeRatingEl.textContent = `⭐ ${currentPlace.rating} (${currentPlace.userRatingCount})`;
    placeAddressEl.textContent = `📍 ${currentPlace.address}`;
    directionsLinkEl.href = currentPlace.googleMapsUri;

    // Hiển thị danh sách review (localReviews chứa các review từ MongoDB)
    renderReviews(currentPlace.localReviews || [], currentPlace.googleReviews || []);
    resultCard.classList.remove('hidden');
  } catch (error) {
    console.error("Lỗi:", error);
    showMessage('Lỗi kết nối tới server backend!', 'error');
  }
};

// Xử lý gửi đánh giá mới lên MongoDB
submitReviewBtn.addEventListener('click', async () => {
  if (!currentPlace) return;

  
  const authorInput = document.getElementById('reviewerName') || document.getElementById('authorInput');
  const ratingInput = document.getElementById('ratingSelect') || document.getElementById('ratingInput');
  const commentInput = document.getElementById('commentInput');

  const author = authorInput ? authorInput.value.trim() : '';
  const rating = Number(ratingInput ? ratingInput.value : 5);
  const comment = commentInput ? commentInput.value.trim() : '';

  if (!author) {
    alert('Vui lòng nhập tên của bạn!');
    return;
  }

  if (!comment) {
    alert('Vui lòng nhập nội dung đánh giá!');
    return;
  }

  try {
    const res = await fetch('http://localhost:3000/api/places/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeId: currentPlace.placeId,
        author: author,   // Khớp hoàn toàn với schema MongoDB (author)
        rating: rating,
        comment: comment,
        userId: myClientId
      })
    });

    const result = await res.json();
    if (result.success) {
      alert('Thêm bình luận thành công vào MongoDB!');
      if (commentInput) commentInput.value = '';

      // Gọi lại search để cập nhật ngay danh sách bình luận mới nhất lên giao diện
      handleSearch();
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Lỗi gửi review:', error);
    alert('Không thể gửi đánh giá lúc này.');
  }
});

searchBtn.addEventListener('click', handleSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleSearch();
});












// Xử lý Xóa bình luận
async function deleteReview(reviewId) {
  if (!confirm('Bạn có chắc chắn muốn xóa bình luận này không?')) return;

  try {
    const res = await fetch(`http://localhost:3000/api/places/review/${reviewId}`, {
      method: 'DELETE'
    });
    const result = await res.json();

    if (result.success) {
      alert('Đã xóa bình luận thành công!');
      handleSearch(); // Load lại kết quả tìm kiếm để cập nhật giao diện
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Lỗi khi xóa:', error);
    alert('Không thể kết nối đến server để xóa.');
  }
}

// Xử lý Sửa bình luận (dùng prompt đơn giản hoặc mở modal)
async function editReview(reviewId, oldComment) {
  const newComment = prompt('Nhập nội dung bình luận mới của bạn:', oldComment);
  if (newComment === null) return; // Người dùng bấm Cancel
  if (!newComment.trim()) {
    alert('Nội dung bình luận không được để trống!');
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/api/places/review/${reviewId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: newComment.trim() })
    });
    const result = await res.json();

    if (result.success) {
      alert('Cập nhật bình luận thành công!');
      handleSearch(); // Load lại kết quả tìm kiếm
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error('Lỗi khi sửa:', error);
    alert('Không thể kết nối đến server để sửa.');
  }
}
