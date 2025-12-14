// TRANG CHỦ GIA DỤNG – SCRIPT TỔNG
// Mỗi khối được tách thành 1 hàm init riêng

document.addEventListener("DOMContentLoaded", () => {
  initSearchBox();
  initSlider();
  initHeaderUserState();
  initFlashSaleSection();
  initBestSellersSection();
  initFlashSaleButton();
  initCategoryMenuRedirect();
  initFloatingChat();
  initBrandFilterSection(); // thương hiệu nổi bật
});

/* --- 1. THANH TÌM KIẾM + GỢI Ý ------------------------------ */
function initSearchBox() {
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("suggestions");
  const searchBtn = document.querySelector(".search-box_btn");

  if (!searchInput || !suggestions || !searchBtn) return;

  const products = JSON.parse(localStorage.getItem("products")) || [];

  function showSuggestions(keyword) {
    const filtered = products.filter((product) =>
      (product.name || "")
        .toLowerCase()
        .includes(keyword.toLowerCase())
    );

    suggestions.innerHTML = "";

    if (!filtered.length) {
      suggestions.innerHTML = "<li>Không tìm thấy sản phẩm</li>";
      return;
    }

    filtered.forEach((product) => {
      const li = document.createElement("li");
      li.textContent = product.name;
      li.addEventListener("click", () => {
        searchInput.value = product.name;
        suggestions.innerHTML = "";
        window.location.href = `all-product.html?search=${encodeURIComponent(
          product.name
        )}`;
      });
      suggestions.appendChild(li);
    });
  }

  searchInput.addEventListener("input", (e) => {
    const keyword = e.target.value.trim();
    if (keyword) showSuggestions(keyword);
    else suggestions.innerHTML = "";
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

  searchBtn.addEventListener("click", () => {
    const keyword = searchInput.value.trim();
    if (keyword) {
      window.location.href = `all-product.html?search=${encodeURIComponent(
        keyword
      )}`;
    }
  });
}

/* --- 2. SLIDER ẢNH TỰ ĐỘNG ---------------------------------- */
function initSlider() {
  const slider = document.querySelector(".slider");
  if (!slider) return;

  const slides = slider.querySelectorAll(".slide");
  if (!slides.length) return;

  let currentIndex = 0;

  const dotsContainer = document.createElement("div");
  dotsContainer.classList.add("dots-container");
  slider.appendChild(dotsContainer);

  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    dot.addEventListener("click", () => {
      currentIndex = index;
      updateSlides();
      updateDots();
      resetAutoPlay();
    });
    dotsContainer.appendChild(dot);
  });

  function changeSlide(direction) {
    currentIndex = (currentIndex + direction + slides.length) % slides.length;
    updateSlides();
    updateDots();
  }

  function updateSlides() {
    slides.forEach((slide, index) => {
      slide.classList.toggle("active", index === currentIndex);
    });
  }

  function updateDots() {
    const dots = dotsContainer.querySelectorAll(".dot");
    dots.forEach((dot, index) =>
      dot.classList.toggle("active", index === currentIndex)
    );
  }

  // swipe trên mobile
  let touchStartX = 0;
  slider.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
  });

  slider.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      changeSlide(diff > 0 ? 1 : -1);
      resetAutoPlay();
    }
  });

  let autoPlay = setInterval(() => changeSlide(1), 5000);

  function resetAutoPlay() {
    clearInterval(autoPlay);
    autoPlay = setInterval(() => changeSlide(1), 5000);
  }

  const prevBtn = slider.querySelector(".prev");
  const nextBtn = slider.querySelector(".next");

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      changeSlide(-1);
      resetAutoPlay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      changeSlide(1);
      resetAutoPlay();
    });
  }

  updateSlides();
  updateDots();
}

/* --- 3. ĐĂNG NHẬP / HIỂN THỊ USER HEADER -------------------- */
function initHeaderUserState() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userInfo = document.getElementById("user-info");
  const loginLink = document.getElementById("login-link");
  const logoutBtn = document.getElementById("logout-btn");
  const userContainer = document.querySelector(".user-container");

  if (!userInfo || !loginLink || !logoutBtn) return;

  if (currentUser) {
    const username = currentUser.fullname || currentUser.email || "Người dùng";
    userInfo.textContent = `Hi, ${username}`;
    loginLink.style.display = "none";
    logoutBtn.style.display = "inline-block";
    logoutBtn.innerHTML = '<span><i class="fa-solid fa-user"></i> Thông tin cá nhân</span>';
    logoutBtn.onclick = () => {
      window.location.href = "thong-tin-ca-nhan.html";
    };

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
    loginLink.style.display = "inline-block";
    loginLink.style.visibility = "visible";
    logoutBtn.style.display = "none";
    logoutBtn.onclick = null;
    const adminBtn = document.getElementById("admin-btn");
    if (adminBtn) adminBtn.style.display = "none";
  }
}

