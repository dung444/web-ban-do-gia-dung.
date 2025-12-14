// script_thanh-toan.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== HIỂN THỊ THÔNG TIN USER =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");

  if (!currentUser) {
    alert("Vui lòng đăng nhập để tiếp tục thanh toán!");
    window.location.href = "Login.html";
    return;
  }

  userInfo.textContent = currentUser.fullname || "Tài khoản";
  logoutBtn.style.display = "inline-block";
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("currentUser");
    window.location.href = "Login.html";
  });

  // ===== LẤY DANH SÁCH SẢN PHẨM CHỌN THANH TOÁN =====
  const selectedProducts = JSON.parse(
    localStorage.getItem("selectedProducts") || "[]"
  );
  const buyContainer = document.querySelector(".buy-container");

  if (!selectedProducts.length) {
    buyContainer.innerHTML = `
      <div class="empty-order">
        <p>Hiện chưa có sản phẩm nào trong đơn hàng.</p>
        <a href="all-product.html" class="btn-continue">Tiếp tục mua sắm</a>
      </div>
    `;
    return;
  }

  // ===== HIỂN THỊ SẢN PHẨM =====
  let totalAmount = 0;

  selectedProducts.forEach((product) => {
    const price = parseFloat(product.price) || 0;
    const lineTotal = price * (product.quantity || 1);
    totalAmount += lineTotal;

    const productElement = document.createElement("div");
    productElement.classList.add("product-item");
    productElement.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}" />
      </div>
      <div class="product-details">
        <h4>${product.name}</h4>
        <p>Số lượng: <strong>${product.quantity}</strong></p>
        <p>Đơn giá: <span class="price">₫${price.toLocaleString()}</span></p>
      </div>
      <div class="product-line-total">
        <span class="label">Thành tiền</span>
        <span class="value">₫${lineTotal.toLocaleString()}</span>
      </div>
    `;
    buyContainer.appendChild(productElement);
  });

  // ===== KHUNG TỔNG TIỀN + ĐỊA CHỈ =====
  const bottomLayout = document.createElement("div");
  bottomLayout.className = "checkout-bottom";

  // --- TÓM TẮT ĐƠN HÀNG ---
  const summary = document.createElement("div");
  summary.className = "order-summary";
  summary.innerHTML = `
    <h3>Tóm tắt đơn hàng</h3>
    <div class="order-summary-row">
      <span>Tạm tính (${selectedProducts.length} sản phẩm)</span>
      <span class="order-summary-value">₫${totalAmount.toLocaleString()}</span>
    </div>
    <div class="order-summary-row">
      <span>Phí vận chuyển</span>
      <span class="order-summary-value">₫0</span>
    </div>
    <div class="order-summary-row total">
      <span>Tổng thanh toán</span>
      <span class="order-summary-value" id="order-total">₫${totalAmount.toLocaleString()}</span>
    </div>
  `;

  // --- FORM ĐỊA CHỈ ---
  const addressForm = document.createElement("div");
  addressForm.classList.add("address-form");
  addressForm.innerHTML = `
    <h3>Địa chỉ giao hàng</h3>
    <p class="address-note">
      Vui lòng chọn chính xác Tỉnh/Thành, Quận/Huyện, Phường/Xã để đơn hàng được giao nhanh hơn.
    </p>
    
    <label for="province">Tỉnh/Thành phố</label>
    <select id="province" required>
      <option value="">Chọn Tỉnh/Thành phố</option>
    </select>

    <label for="district">Quận/Huyện</label>
    <select id="district" required>
      <option value="">Chọn Quận/Huyện</option>
    </select>

    <label for="ward">Phường/Xã</label>
    <select id="ward" required>
      <option value="">Chọn Phường/Xã</option>
    </select>

    <label for="specific-address">Địa chỉ cụ thể</label>
    <input type="text" id="specific-address" placeholder="Số nhà, tên đường..." required />

    <label for="phone">Số điện thoại</label>
    <input type="tel" id="phone" placeholder="Nhập số điện thoại" required />

    <label for="recipient-name">Tên người nhận</label>
    <input type="text" id="recipient-name" placeholder="Nhập tên người nhận" required />

    <h3 style="margin-top: 24px; margin-bottom: 12px;">Phương thức thanh toán</h3>
    <div id="payment-methods" class="payment-methods">
      <!-- Sẽ được tạo bằng JavaScript -->
    </div>

    <div id="payment-details" class="payment-details" style="display: none;">
      <!-- Chi tiết thanh toán sẽ hiển thị ở đây -->
    </div>

    <button id="place-order-btn" type="button">
      ĐẶT HÀNG
    </button>
  `;

  bottomLayout.appendChild(summary);
  bottomLayout.appendChild(addressForm);
  buyContainer.appendChild(bottomLayout);

  // ===== LOAD PHƯƠNG THỨC THANH TOÁN =====
  loadPaymentMethods();

  // ===== DỮ LIỆU ĐỊA LÝ VIỆT NAM =====
  const locationData = {
    "Hà Nội": {
      "Quận Ba Đình": [
        "Phường Cống Vị", "Phường Điện Biên", "Phường Đội Cấn", "Phường Giảng Võ",
        "Phường Kim Mã", "Phường Liễu Giai", "Phường Ngọc Hà", "Phường Ngọc Khánh",
        "Phường Nguyễn Trung Trực", "Phường Phúc Xá", "Phường Quán Thánh", "Phường Thành Công",
        "Phường Trúc Bạch", "Phường Vĩnh Phúc"
      ],
      "Quận Hoàn Kiếm": [
        "Phường Chương Dương Độ", "Phường Cửa Đông", "Phường Cửa Nam", "Phường Đồng Xuân",
        "Phường Hàng Bạc", "Phường Hàng Bài", "Phường Hàng Bồ", "Phường Hàng Buồm",
        "Phường Hàng Đào", "Phường Hàng Gai", "Phường Hàng Mã", "Phường Hàng Trống",
        "Phường Lý Thái Tổ", "Phường Phan Chu Trinh", "Phường Phúc Tân", "Phường Tràng Tiền",
        "Phường Trần Hưng Đạo", "Phường Cầu Gỗ"
      ],
      "Quận Đống Đa": [
        "Phường Cát Linh", "Phường Hàng Bột", "Phường Khâm Thiên", "Phường Khương Thượng",
        "Phường Kim Liên", "Phường Láng Hạ", "Phường Láng Thượng", "Phường Nam Đồng",
        "Phường Ngã Tư Sở", "Phường Ô Chọ Dừa", "Phường Phương Liên", "Phường Phương Mai",
        "Phường Quang Trung", "Phường Quốc Tử Giám", "Phường Thịnh Quang", "Phường Thổ Quan",
        "Phường Trung Liệt", "Phường Trung Phụng", "Phường Trung Tự", "Phường Văn Chương",
        "Phường Văn Miếu"
      ],
      "Quận Hai Bà Trưng": [
        "Phường Bách Khoa", "Phường Bùi Thị Xuân", "Phường Cầu Dền", "Phường Đống Mác",
        "Phường Lê Đại Hành", "Phường Minh Khai", "Phường Nguyễn Du", "Phường Phạm Đình Hổ",
        "Phường Phố Huế", "Phường Quỳnh Lôi", "Phường Quỳnh Mai", "Phường Thanh Lương",
        "Phường Thanh Nhàn", "Phường Trương Định", "Phường Vĩnh Tuy"
      ],
      "Huyện Ba Vì": [
        "Thị trấn Tây Đằng", "Xã Ba Trại", "Xã Ba Vì", "Xã Cam Thượng", "Xã Châu Sơn",
        "Xã Cổ Đô", "Xã Đông Quang", "Xã Đồng Thái", "Xã Khánh Thượng", "Xã Minh Châu",
        "Xã Minh Quang", "Xã Phong Vân", "Xã Phú Châu", "Xã Phú Cường", "Xã Phú Đông",
        "Xã Phú Phương", "Xã Phú Sơn", "Xã Sơn Đà", "Xã Tản Hồng", "Xã Tản Lĩnh",
        "Xã Thái Hòa", "Xã Thuần Mỹ", "Xã Thụy An", "Xã Tòng Bạt", "Xã Vân Hòa",
        "Xã Vạn Thắng", "Xã Văn Thái", "Xã Yên Bài"
      ]
    },
    "TP. Hồ Chí Minh": {
      "Quận 1": [
        "Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh",
        "Phường Cô Giang", "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Nguyễn Thái Bình",
        "Phường Phạm Ngũ Lão", "Phường Tân Định"
      ],
      "Quận 2": [
        "Phường An Khánh", "Phường An Lợi Đông", "Phường An Phú", "Phường Bình An",
        "Phường Bình Khánh", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái",
        "Phường Thạnh Mỹ Lợi", "Phường Thảo Điền", "Phường Thủ Thiêm"
      ],
      "Quận 3": [
        "Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6",
        "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12",
        "Phường 13", "Phường 14"
      ],
      "Quận 7": [
        "Phường Bình Thuận", "Phường Phú Mỹ", "Phường Phú Thuận", "Phường Tân Hưng",
        "Phường Tân Kiểng", "Phường Tân Phong", "Phường Tân Phú", "Phường Tân Quy",
        "Phường Tân Thuận Đông", "Phường Tân Thuận Tây"
      ]
    },
    "Hưng Yên": {
      "TP. Hưng Yên": [
        "Phường An Tảo", "Phường Hiến Nam", "Phường Lam Sơn", "Phường Lê Lợi",
        "Phường Minh Khai", "Phường Quang Trung", "Phường Sở Dầu", "Phường Trần Phú"
      ],
      "Huyện Yên Mỹ": [
        "Thị trấn Yên Mỹ", "Xã Âu Cơ", "Xã Ba Sao", "Xã Berec", "Xã Đạo Lý",
        "Xã Đông Phong", "Xã Giai Phạm", "Xã Hoàng Phong", "Xã Lý Thường Kiệt",
        "Xã Mễ Sở", "Xã Nghĩa Hiệp", "Xã Ngọc Long", "Xã Tân Lâm", "Xã Tân Việt",
        "Xã Thanh Long", "Xã Trung Hòa", "Xã Trung Hưng", "Xã Việt Cường",
        "Xã Yên Hòa", "Xã Yên Phú"
      ],
      "Huyện Khoái Châu": [
        "Thị trấn Khoái Châu", "Xã Bình Minh", "Xã Chí Tân", "Xã Dạ Trạch",
        "Xã Đại Hưng", "Xã Đông Kết", "Xã Đông Ninh", "Xã Đông Tảo",
        "Xã Hàm Tử", "Xã Hồng Tiến", "Xã Liên Khê", "Xã Nhuế Dương",
        "Xã Ông Đình", "Xã Tân Dân", "Xã Tân Lập", "Xã Thành Công",
        "Xã Thượng Hiền", "Xã Thuần Hưng", "Xã Tứ Dân", "Xã Việt Hòa"
      ]
    },
    "Hải Phòng": {
      "Quận Hồng Bàng": [
        "Phường Hoàng Văn Thụ", "Phường Hùng Vương", "Phường Phan Bội Châu",
        "Phường Quán Toan", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Trại Cau"
      ],
      "Quận Lê Chân": [
        "Phường An Biên", "Phường An Dương", "Phường Cát Dài", "Phường Dư Hàng",
        "Phường Đông Hải", "Phường Hàng Kênh", "Phường Kênh Dương", "Phường Lam Sơn",
        "Phường Niệm Nghĩa", "Phường Trần Nguyên Hãn", "Phường Vĩnh Niệm"
      ]
    },
    "Đà Nẵng": {
      "Quận Hải Châu": [
        "Phường Bình Hiên", "Phường Bình Thuận", "Phường Hải Châu I", "Phường Hải Châu II",
        "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam", "Phường Hòa Thuận Đông",
        "Phường Hòa Thuận Tây", "Phường Nam Dương", "Phường Phước Ninh",
        "Phường Tân Chính", "Phường Thanh Bình", "Phường Thạch Thang", "Phường Thuận Phước"
      ],
      "Quận Thanh Khê": [
        "Phường An Khê", "Phường Chính Gián", "Phường Hòa Khê", "Phường Tam Thuận",
        "Phường Tân Chính", "Phường Thanh Khê Đông", "Phường Thanh Khê Tây",
        "Phường Thạc Gián", "Phường Vĩnh Trung", "Phường Xuân Hà"
      ]
    },
    "Cần Thơ": {
      "Quận Ninh Kiều": [
        "Phường An Bình", "Phường An Cư", "Phường An Hòa", "Phường An Khánh",
        "Phường An Nghiệp", "Phường An Phú", "Phường Cái Khế", "Phường Hưng Lợi",
        "Phường Tân An", "Phường Xuân Khánh"
      ],
      "Quận Bình Thủy": [
        "Phường Bình Thủy", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa",
        "Phường Long Tuyền", "Phường Thới An Đông", "Phường Trà An", "Phường Trà Nóc"
      ]
    }
  };

  // ===== KHỞI TẠO DANH SÁCH TỈNH/THÀNH =====
  const provinceSelect = document.getElementById("province");
  const districtSelect = document.getElementById("district");
  const wardSelect = document.getElementById("ward");

  // Thêm tất cả tỉnh/thành vào select
  Object.keys(locationData).forEach(province => {
    const option = document.createElement("option");
    option.value = province;
    option.textContent = province;
    provinceSelect.appendChild(option);
  });

  // ===== XỬ LÝ CHỌN TỈNH =====
  provinceSelect.addEventListener("change", (event) => {
    const selectedProvince = event.target.value;

    districtSelect.innerHTML = `<option value="">Chọn Quận/Huyện</option>`;
    wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

    if (locationData[selectedProvince]) {
      Object.keys(locationData[selectedProvince]).forEach((district) => {
        const option = document.createElement("option");
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
      });
    }
  });

  // ===== XỬ LÝ CHỌN HUYỆN =====
  districtSelect.addEventListener("change", (event) => {
    const selectedProvince = provinceSelect.value;
    const selectedDistrict = event.target.value;

    wardSelect.innerHTML = `<option value="">Chọn Phường/Xã</option>`;

    if (
      locationData[selectedProvince] &&
      locationData[selectedProvince][selectedDistrict]
    ) {
      locationData[selectedProvince][selectedDistrict].forEach((ward) => {
        const option = document.createElement("option");
        option.value = ward;
        option.textContent = ward;
        wardSelect.appendChild(option);
      });
    }
  });

  // ===== ĐẶT HÀNG =====
  document
    .getElementById("place-order-btn")
    .addEventListener("click", () => {
      const province = provinceSelect.value;
      const district = districtSelect.value;
      const ward = wardSelect.value;
      const specificAddress = document.getElementById("specific-address").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const recipientName = document.getElementById("recipient-name").value.trim();
      const selectedPaymentMethod = document.querySelector('input[name="payment-method"]:checked')?.value;

      // Validation
      if (!province || !district || !ward) {
        alert("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã!");
        return;
      }

      if (!specificAddress) {
        alert("Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)!");
        return;
      }

      if (!phone) {
        alert("Vui lòng nhập số điện thoại!");
        return;
      }

      if (!recipientName) {
        alert("Vui lòng nhập tên người nhận!");
        return;
      }

      if (!selectedPaymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán!");
        return;
      }

      // Validate phone number (basic)
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone)) {
        alert("Số điện thoại không hợp lệ! Vui lòng nhập 10-11 chữ số.");
        return;
      }

      const selectedProducts = JSON.parse(
        localStorage.getItem("selectedProducts") || "[]"
      );
      if (!selectedProducts.length) {
        alert("Không có sản phẩm nào trong đơn hàng!");
        return;
      }

      const fullAddress = `${specificAddress}, ${ward}, ${district}, ${province}`;
      const orders = JSON.parse(localStorage.getItem("orders") || "[]");

      const orderTotal = selectedProducts.reduce((sum, p) => {
        const price = parseFloat(p.price) || 0;
        const qty = p.quantity || 1;
        return sum + price * qty;
      }, 0);

      const newOrder = {
        id: `o_${Date.now()}_${orders.length}`, // id ổn định cho trang admin
        user: currentUser,
        products: selectedProducts,
        address: fullAddress,
        phone: phone,
        recipientName: recipientName,
        total: orderTotal,
        paymentMethod: selectedPaymentMethod,
        status: "pending", // Chờ xác nhận
        payment: selectedPaymentMethod === "cod" ? "pending" : "unpaid", // COD = pending, khác = unpaid
        timestamp: Date.now(),
      };

      orders.push(newOrder);
      localStorage.setItem("orders", JSON.stringify(orders));

      alert(`Đặt hàng thành công! 
Người nhận: ${recipientName}
Địa chỉ: ${fullAddress}
SĐT: ${phone}
Cảm ơn bạn đã mua sắm tại Life&Cooking 💙`);
      localStorage.removeItem("selectedProducts");
      window.location.href = "Shopping.html";
    });

  // ===== PHƯƠNG THỨC THANH TOÁN =====
  function loadPaymentMethods() {
    const paymentMethods = JSON.parse(localStorage.getItem("paymentMethods")) || [];
    const enabledMethods = paymentMethods.filter(method => method.enabled);
    
    if (enabledMethods.length === 0) {
      // Fallback nếu admin chưa cấu hình
      enabledMethods.push({
        id: "cod",
        name: "Thanh toán khi nhận hàng (COD)",
        description: "Thanh toán tiền mặt khi nhận hàng",
        icon: "💵",
        enabled: true,
        fee: 0
      });
    }

    renderPaymentMethods(enabledMethods);
  }

  function renderPaymentMethods(methods) {
    const container = document.getElementById("payment-methods");
    container.innerHTML = "";

    methods.forEach((method, index) => {
      const methodElement = document.createElement("div");
      methodElement.className = "payment-method";
      methodElement.innerHTML = `
        <label class="payment-method-label">
          <input type="radio" name="payment-method" value="${method.id}" ${index === 0 ? 'checked' : ''} />
          <div class="payment-method-content">
            <div class="payment-method-icon">${method.icon}</div>
            <div class="payment-method-info">
              <h4>${method.name}</h4>
              <p>${method.description}</p>
              ${method.fee > 0 ? `<small>Phí: ${method.fee}%</small>` : ''}
            </div>
          </div>
        </label>
      `;
      container.appendChild(methodElement);
    });

    // Add event listeners
    const radioButtons = container.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) {
          showPaymentDetails(radio.value);
        }
      });
    });

    // Show details for first method by default
    if (methods.length > 0) {
      showPaymentDetails(methods[0].id);
    }
  }

  function showPaymentDetails(methodId) {
    const detailsContainer = document.getElementById("payment-details");
    
    switch (methodId) {
      case "cod":
        detailsContainer.innerHTML = `
          <div class="payment-info cod-info">
            <h4><i class="fas fa-money-bill-wave"></i> Thanh toán khi nhận hàng</h4>
            <p>• Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng</p>
            <p>• Vui lòng chuẩn bị đủ tiền để thanh toán cho shipper</p>
            <p>• Kiểm tra kỹ sản phẩm trước khi thanh toán</p>
          </div>
        `;
        detailsContainer.style.display = "block";
        break;
        
      case "bank_transfer":
        const bankInfo = JSON.parse(localStorage.getItem("bankInfo"));
        if (bankInfo) {
          detailsContainer.innerHTML = `
            <div class="payment-info bank-info">
              <h4><i class="fas fa-university"></i> Thông tin chuyển khoản</h4>
              <div class="bank-details">
                <p><strong>Ngân hàng:</strong> ${bankInfo.bankName}</p>
                <p><strong>Số tài khoản:</strong> ${bankInfo.accountNumber}</p>
                <p><strong>Chủ tài khoản:</strong> ${bankInfo.accountHolder}</p>
                ${bankInfo.branch ? `<p><strong>Chi nhánh:</strong> ${bankInfo.branch}</p>` : ''}
                ${bankInfo.transferNote ? `<p><strong>Nội dung CK:</strong> ${bankInfo.transferNote}</p>` : ''}
              </div>
              <p style="color: #ef4444; font-weight: 500;">
                <i class="fas fa-exclamation-triangle"></i>
                Vui lòng chuyển khoản và gửi ảnh chụp bill cho chúng tôi để xác nhận đơn hàng
              </p>
            </div>
          `;
        } else {
          detailsContainer.innerHTML = `
            <div class="payment-info">
              <p style="color: #ef4444;">Thông tin ngân hàng chưa được cấu hình. Vui lòng liên hệ admin.</p>
            </div>
          `;
        }
        detailsContainer.style.display = "block";
        break;
        
      case "qr_payment":
        const qrCodes = JSON.parse(localStorage.getItem("qrCodes"));
        if (qrCodes && qrCodes.mainQR) {
          detailsContainer.innerHTML = `
            <div class="payment-info qr-info">
              <h4><i class="fas fa-qrcode"></i> Quét mã QR để thanh toán</h4>
              <div class="qr-code-container">
                <img src="${qrCodes.mainQR}" alt="QR Code thanh toán" style="max-width: 200px; border-radius: 8px;" />
              </div>
              <p>• Mở ứng dụng ngân hàng và quét mã QR</p>
              <p>• Nhập số tiền: <strong>₫${totalAmount.toLocaleString()}</strong></p>
              <p>• Gửi ảnh chụp bill cho chúng tôi để xác nhận</p>
            </div>
          `;
        } else {
          detailsContainer.innerHTML = `
            <div class="payment-info">
              <p style="color: #ef4444;">Mã QR thanh toán chưa được cấu hình. Vui lòng liên hệ admin.</p>
            </div>
          `;
        }
        detailsContainer.style.display = "block";
        break;
        
      default:
        detailsContainer.style.display = "none";
    }
  }
});
