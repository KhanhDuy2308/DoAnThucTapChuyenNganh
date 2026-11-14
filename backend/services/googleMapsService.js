const mockDatabase = [
  {
    placeId: "pho_hoa_pasteur_01",
    name: "Phở Hòa Pasteur",
    address: "260 Pasteur, Phường 8, Quận 3, Hồ Chí Minh",
    rating: 4.6,
    userRatingCount: 1250,
    googleMapsUri: "https://www.google.com/maps/search/?api=1&query=Phở+Hòa+Pasteur",
    googleReviews: [
      { authorAttribution: { displayName: "Minh Tuấn" }, rating: 5, text: { text: "Nước dùng rất đậm đà và chuẩn vị Sài Gòn!" } }
    ]
  },
  {
    placeId: "banh_mi_huynh_hoa_02",
    name: "Bánh Mì Huỳnh Hoa",
    address: "26 Lê Thị Riêng, Phường Phạm Ngũ Lão, Quận 1, Hồ Chí Minh",
    rating: 4.4,
    userRatingCount: 3400,
    googleMapsUri: "https://www.google.com/maps/search/?api=1&query=Bánh+Mì+Huỳnh+Hoa",
    googleReviews: [
      { authorAttribution: { displayName: "Lan Anh" }, rating: 5, text: { text: "Ngập tràn chà bông và pate, ăn rất đáng tiền." } }
    ]
  },
  {
    placeId: "com_tam_ba_ghien_03",
    name: "Cơm tấm Ba Ghiền",
    address: "84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, Hồ Chí Minh",
    rating: 4.5,
    userRatingCount: 2100,
    googleMapsUri: "https://www.google.com/maps/search/?api=1&query=Cơm+tấm+Ba+Ghiền",
    googleReviews: [
      { authorAttribution: { displayName: "Hoàng Nam" }, rating: 5, text: { text: "Sườn to khủng khiếp, ướp vị cực kỳ vừa miệng." } }
    ]
  },
  {
    placeId: "bun_cha_ha_noi_ho_guom_04",
    name: "Bún Chả Hồ Gươm",
    address: "135 Võ Văn Tần, Phường 6, Quận 3, Hồ Chí Minh",
    rating: 4.3,
    userRatingCount: 890,
    googleMapsUri: "https://www.google.com/maps/search/?api=1&query=Bún+Chả+Hồ+Gươm+Võ+Văn+Tần",
    googleReviews: [
      { authorAttribution: { displayName: "Quốc Bảo" }, rating: 4, text: { text: "Chả nướng thơm phức, nước chấm ấm vừa vặn." } }
    ]
  }
];

const searchFoodPlace = async (query) => {
  try {
    if (!query) return null;
    const keyword = query.toLowerCase().trim();
    console.log(`2. Đang tìm kiếm trong cơ sở dữ liệu với từ khóa: "${keyword}"...`);

    // Tìm kiếm thông minh: khớp tên quán hoặc địa chỉ
    const found = mockDatabase.find(p => 
      p.name.toLowerCase().includes(keyword) || 
      p.address.toLowerCase().includes(keyword) ||
      keyword.split(' ').some(word => word.length > 2 && p.name.toLowerCase().includes(word))
    );

    if (!found) {
      // Nếu không tìm thấy chính xác, trả về mặc định quán đầu tiên hoặc tạo nhanh một kết quả khớp từ khóa để demo không bị trống
      return {
        placeId: `dynamic_${Date.now()}`,
        name: query,
        address: "Khu vực Hồ Chí Minh, Việt Nam",
        rating: 4.5,
        userRatingCount: 120,
        googleMapsUri: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        googleReviews: []
      };
    }

    return found;
  } catch (error) {
    console.error('Lỗi tìm kiếm:', error.message);
    return null;
  }
};

module.exports = { searchFoodPlace };


// const mockDatabase = [
//   {
//     placeId: "pho_hoa_pasteur_01",
//     name: "Phở Hòa Pasteur",
//     address: "260 Pasteur, Phường 8, Quận 3, Hồ Chí Minh",
//     rating: 4.6,
//     userRatingCount: 1250,
//     googleMapsUri: "https://www.google.com/maps/search/?api=1&query=Phở+Hòa+Pasteur",
//     googleReviews: [
//       { authorAttribution: { displayName: "Minh Tuấn" }, rating: 5, text: { text: "Nước dùng rất đậm đà và ngon!" } }
//     ]
//   },
//   {
//     placeId: "com_tam_ba_ghien_02",
//     name: "Cơm tấm Ba Ghiền",
//     address: "84 Đặng Văn Ngữ, Phường 10, Phú Nhuận, Hồ Chí Minh",
//     rating: 4.5,
//     userRatingCount: 2100,
//     googleMapsUri: "https://www.google.com/maps/search/?api=1&query=Cơm+tấm+Ba+Ghiền",
//     googleReviews: [
//       { authorAttribution: { displayName: "Hoàng Nam" }, rating: 5, text: { text: "Sườn to, ướp vị cực kỳ vừa miệng." } }
//     ]
//   }
// ];

// const searchFoodPlace = async (query) => {
//   if (!query) return null;
//   const keyword = query.toLowerCase().trim();
  
//   // Kiểm tra xem tên quán hoặc địa chỉ có chứa từ khóa user gõ không (không phân biệt hoa thường)
//   const found = mockDatabase.find(p => 
//     p.name.toLowerCase().includes(keyword) || 
//     p.address.toLowerCase().includes(keyword) ||
//     keyword.includes('cơm') && p.name.toLowerCase().includes('cơm') ||
//     keyword.includes('phở') && p.name.toLowerCase().includes('phở')
//   );

//   return found || null;
// };

// module.exports = { searchFoodPlace };