/* --- 4. FLASH SALE (COUNTDOWN + LIST) ------------------------ */
function initFlashSaleSection() {
  const countdownElement = document.getElementById("countdown");
  const flashSaleContainer = document.querySelector(".flash-sale-products");

  if (!countdownElement || !flashSaleContainer) return;

  let flashSaleProducts =
    JSON.parse(localStorage.getItem("flashSaleProducts")) || [];

  function filterValidProducts() {
    const now = Date.now();
    flashSaleProducts = flashSaleProducts.filter((p) => {
      const t = new Date(p.saleEndTime).getTime();
      return !Number.isNaN(t) && t > now;
    });
    localStorage.setItem("flashSaleProducts", JSON.stringify(flashSaleProducts));
  }

  function startCountdown(targetTime) {
    function updateCountdown() {
      const now = Date.now();
      const distance = targetTime - now;

      if (distance <= 0) {
        countdownElement.textContent = "Đã kết thúc!";
        clearInterval(interval);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      countdownElement.textContent = `${days} ngày ${String(hours).padStart(
        2,
        "0"
      )} : ${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(
        2,
        "0"
      )}`;
    }

    const interval = setInterval(updateCountdown, 1000);
    updateCountdown();
  }

  function renderFlashSaleProducts() {
    filterValidProducts();
    flashSaleContainer.innerHTML = "";

    if (!flashSaleProducts.length) {
      countdownElement.textContent = "Chưa có chương trình";
      flashSaleContainer.innerHTML =
        "<p>Hiện chưa có sản phẩm Flash Sale.</p>";
      return;
    }

    flashSaleProducts.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("product");
      productElement.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <p class="product-name">${product.name}</p>
        <p class="product-price">
          ₫${Number(product.discountedPrice || 0).toLocaleString()}
          <span class="old-price">₫${Number(
            product.originalPrice || 0
          ).toLocaleString()}</span>
        </p>
        <p class="sale-end-time">
          Kết thúc: ${new Date(product.saleEndTime).toLocaleString()}
        </p>
      `;
      productElement.addEventListener("click", () => {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
        window.location.href = "chitiet.html";
      });
      flashSaleContainer.appendChild(productElement);
    });
  }

  // Khởi tạo
  filterValidProducts();
  if (flashSaleProducts.length) {
    const earliest = flashSaleProducts.reduce((min, p) => {
      const t = new Date(p.saleEndTime).getTime();
      return t < min ? t : min;
    }, Infinity);
    if (Number.isFinite(earliest)) {
      startCountdown(earliest);
    }
  }
  renderFlashSaleProducts();
  setInterval(renderFlashSaleProducts, 60000);
}

/* --- 5. BEST SELLERS "CÓ THỂ BẠN ĐANG TÌM KIẾM" ------------- */
function initBestSellersSection() {
  const container = document.querySelector(".best-sellers-products");
  const loadMoreBtn = document.getElementById("load-more-btn");
  const loginToSeeMoreBtn = document.getElementById("login-to-see-more-btn");

  if (!container || !loadMoreBtn || !loginToSeeMoreBtn) return;

  const allProducts = JSON.parse(localStorage.getItem("products")) || [];
  // Gán brand mặc định nếu thiếu
  if (allProducts.length) {
    let mutated = false;
    const byCategoryDefaultBrand = {
      "Dụng cụ bếp": "Sunhouse",
      "Gia dụng nhỏ": "Philips",
      "Vệ sinh & Làm sạch": "Electrolux",
      "Lưu trữ": "Lock&Lock",
      "Phòng tắm": "Sunhouse",
      "Vải & Khăn": "Panasonic",
      "Phụ kiện": "Lock&Lock",
    };
    allProducts.forEach((p) => {
      if (!p.brand) {
        const b = byCategoryDefaultBrand[p.category] || "Sunhouse";
        p.brand = b;
        mutated = true;
      }
    });
    if (mutated) {
      localStorage.setItem("products", JSON.stringify(allProducts));
    }
  }
  const isLoggedIn = !!localStorage.getItem("currentUser");

  if (!allProducts.length) {
    container.innerHTML = "<p>Hiện chưa có sản phẩm nào.</p>";
    loadMoreBtn.style.display = "none";
    loginToSeeMoreBtn.style.display = "none";
    return;
  }

  function getRandomProducts(products, count) {
    const shuffled = [...products].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  const randomProducts = getRandomProducts(allProducts, 40);
  let currentLimit = isLoggedIn ? randomProducts.length : 10;

  function render(limit) {
    container.innerHTML = "";
    randomProducts.slice(0, limit).forEach((product) => {
      const el = document.createElement("div");
      el.classList.add("product");
      el.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <p class="product-name">${product.name}</p>
        <p class="product-price">₫${Number(
          product.price || product.originalPrice || 0
        ).toLocaleString()}</p>
      `;
      el.addEventListener("click", () => {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
        window.location.href = "chitiet.html";
      });
      container.appendChild(el);
    });
  }

  // Nếu đã đăng nhập: hiển thị toàn bộ, ẩn nút
  if (isLoggedIn) {
    render(currentLimit);
    loadMoreBtn.style.display = "none";
    loginToSeeMoreBtn.style.display = "none";
  } else {
    // Chưa đăng nhập: cho xem trước 10 sản phẩm, sau đó gợi ý đăng nhập
    render(currentLimit);
    loadMoreBtn.style.display = "inline-block";
    loginToSeeMoreBtn.style.display = "none";

    loadMoreBtn.addEventListener("click", () => {
      // Cho xem tối đa 20, sau đó yêu cầu đăng nhập
      if (currentLimit < 20 && currentLimit < randomProducts.length) {
        currentLimit = Math.min(currentLimit + 10, randomProducts.length);
        render(currentLimit);
      }

      if (currentLimit >= randomProducts.length || currentLimit >= 20) {
        loadMoreBtn.style.display = "none";
        loginToSeeMoreBtn.style.display = "inline-block";
      }
    });

    loginToSeeMoreBtn.addEventListener("click", () => {
      window.location.href = "Login.html";
    });
  }
}

