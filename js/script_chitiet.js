// script_chitiet.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== LẤY SẢN PHẨM ĐÃ CHỌN =====
  const product = JSON.parse(localStorage.getItem("selectedProduct") || "null");
  const products = JSON.parse(localStorage.getItem("products") || "[]");

  if (!product) {
    alert("Không tìm thấy thông tin sản phẩm!");
    window.location.href = "all-product.html";
    return;
  }

  // ===== USER / LOGIN HIỂN THỊ =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const userInfo = document.getElementById("user-info");
  const loginLink = document.getElementById("login-link");
  const logoutBtn = document.getElementById("logout-btn");
  const userContainer = document.querySelector(".user-container");

  if (currentUser) {
    const username = currentUser.fullname || currentUser.email || "Người dùng";
    userInfo.textContent = `Hi, ${username}`;
    if (loginLink) loginLink.style.display = "none";
    if (logoutBtn) {
      logoutBtn.style.display = "inline-block";
      logoutBtn.addEventListener("click", () => {
        window.location.href = "thong-tin-ca-nhan.html";
      });
    }

    // Nếu là admin: hiển thị nút admin
    if (currentUser.role === "admin") {
      const adminBtn = document.getElementById("admin-btn");
      if (adminBtn) {
        adminBtn.style.display = "inline-flex";
        adminBtn.addEventListener("click", () => {
          window.location.href = "admin-control.html";
        });
      }
    }
  } else {
    userInfo.textContent = "";
    if (loginLink) loginLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
    const adminBtn = document.getElementById("admin-btn");
    if (adminBtn) adminBtn.style.display = "none";
  }

  // ===== HIỂN THỊ CHI TIẾT SẢN PHẨM =====
  const productNameEl = document.getElementById("product-name");
  const productImageEl = document.getElementById("product-image");
  const productPriceEl = document.getElementById("product-price");
  const productDescriptionEl = document.getElementById("product-description");

  const price =
    product.discountedPrice || product.originalPrice || product.price || 0;

  productNameEl.textContent = product.name || "";
  productImageEl.src = product.image || "";
  productImageEl.alt = product.name || "Sản phẩm";
  productPriceEl.textContent = `Giá: ₫${Number(price).toLocaleString("vi-VN")}`;
  productDescriptionEl.textContent =
    product.description || "Không có mô tả cho sản phẩm này.";

  // ===== SỐ LƯỢNG =====
  const quantityInput = document.getElementById("quantity-input");
  const decreaseBtn = document.getElementById("decrease-btn");
  const increaseBtn = document.getElementById("increase-btn");

  decreaseBtn.addEventListener("click", () => {
    let current = parseInt(quantityInput.value) || 1;
    if (current > 1) quantityInput.value = current - 1;
  });

  increaseBtn.addEventListener("click", () => {
    let current = parseInt(quantityInput.value) || 1;
    quantityInput.value = current + 1;
  });

  // ===== THÊM VÀO GIỎ HÀNG =====
  const addToCartBtn = document.getElementById("add-to-cart-btn");
  addToCartBtn.addEventListener("click", () => {
    const qty = parseInt(quantityInput.value) || 1;
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!user) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }

    const carts = JSON.parse(localStorage.getItem("carts") || "{}");
    const userCart = carts[user.email] || [];

    const existing = userCart.find((item) => item.name === product.name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + qty;
    } else {
      userCart.push({
        ...product,
        quantity: qty,
        price: price,
      });
    }

    carts[user.email] = userCart;
    localStorage.setItem("carts", JSON.stringify(carts));
    alert("Đã thêm sản phẩm vào giỏ hàng!");
  });

  // ===== MUA NGAY =====
  const buyNowBtn = document.getElementById("buy-now-btn");
  buyNowBtn.addEventListener("click", () => {
    const qty = parseInt(quantityInput.value) || 1;
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");

    if (!user) {
      alert("Vui lòng đăng nhập để mua sản phẩm!");
      return;
    }

    const selectedProducts = [
      {
        ...product,
        quantity: qty,
        price: price,
      },
    ];

    localStorage.setItem(
      "selectedProducts",
      JSON.stringify(selectedProducts)
    );
    window.location.href = "Thanh-toan.html";
  });

  // ===== ĐÁNH GIÁ SẢN PHẨM =====
  const reviewsContainer = document.getElementById("reviews-container");
  const reviewBtn = document.getElementById("add-review-btn");

  function renderReviews() {
    const reviews = JSON.parse(localStorage.getItem("reviews") || "{}");
    const productReviews = reviews[product.name] || [];

    reviewsContainer.innerHTML = "";

    if (productReviews.length === 0) {
      reviewsContainer.innerHTML = "<p>Chưa có đánh giá nào.</p>";
      return;
    }

    productReviews.forEach((rv) => {
      const div = document.createElement("div");
      div.classList.add("review");
      const rating = Number(rv.rating) || 0;
      
      // Tạo ảnh sao thay vì emoji
      let starsHtml = '';
      for (let i = 1; i <= 5; i++) {
        const starSrc = i <= rating ? 'icon/star-yellow.png' : 'icon/star-gray.png';
        starsHtml += `<img src="${starSrc}" alt="${i} sao" class="review-star" />`;
      }
      
      div.innerHTML = `
        <p><strong>${rv.user || "Người dùng"}</strong></p>
        <p class="review-rating">${starsHtml} (${rating} sao)</p>
        <p class="review-comment">${rv.comment || ""}</p>
      `;
      reviewsContainer.appendChild(div);
    });
  }

  renderReviews();

  reviewBtn.addEventListener("click", () => {
    const user = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }

    localStorage.setItem("productToReview", JSON.stringify(product));
    window.location.href = "DanhGia.html";
  });

  // ===== TÌM KIẾM / GỢI Ý =====
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("suggestions");

  function showSuggestions(keyword) {
    const kw = keyword.toLowerCase();
    const matched = products
      .filter((p) => (p.name || "").toLowerCase().includes(kw))
      .slice(0, 8);

    suggestions.innerHTML = "";

    if (matched.length === 0) {
      suggestions.innerHTML = "<li>Không tìm thấy sản phẩm</li>";
      return;
    }

    matched.forEach((p) => {
      const li = document.createElement("li");
      li.textContent = p.name;
      li.addEventListener("click", () => {
        searchInput.value = p.name;
        suggestions.innerHTML = "";
        window.location.href = `all-product.html?search=${encodeURIComponent(
          p.name
        )}`;
      });
      suggestions.appendChild(li);
    });
  }

  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    if (keyword) {
      showSuggestions(keyword);
    } else {
      suggestions.innerHTML = "";
    }
  });

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `all-product.html?search=${encodeURIComponent(
          keyword
        )}`;
      }
    }
  });

  const searchBtn = document.querySelector(".search-box_btn");
  searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
      window.location.href = `all-product.html?search=${encodeURIComponent(
        keyword
      )}`;
    }
  });

  // Ẩn gợi ý khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      suggestions.innerHTML = "";
    }
  });

  // ===== MENU CATEGORY CLICK =====
  const categoryButtons = document.querySelectorAll(".menu > li");
  categoryButtons.forEach((li) => {
    // Bỏ qua top-level của Phụ tùng / Gas (đã có submenu)
    if (li.classList.contains("Phu_tung") || li.classList.contains("Gas")) {
      return;
    }

    li.addEventListener("click", (e) => {
      e.preventDefault();
      const span = li.querySelector("span");
      if (!span) return;
      const category = span.textContent.trim();
      window.location.href = `all-product.html?category=${encodeURIComponent(
        category
      )}`;
    });
  });

  // ===== SẢN PHẨM KHÁC =====
  const otherProductsContainer = document.getElementById("other-products");

  function renderOtherProducts() {
    if (!Array.isArray(products) || products.length === 0) {
      otherProductsContainer.innerHTML =
        "<p>Không có sản phẩm nào để hiển thị.</p>";
      return;
    }

    // Loại bỏ sản phẩm đang xem
    const others = products.filter((p) => p.name !== product.name);
    if (others.length === 0) {
      otherProductsContainer.innerHTML =
        "<p>Không có sản phẩm nào để hiển thị.</p>";
      return;
    }

    const shuffled = others.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 5);

    otherProductsContainer.innerHTML = "";

    selected.forEach((p) => {
      const card = document.createElement("div");
      card.classList.add("product");
      const price = p.price || p.discountedPrice || p.originalPrice || 0;

      card.innerHTML = `
        <div class="other-product-image">
          <img src="${p.image || ""}" alt="${p.name || ""}" />
        </div>
        <p class="product-name" title="${p.name || ""}">
          ${p.name || ""}
        </p>
        <p class="product-price">₫${Number(price).toLocaleString("vi-VN")}</p>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("selectedProduct", JSON.stringify(p));
        window.location.href = "chitiet.html";
      });

      otherProductsContainer.appendChild(card);
    });
  }

  renderOtherProducts();
});
