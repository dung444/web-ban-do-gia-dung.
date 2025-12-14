// js/seed-products.js
// Chỉ chạy để khởi tạo dữ liệu mẫu. Nếu đã có products rồi thì không ghi đè.
(function () {
  const existing = JSON.parse(localStorage.getItem("products") || "[]");
  
  // Kiểm tra version để force update khi cần
  const currentVersion = "1.1"; // Tăng version khi cần update
  const storedVersion = localStorage.getItem("productsVersion") || "1.0";
  
  if (existing && existing.length > 0 && storedVersion === currentVersion) {
    console.log(
      "[seed-products] Đã có dữ liệu products phiên bản mới trong localStorage, không ghi đè."
    );
    return;
  }

  const products = [
    // ================== DỤNG CỤ BẾP ==================
    {
      id: "K001",
      name: "Bộ nồi inox 3 đáy LifeCook 3PCS",
      price: 890000,
      category: "Dụng cụ bếp",
      subcategory: "Nồi & xoong",
      brand: "Sunhouse",
      image: "images/bo-noi-inox-3day.jpg",
      description:
        "Bộ nồi inox 3 đáy dẫn nhiệt đều, dùng được cho mọi loại bếp, kể cả bếp từ. Tay cầm cách nhiệt, đáy chống cháy xém.",
    },
    {
      id: "K002",
      name: "Chảo chống dính đá hoa cương 28cm",
      price: 350000,
      category: "Dụng cụ bếp",
      subcategory: "Chảo",
      brand: "Sunhouse",
      image: "images/chao-da-28.jpg",
      description:
        "Chảo phủ đá hoa cương chống dính cao cấp, hạn chế dầu mỡ, tay cầm chắc tay, dùng được trên bếp ga và bếp từ.",
    },
    {
      id: "K003",
      name: "Nồi chiên không dầu 5.5L LifeCook AirPro",
      price: 1990000,
      category: "Dụng cụ bếp",
      subcategory: "Nồi chiên",
      brand: "Lock&Lock",
      image: "images/noi-chien-khong-dau-5.5l.jpg",
      description:
        "Nồi chiên không dầu dung tích 5.5L, công suất 1700W, bảng điều khiển cảm ứng, nhiều chế độ nấu tự động.",
    },
    {
      id: "K004",
      name: "Bộ dao bếp 6 món kèm khối gỗ",
      price: 520000,
      category: "Dụng cụ bếp",
      subcategory: "Dao & kéo",
      brand: "Lock&Lock",
      image: "images/bo-dao-bep-6-mon.jpg",
      description:
        "Bộ dao bếp thép không gỉ sắc bén, gồm dao chặt, dao thái, dao gọt, kéo và khối gỗ cắm dao sang trọng.",
    },
    {
      id: "K005",
      name: "Thớt gỗ chống mốc LifeWood 30x20cm",
      price: 159000,
      category: "Dụng cụ bếp",
      subcategory: "Thớt",
      brand: "Panasonic",
      image: "images/thot-go-30x20.jpg",
      description:
        "Thớt gỗ tự nhiên xử lý chống mốc, bề mặt dày dặn, phù hợp thái rau củ và thực phẩm tươi sống.",
    },
    {
      id: "K006",
      name: "Bộ tô bát sứ cao cấp 10 món",
      price: 480000,
      category: "Dụng cụ bếp",
      subcategory: "Bát & đĩa",
      brand: "Sunhouse",
      image: "images/bo-bat-su-10-mon.jpg",
      description:
        "Bộ bát sứ trắng men bóng, dùng được trong lò vi sóng, phù hợp cho gia đình 4–6 người.",
    },

    // ================== GIA DỤNG NHỎ ==================
    {
      id: "S001",
      name: "Ấm siêu tốc inox 1.8L LifeCook",
      price: 290000,
      category: "Gia dụng nhỏ",
      subcategory: "Ấm nước",
      brand: "Philips",
      image: "images/am-sieu-toc-1.8l.jpg",
      description:
        "Ấm siêu tốc dung tích 1.8L, công suất 1500W, tự ngắt khi nước sôi, đế xoay 360 độ tiện dụng.",
    },
    {
      id: "S002",
      name: "Bình đun nước siêu tốc thủy tinh 2L",
      price: 390000,
      category: "Gia dụng nhỏ",
      subcategory: "Ấm nước",
      brand: "Philips",
      image: "images/am-thuy-tinh-2l.jpg",
      description:
        "Bình đun thủy tinh chịu nhiệt, đèn LED đổi màu khi sôi, thiết kế sang trọng cho gian bếp hiện đại.",
    },
    {
      id: "S003",
      name: "Bếp hồng ngoại đơn 2000W",
      price: 780000,
      category: "Gia dụng nhỏ",
      subcategory: "Bếp điện",
      brand: "Electrolux",
      image: "images/bep-hong-ngoai-don.jpg",
      description:
        "Bếp hồng ngoại 2000W, mặt kính chịu lực, bảng điều khiển cảm ứng, nấu được mọi loại nồi.",
    },
    {
      id: "S004",
      name: "Máy xay sinh tố 3 cối 600W",
      price: 650000,
      category: "Gia dụng nhỏ",
      subcategory: "Máy xay",
      brand: "Electrolux",
      image: "images/may-xay-sinh-to-3-coi.jpg",
      description:
        "Máy xay sinh tố kèm 3 cối: xay sinh tố, xay thịt, xay khô. Lưỡi dao thép không gỉ, an toàn sức khỏe.",
    },
    {
      id: "S005",
      name: "Lò nướng điện 32L LifeCook Oven32",
      price: 1650000,
      category: "Gia dụng nhỏ",
      subcategory: "Lò nướng",
      brand: "Panasonic",
      image: "images/lo-nuong-32l.jpg",
      description:
        "Lò nướng điện dung tích 32L, 4 thanh nhiệt, có chức năng nướng đối lưu, thích hợp làm bánh và nướng thịt.",
    },
    {
      id: "S006",
      name: "Bàn ủi hơi nước cầm tay",
      price: 420000,
      category: "Gia dụng nhỏ",
      subcategory: "Bàn ủi",
      brand: "Philips",
      image: "images/ban-ui-hoi-nuoc-cam-tay.jpg",
      description:
        "Bàn ủi hơi nước cầm tay gọn nhẹ, làm phẳng quần áo nhanh chóng, phù hợp khi đi du lịch.",
    },

    // ================== VỆ SINH & LÀM SẠCH ==================
    {
      id: "C001",
      name: "Cây lau nhà 360 độ kèm xô vắt",
      price: 320000,
      category: "Vệ sinh & Làm sạch",
      subcategory: "Cây lau nhà",
      brand: "Panasonic",
      image: "images/cay-lau-nha-360.jpg",
      description:
        "Bộ cây lau nhà xoay 360 độ, đầu lau sợi microfiber thấm hút tốt, xô vắt inox bền bỉ.",
    },
    
    {
      id: "C003",
      name: "Robot hút bụi mini LifeClean",
      price: 2150000,
      category: "Vệ sinh & Làm sạch",
      subcategory: "Robot hút bụi",
      brand: "Electrolux",
      image: "images/robot-hut-bui-mini.jpg",
      description:
        "Robot hút bụi mini, có chế độ lau ướt, cảm biến chống rơi, phù hợp căn hộ chung cư.",
    },
    {
      id: "C004",
      name: "Máy hút bụi cầm tay 2in1",
      price: 1290000,
      category: "Vệ sinh & Làm sạch",
      subcategory: "Máy hút bụi",
      brand: "Electrolux",
      image: "images/may-hut-bui-cam-tay.jpg",
      description:
        "Máy hút bụi cầm tay 2 trong 1, có thể tháo rời thành máy hút mini, lực hút mạnh, lọc bụi HEPA.",
    },

    // ================== LƯU TRỮ ==================
    {
      id: "ST001",
      name: "Kệ để gia vị 2 tầng inox",
      price: 249000,
      category: "Lưu trữ",
      subcategory: "Kệ bếp",
      brand: "Sunhouse",
      image: "images/ke-gia-vi-2-tang.jpg",
      description:
        "Kệ inox 304 hai tầng để gia vị và chai lọ, thiết kế gọn gàng giúp tối ưu không gian bếp.",
    },
    {
      id: "ST002",
      name: "Hộp đựng thực phẩm 1L nắp khóa",
      price: 69000,
      category: "Lưu trữ",
      subcategory: "Hộp đựng",
      brand: "Lock&Lock",
      image: "images/hop-thuc-pham-1l.jpg",
      description:
        "Hộp nhựa cao cấp, nắp khóa kín, có thể dùng trong tủ lạnh và lò vi sóng (không dùng nắp).",
    },
    {
      id: "ST003",
      name: "Bộ 3 hộp thủy tinh chịu nhiệt",
      price: 310000,
      category: "Lưu trữ",
      subcategory: "Hộp thủy tinh",
      brand: "Lock&Lock",
      image: "images/bo-3-hop-thuy-tinh.jpg",
      description:
        "Bộ 3 hộp thủy tinh chịu nhiệt, bảo quản thức ăn, có thể dùng để hâm nóng trực tiếp trong lò.",
    },
    {
      id: "ST004",
      name: "Giá treo quần áo gấp gọn",
      price: 275000,
      category: "Lưu trữ",
      subcategory: "Giá treo",
      brand: "Panasonic",
      image: "images/gia-treo-gap-gon.jpg",
      description:
        "Giá treo quần áo gấp gọn tiết kiệm diện tích, phù hợp cho phòng trọ và căn hộ nhỏ.",
    },

    // ================== PHÒNG TẮM ==================
    {
      id: "B001",
      name: "Kệ để đồ nhà tắm 3 tầng",
      price: 330000,
      category: "Phòng tắm",
      subcategory: "Kệ nhà tắm",
      brand: "Sunhouse",
      image: "images/ke-nha-tam-3-tang.jpg",
      description:
        "Kệ nhựa ABS chống nước, 3 tầng đựng sữa tắm, dầu gội, mỹ phẩm gọn gàng.",
    },
    {
      id: "B002",
      name: "Bộ 3 kệ dán tường nhà tắm",
      price: 195000,
      category: "Phòng tắm",
      subcategory: "Kệ dán tường",
      brand: "Sunhouse",
      image: "images/ke-dan-tuong-nha-tam.jpg",
      description:
        "Bộ kệ dán tường chịu lực, không cần khoan, thích hợp cho gạch men, kính, bề mặt phẳng.",
    },
    {
      id: "B003",
      name: "Bộ phụ kiện phòng tắm 6 món",
      price: 420000,
      category: "Phòng tắm",
      subcategory: "Phụ kiện",
      brand: "Lock&Lock",
      image: "images/bo-phu-kien-phong-tam-6mon.jpg",
      description:
        "Bộ phụ kiện gồm kệ xà phòng, ly súc miệng, khay đựng bàn chải, móc treo khăn...",
    },

    // ================== VẢI & KHĂN ==================
    {
      id: "T001",
      name: "Bộ 3 khăn tắm cotton siêu mềm",
      price: 259000,
      category: "Vải & Khăn",
      subcategory: "Khăn tắm",
      brand: "Philips",
      image: "images/bo-3-khan-tam.jpg",
      description:
        "Bộ 3 khăn tắm chất liệu cotton dày dặn, thấm hút tốt, êm ái cho da.",
    },
    {
      id: "T002",
      name: "Thảm lau chân phòng tắm chống trơn",
      price: 99000,
      category: "Vải & Khăn",
      subcategory: "Thảm",
      brand: "Panasonic",
      image: "images/tham-lau-chan-chong-tron.jpg",
      description:
        "Thảm lau chân chống trượt, mặt dưới cao su bám sàn, mặt trên thấm nước nhanh.",
    },
    {
      id: "T003",
      name: "Bộ ga giường cotton 1m6 x 2m",
      price: 590000,
      category: "Vải & Khăn",
      subcategory: "Ga giường",
      brand: "Panasonic",
      image: "images/bo-ga-giuong-1m6.jpg",
      description:
        "Bộ ga giường cotton thoáng mát, gồm 1 ga bọc + 2 vỏ gối nằm, họa tiết hiện đại.",
    },

    // ================== PHỤ KIỆN ==================
    {
      id: "A001",
      name: "Móc dán tường đa năng 10 cái",
      price: 79000,
      category: "Phụ kiện",
      subcategory: "Móc treo",
      brand: "Lock&Lock",
      image: "images/moc-dan-tuong-10cai.jpg",
      description:
        "Bộ 10 móc dán tường chịu lực 3–5kg, dùng treo đồ nhà bếp, nhà tắm, phòng ngủ.",
    },
    {
      id: "A002",
      name: "Giá đỡ điện thoại gắn tường phòng tắm",
      price: 59000,
      category: "Phụ kiện",
      subcategory: "Giá đỡ",
      brand: "Lock&Lock",
      image: "images/gia-do-dien-thoai-phong-tam.jpg",
      description:
        "Giá đỡ điện thoại chống nước, gắn được trên gạch men, giúp xem phim khi tắm.",
    },
    {
      id: "A003",
      name: "Bộ ống hút inox kèm cọ rửa",
      price: 69000,
      category: "Phụ kiện",
      subcategory: "Ống hút",
      brand: "Sunhouse",
      image: "images/bo-ong-hut-inox.jpg",
      description:
        "Bộ ống hút inox tái sử dụng kèm cọ rửa, bảo vệ môi trường, phù hợp dùng cho nước ép và sinh tố.",
    },
  ];

  localStorage.setItem("products", JSON.stringify(products));
  localStorage.setItem("productsVersion", "1.1");
  console.log(
    "[seed-products] Đã khởi tạo",
    products.length,
    "sản phẩm mẫu cho cửa hàng gia dụng."
  );
})();