/* --- 6. NÚT FLASH SALE "XEM TẤT CẢ SẢN PHẨM" ---------------- */
function initFlashSaleButton() {
  const btn = document.querySelector(".flash-sale-btn");
  const searchInput = document.getElementById("search-input");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const keyword = searchInput ? searchInput.value.trim() : "";
    if (keyword) {
      window.location.href = `all-product.html?search=${encodeURIComponent(
        keyword
      )}`;
    } else {
      window.location.href = "all-product.html";
    }
  });
}

/* --- 7. MENU CATEGORY -> CHUYỂN SANG ALL-PRODUCT ------------ */
function initCategoryMenuRedirect() {
  const menuButtons = document.querySelectorAll(".menu > li");
  if (!menuButtons.length) return;

  menuButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // tránh click vào submenu
      if (e.target.closest(".submenu")) return;

      const textEl = btn.querySelector(".menu-text");
      const category = (textEl ? textEl.textContent : btn.textContent).trim();
      if (!category) return;

      window.location.href = `all-product.html?category=${encodeURIComponent(
        category
      )}`;
    });
  });
}

/* --- 8. FLOATING CHAT ZALO & MESSENGER ---------------------- */
function initFloatingChat() {
  if (document.querySelector(".floating-chat-container")) return;

  const services = [
    {
      id: "zalo",
      label: "Zalo",
      className: "zalo",
      iconClass: "fa-solid fa-comment-dots",
      urlBase: "https://zalo.me/0395286904",
    },
    {
      id: "mess",
      label: "Messenger",
      className: "mess",
      iconClass: "fa-brands fa-facebook-messenger",
      urlBase: "https://m.me/100094266397508",
    },
  ];

  const container = document.createElement("div");
  container.className = "floating-chat-container";

  services.forEach((svc, idx) => {
    const btn = document.createElement("button");
    btn.className = `chat-button ${svc.className}`;
    btn.setAttribute("aria-label", `${svc.label} chat`);
    btn.dataset.index = idx;
    btn.innerHTML = `<i class="${svc.iconClass}" aria-hidden="true"></i>`;

    const win = document.createElement("div");
    win.className = "chat-window";
    win.dataset.index = idx;

    const baseBottom = 20;
    const gap = 12;
    const btnSize = 56;
    const bottomVal = baseBottom + idx * (btnSize + gap);
    win.style.bottom = `${bottomVal}px`;

    win.innerHTML = `
      <div class="chat-header">
        <div class="title">${svc.label} - Hỗ trợ</div>
        <button class="close-btn" aria-label="Đóng">&times;</button>
      </div>
      <div class="chat-body">
        <div class="placeholder">
          Nhập tin nhắn và nhấn Gửi để mở ứng dụng ${svc.label} trong tab mới.
        </div>
      </div>
      <div class="chat-footer">
        <input type="text" placeholder="Nhập tin nhắn..." />
        <button class="send">Gửi</button>
      </div>
    `;

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".chat-window.open").forEach((w) => {
        if (w !== win) w.classList.remove("open");
      });
      win.classList.toggle("open");
    });

    const closeBtn = win.querySelector(".close-btn");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      win.classList.remove("open");
    });

    const sendBtn = win.querySelector(".send");
    const input = win.querySelector('input[type="text"]');

    sendBtn.addEventListener("click", () => {
      const text = (input.value || "").trim();
      let targetUrl = svc.urlBase;

      if (svc.id === "zalo") {
        if (text) targetUrl = `${svc.urlBase}?text=${encodeURIComponent(text)}`;
      } else if (svc.id === "mess") {
        if (text) targetUrl = `${svc.urlBase}?ref=${encodeURIComponent(text)}`;
      }

      window.open(targetUrl, "_blank", "noopener");
      win.classList.remove("open");
      input.value = "";
    });

    win.addEventListener("click", (e) => e.stopPropagation());

    container.appendChild(btn);
    document.body.appendChild(win);
  });

  document.body.appendChild(container);

  document.addEventListener("click", () => {
    document
      .querySelectorAll(".chat-window.open")
      .forEach((w) => w.classList.remove("open"));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".chat-window.open")
        .forEach((w) => w.classList.remove("open"));
    }
  });
}

