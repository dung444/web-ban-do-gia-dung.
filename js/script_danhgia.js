// script_danhgia.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== HIỂN THỊ USER / ĐĂNG XUẤT =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");

  if (currentUser) {
    userInfo.textContent = currentUser.fullname || "Tài khoản";
    logoutBtn.style.display = "inline-block";

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      alert("Bạn đã đăng xuất!");
      window.location.href = "Login.html";
    });
  } else {
    userInfo.textContent = "Khách";
    logoutBtn.style.display = "none";
  }

  // ===== STAR RATING =====
  const stars = document.querySelectorAll(".star");
  let selectedRating = 0;

  const updateStars = (value) => {
    stars.forEach((s, index) => {
      if (index < value) {
        s.src = "icon/star-yellow.png";
      } else {
        s.src = "icon/star-gray.png";
      }
    });
  };

  stars.forEach((star) => {
    const value = parseInt(star.getAttribute("data-value"), 10);

    // Hover
    star.addEventListener("mouseover", () => {
      updateStars(value);
    });

    // Rời chuột
    star.addEventListener("mouseout", () => {
      updateStars(selectedRating);
    });

    // Click chọn sao
    star.addEventListener("click", () => {
      selectedRating = value;
      updateStars(selectedRating);
    });
  });

  // ===== GỬI ĐÁNH GIÁ =====
  const submitBtn = document.getElementById("submit-review-btn");

  submitBtn.addEventListener("click", () => {
    const comment = document.getElementById("comment").value.trim();

    if (selectedRating === 0) {
      alert("Vui lòng chọn số sao để đánh giá!");
      return;
    }

    if (!comment) {
      alert("Vui lòng nhập bình luận!");
      return;
    }

    // Sản phẩm cần đánh giá
    const productToReview = JSON.parse(
      localStorage.getItem("productToReview") || "null"
    );
    if (!productToReview) {
      alert("Không tìm thấy sản phẩm để đánh giá!");
      return;
    }

    // Người dùng hiện tại
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    if (!currentUser) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }

    // Lưu đánh giá vào localStorage
    const reviews = JSON.parse(localStorage.getItem("reviews") || "{}");
    const productKey = productToReview.name;

    if (!reviews[productKey]) {
      reviews[productKey] = [];
    }

    reviews[productKey].push({
      user: currentUser.fullname,
      rating: selectedRating,
      comment: comment,
      createdAt: new Date().toISOString(),
    });

    localStorage.setItem("reviews", JSON.stringify(reviews));

    alert("Đánh giá của bạn đã được gửi. Cảm ơn bạn!");

    // Xoá tạm sản phẩm, quay lại trang chi tiết
    localStorage.removeItem("productToReview");
    window.location.href = "chitiet.html";
  });
});
