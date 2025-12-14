// script-allprd.js
document.addEventListener("DOMContentLoaded", () => {
  // --- DOM ELEMENTS ---
  const searchInput = document.getElementById("search-input");
  const suggestions = document.getElementById("suggestions");
  const productGrid = document.querySelector(".product-grid");
  const pageTitle = document.querySelector(".all-products-title");
  const breadcrumbCurrent = document.getElementById("breadcrumb-current");
  const sortSelect = document.getElementById("sort-select");

  const userInfo = document.getElementById("user-info");
  const loginLink = document.getElementById("login-link");
  const logoutBtn = document.getElementById("logout-btn");

  // --- DATA ---
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");

  // ========= HIỂN THỊ USER =========
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
  } else {
    userInfo.textContent = "";
    if (loginLink) loginLink.style.display = "inline-block";
    if (logoutBtn) logoutBtn.style.display = "none";
  }

  // ========= HELPER =========
  function norm(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function getCategory(p) {
    return p.category || p.Category || p.loai || p.type || "";
  }

  function getSubcategory(p) {
    return p.subcategory || p.subCategory || p.nhom || p.group || "";
  }

  function setBreadcrumb(text) {
    if (breadcrumbCurrent) breadcrumbCurrent.textContent = text;
  }

  // ========= RENDER & SORT =========
  let baseFiltered = [];

  function renderProducts(list) {
    productGrid.innerHTML = "";

    if (!list || list.length === 0) {
      productGrid.innerHTML =
        '<p class="no-product">Không có sản phẩm nào phù hợp.</p>';
      return;
    }

    list.forEach((product) => {
      const card = document.createElement("div");
      card.classList.add("product");

      const price =
        product.price !== undefined && product.price !== null
          ? Number(product.price)
          : 0;

      card.innerHTML = `
        <div class="product-image-wrapper">
          <img
            src="${product.image || ""}"
            alt="${product.name || ""}"
            loading="lazy"
          />
        </div>
        <p class="product-name" title="${product.name || ""}">
          ${product.name || ""}
        </p>
        <p class="product-price">₫${price.toLocaleString("vi-VN")}</p>
      `;

      card.addEventListener("click", () => {
        localStorage.setItem("selectedProduct", JSON.stringify(product));
        window.location.href = "chitiet.html";
      });

      productGrid.appendChild(card);
    });
  }

  function applySortAndRender() {
    const sortValue = sortSelect ? sortSelect.value : "default";
    let list = baseFiltered.slice();

    if (sortValue === "price-asc") {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortValue === "price-desc") {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    } else if (sortValue === "name-asc") {
      list.sort((a, b) => norm(a.name).localeCompare(norm(b.name)));
    } else if (sortValue === "name-desc") {
      list.sort((a, b) => norm(b.name).localeCompare(norm(a.name)));
    }

    renderProducts(list);
  }

  function updateView(list) {
    baseFiltered = Array.isArray(list) ? list.slice() : [];
    applySortAndRender();
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", applySortAndRender);
  }

  // ========= LỌC THEO URL =========
  function initFilterFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const searchKeyword = params.get("search");
    const categoryParam = params.get("category");
    const subcategoryParam = params.get("subcategory");

    let filtered = products.slice();

    if (searchKeyword) {
      const kw = norm(searchKeyword);
      filtered = filtered.filter((p) => norm(p.name).includes(kw));
      pageTitle.textContent = `Kết quả tìm kiếm cho: "${searchKeyword}"`;
      setBreadcrumb(`Kết quả: "${searchKeyword}"`);
    } else if (categoryParam && subcategoryParam) {
      const catNorm = norm(decodeURIComponent(categoryParam));
      const subNorm = norm(decodeURIComponent(subcategoryParam));

      filtered = filtered.filter(
        (p) =>
          norm(getCategory(p)) === catNorm &&
          norm(getSubcategory(p)) === subNorm
      );

      pageTitle.textContent = `Tất cả sản phẩm › ${decodeURIComponent(
        categoryParam
      )} › ${decodeURIComponent(subcategoryParam)}`;
      setBreadcrumb(pageTitle.textContent);
    } else if (categoryParam) {
      const catNorm = norm(decodeURIComponent(categoryParam));

      filtered = filtered.filter((p) => norm(getCategory(p)) === catNorm);

      pageTitle.textContent = `Tất cả sản phẩm › ${decodeURIComponent(
        categoryParam
      )}`;
      setBreadcrumb(pageTitle.textContent);
    } else {
      pageTitle.textContent = "Tất cả sản phẩm";
      setBreadcrumb("Tất cả sản phẩm");
    }

    updateView(filtered);
  }

  // ========= GỢI Ý TÌM KIẾM =========
  function showSuggestions(keyword) {
    const kw = norm(keyword);
    const matched = products
      .filter((p) => norm(p.name).includes(kw))
      .slice(0, 8);

    suggestions.innerHTML = "";

    if (matched.length === 0) {
      suggestions.innerHTML = "<li>Không tìm thấy sản phẩm</li>";
      return;
    }

    matched.forEach((product) => {
      const li = document.createElement("li");
      li.textContent = product.name;
      li.addEventListener("click", () => {
        searchInput.value = product.name;
        suggestions.innerHTML = "";
        pageTitle.textContent = `Kết quả tìm kiếm cho: "${product.name}"`;
        setBreadcrumb(pageTitle.textContent);
        updateView([product]);
      });
      suggestions.appendChild(li);
    });
  }

  // ========= TÌM KIẾM Ô TRÊN HEADER =========
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const keyword = e.target.value.trim();
      if (keyword) {
        showSuggestions(keyword);
      } else {
        suggestions.innerHTML = "";
        initFilterFromUrl();
      }
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const keyword = searchInput.value.trim();
        if (keyword) {
          const kw = norm(keyword);
          const filtered = products.filter((p) =>
            norm(p.name).includes(kw)
          );
          pageTitle.textContent = `Kết quả tìm kiếm cho: "${keyword}"`;
          setBreadcrumb(pageTitle.textContent);
          suggestions.innerHTML = "";
          updateView(filtered);
        } else {
          initFilterFromUrl();
        }
      }
    });
  }

  const searchBtn = document.querySelector(".search-box_btn");
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      const keyword = searchInput.value.trim();
      if (keyword) {
        const kw = norm(keyword);
        const filtered = products.filter((p) =>
          norm(p.name).includes(kw)
        );
        pageTitle.textContent = `Kết quả tìm kiếm cho: "${keyword}"`;
        setBreadcrumb(pageTitle.textContent);
        suggestions.innerHTML = "";
        updateView(filtered);
      } else {
        initFilterFromUrl();
      }
    });
  }

  // Ẩn gợi ý khi click ra ngoài
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-box")) {
      suggestions.innerHTML = "";
    }
  });

  // ========= CLICK MENU CATEGORY (đồ gia dụng) =========
  const categoryButtons = document.querySelectorAll(".menu > .menu-item");
  categoryButtons.forEach((li) => {
    li.addEventListener("click", (e) => {
      e.preventDefault();
      const text = li.querySelector("span").textContent.trim();
      const url = `all-product.html?category=${encodeURIComponent(text)}`;
      window.location.href = url;
    });
  });

  // ========= KHỞI ĐỘNG =========
  initFilterFromUrl();
});