/* --- 9. LỌC THEO THƯƠNG HIỆU (LOGO) ------------------------- */
function initBrandFilterSection() {
  const brandsListContainer = document.querySelector(".brands-list");
  const productsContainer = document.getElementById("brands-products");
  if (!brandsListContainer || !productsContainer) return;

  const allProducts = JSON.parse(localStorage.getItem("products")) || [];
  
  // Load brands from localStorage
  let brands = JSON.parse(localStorage.getItem("brands")) || [];
  
  // Migrate old format (array of strings) to new format (array of objects)
  if (brands.length > 0 && typeof brands[0] === "string") {
    const defaultImages = {
      "Sunhouse": "icon/brand-sunhouse.png",
      "Lock&Lock": "icon/brand-locknlock.png",
      "Philips": "icon/brand-philips.png",
      "Panasonic": "icon/brand-panasonic.png",
      "Electrolux": "icon/brand-electrolux.png"
    };
    brands = brands.map((name) => ({
      name: name,
      image: defaultImages[name] || ""
    }));
    localStorage.setItem("brands", JSON.stringify(brands));
  }
  
  // If no brands, use defaults
  if (brands.length === 0) {
    brands = [
      { name: "Sunhouse", image: "icon/brand-sunhouse.png" },
      { name: "Lock&Lock", image: "icon/brand-locknlock.png" },
      { name: "Philips", image: "icon/brand-philips.png" },
      { name: "Panasonic", image: "icon/brand-panasonic.png" },
      { name: "Electrolux", image: "icon/brand-electrolux.png" }
    ];
    localStorage.setItem("brands", JSON.stringify(brands));
  }

  function renderBrandProducts(list, brandName) {
    productsContainer.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("p");
      empty.className = "brands-products-empty";
      empty.textContent = `Chưa có sản phẩm cho thương hiệu "${brandName}".`;
      productsContainer.appendChild(empty);
      return;
    }

    const grid = document.createElement("div");
    grid.className = "brands-products-grid";

    list.forEach((product) => {
      const item = document.createElement("div");
      item.className = "product";
      item.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <p class="product-name">${product.name}</p>
        <p class="product-price">₫${Number(
          product.price || product.originalPrice || 0
        ).toLocaleString()}</p>
      `;
      item.addEventListener("click", () => {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
        window.location.href = "chitiet.html";
      });
      grid.appendChild(item);
    });

    productsContainer.appendChild(grid);
  }

  // Attach event listeners to existing brand buttons
  function attachBrandListeners() {
    const brandButtons = document.querySelectorAll(".brand-item");
    
    brandButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const brand = btn.dataset.brand;
        if (!brand) return;

        // Active state
        brandButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Decode HTML entities trong brand name
        const decodedBrand = brand.replace(/&amp;/g, '&');
        const key = decodedBrand.toLowerCase();

        // Lọc sản phẩm theo thương hiệu
        const filtered = allProducts.filter((p) => {
          const productBrand = (p.brand || "").toLowerCase();
          
          // So sánh chính xác tên thương hiệu
          return productBrand === key;
        });

        renderBrandProducts(filtered, decodedBrand);
      });
    });
  }

  // Initial setup - just attach listeners to existing HTML
  attachBrandListeners();
}
