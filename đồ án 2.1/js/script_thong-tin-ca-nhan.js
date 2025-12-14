// Helpers validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
}

document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "Login.html";
    return;
  }

  // Sidebar username
  document.getElementById("sidebar-username").textContent =
    currentUser.fullname || "";

  // Nếu là admin, thêm liên kết vào trang quản trị
  if (currentUser.role === "admin") {
    const menu = document.querySelector(".sidebar-menu");
    if (menu) {
      const adminItem = document.createElement("li");
      adminItem.innerHTML =
        '<a href="admin-control.html"><i class="fa-solid fa-gauge-high"></i><span>Trang Admin</span></a>';
      menu.appendChild(adminItem);
    }
  }

  // Tabs
  const tabs = document.querySelectorAll(".sidebar-menu li[data-tab]");
  const tabSections = document.querySelectorAll(".tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const name = tab.getAttribute("data-tab");
      tabSections.forEach((sec) =>
        sec.classList.toggle("active", sec.id === `tab-${name}`)
      );
    });
  });

  // Prefill profile form
  const fullnameInput = document.getElementById("fullname");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  fullnameInput.value = currentUser.fullname || "";
  emailInput.value = currentUser.email || "";
  phoneInput.value = currentUser.phone || "";

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  // ===== CẬP NHẬT THÔNG TIN CÁ NHÂN =====
  document.getElementById("profile-form").addEventListener("submit", (e) => {
    e.preventDefault();

    // reset errors
    document.getElementById("fullname-error").textContent = "";
    document.getElementById("email-error").textContent = "";
    document.getElementById("phone-error").textContent = "";

    const fullname = fullnameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    let hasError = false;

    if (!fullname) {
      document.getElementById("fullname-error").textContent =
        "Vui lòng nhập họ và tên!";
      hasError = true;
    }

    if (!email) {
      document.getElementById("email-error").textContent =
        "Vui lòng nhập email!";
      hasError = true;
    } else if (!isValidEmail(email)) {
      document.getElementById("email-error").textContent =
        "Email không hợp lệ!";
      hasError = true;
    } else if (
      accounts.some(
        (acc) => acc.email === email && acc.email !== currentUser.email
      )
    ) {
      document.getElementById("email-error").textContent =
        "Email đã được sử dụng!";
      hasError = true;
    }

    if (!phone) {
      document.getElementById("phone-error").textContent =
        "Vui lòng nhập số điện thoại!";
      hasError = true;
    } else if (!isValidPhoneNumber(phone)) {
      document.getElementById("phone-error").textContent =
        "Số điện thoại không hợp lệ!";
      hasError = true;
    } else if (
      accounts.some(
        (acc) => acc.phone === phone && acc.phone !== currentUser.phone
      )
    ) {
      document.getElementById("phone-error").textContent =
        "Số điện thoại đã được sử dụng!";
      hasError = true;
    }

    if (hasError) return;

    // Update accounts và currentUser
    const updatedAccounts = accounts.map((acc) => {
      if (
        (acc.email === currentUser.email && acc.phone === currentUser.phone) ||
        acc.email === currentUser.email ||
        acc.phone === currentUser.phone
      ) {
        return { ...acc, fullname, email, phone };
      }
      return acc;
    });

    localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

    const newCurrent = { ...currentUser, fullname, email, phone };
    localStorage.setItem("currentUser", JSON.stringify(newCurrent));
    document.getElementById("sidebar-username").textContent = fullname;

    alert("Cập nhật thông tin cá nhân thành công.");
  });

  // ===== ĐỔI MẬT KHẨU =====
  document
    .getElementById("change-password-form")
    .addEventListener("submit", (e) => {
      e.preventDefault();

      document.getElementById("old-password-error").textContent = "";
      document.getElementById("new-password-error").textContent = "";
      document.getElementById("confirm-new-password-error").textContent = "";

      const oldPass = document.getElementById("old-password").value.trim();
      const newPass = document.getElementById("new-password").value.trim();
      const confirmNew = document
        .getElementById("confirm-new-password")
        .value.trim();

      let hasError = false;

      if (!oldPass) {
        document.getElementById("old-password-error").textContent =
          "Vui lòng nhập mật khẩu cũ!";
        hasError = true;
      } else if (oldPass !== currentUser.password) {
        document.getElementById("old-password-error").textContent =
          "Mật khẩu cũ không đúng!";
        hasError = true;
      }

      if (!newPass) {
        document.getElementById("new-password-error").textContent =
          "Vui lòng nhập mật khẩu mới!";
        hasError = true;
      } else if (newPass === oldPass) {
        document.getElementById("new-password-error").textContent =
          "Mật khẩu mới không được giống mật khẩu cũ!";
        hasError = true;
      }

      if (!confirmNew) {
        document.getElementById("confirm-new-password-error").textContent =
          "Vui lòng xác nhận mật khẩu mới!";
        hasError = true;
      } else if (newPass !== confirmNew) {
        document.getElementById("confirm-new-password-error").textContent =
          "Xác nhận mật khẩu không khớp!";
        hasError = true;
      }

      if (hasError) return;

      // Cập nhật mật khẩu trong accounts và currentUser
      const updatedAccounts = accounts.map((acc) => {
        if (
          (acc.email === currentUser.email &&
            acc.phone === currentUser.phone) ||
          acc.email === currentUser.email ||
          acc.phone === currentUser.phone
        ) {
          return { ...acc, password: newPass };
        }
        return acc;
      });

      localStorage.setItem("accounts", JSON.stringify(updatedAccounts));

      const newCurrent = { ...currentUser, password: newPass };
      localStorage.setItem("currentUser", JSON.stringify(newCurrent));

      alert("Đổi mật khẩu thành công.");

      document.getElementById("old-password").value = "";
      document.getElementById("new-password").value = "";
      document.getElementById("confirm-new-password").value = "";
    });

  // ===== ĐƠN MUA =====
  let ordersAll = JSON.parse(localStorage.getItem("orders")) || [];
  let userOrders = ordersAll.filter((o) => {
    const email = o.customerEmail || (o.user && o.user.email) || "";
    const phone = o.customerPhone || (o.user && o.user.phone) || "";
    return email === currentUser.email || phone === currentUser.phone;
  });

  const STATUS_LABEL = {
    pending: "Chờ xác nhận",
    shipping: "Chờ giao hàng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    refund: "Trả hàng/Hoàn tiền",
  };

  // chuẩn hoá chuỗi (bỏ dấu, lowercase, trim)
  function norm(str) {
    if (str === undefined || str === null) return "";
    return String(str)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  // Lấy key trạng thái chuẩn từ order.status (support cả tiếng Việt)
  function getStatusKey(order) {
    const raw = (order && (order.status || "")).toString();
    const sNorm = norm(raw);

    if (STATUS_LABEL.hasOwnProperty(raw)) return raw;

    for (const k of Object.keys(STATUS_LABEL)) {
      if (norm(k) === sNorm) return k;
    }

    for (const [k, lbl] of Object.entries(STATUS_LABEL)) {
      if (norm(lbl) === sNorm) return k;
    }

    if (sNorm.includes("xac") || sNorm.includes("cho xac")) return "pending";
    if (sNorm.includes("giao")) return "shipping";
    if (sNorm.includes("hoan")) return "completed";
    if (sNorm.includes("huy")) return "cancelled";
    if (sNorm.includes("tra") || sNorm.includes("hoan tien")) return "refund";

    return raw || "pending";
  }

  function refreshOrdersFromStorage() {
    ordersAll = JSON.parse(localStorage.getItem("orders")) || [];
    userOrders = ordersAll.filter((o) => {
      const email = o.customerEmail || (o.user && o.user.email) || "";
      const phone = o.customerPhone || (o.user && o.user.phone) || "";
      return email === currentUser.email || phone === currentUser.phone;
    });
  }

  function updateOrderStatus(orderId, newStatus) {
    const all = JSON.parse(localStorage.getItem("orders")) || [];
    const idx = all.findIndex((o) => String(o.id) === String(orderId));

    if (idx === -1) {
      const altIdx = all.findIndex(
        (o) => String(o.timestamp || o.createdAt || o.id) === String(orderId)
      );
      if (altIdx !== -1) {
        all[altIdx].status = newStatus;
        localStorage.setItem("orders", JSON.stringify(all));
        refreshOrdersFromStorage();
        renderOrders(currentFilter || "all");
      }
      return;
    }

    all[idx].status = newStatus;
    localStorage.setItem("orders", JSON.stringify(all));
    refreshOrdersFromStorage();
    renderOrders(currentFilter || "all");
  }

  function updateOrderPayment(orderId, paymentStatus) {
    const all = JSON.parse(localStorage.getItem("orders")) || [];
    const idx = all.findIndex((o) => String(o.id) === String(orderId));
    if (idx === -1) return;
    all[idx].payment = paymentStatus;
    localStorage.setItem("orders", JSON.stringify(all));
    refreshOrdersFromStorage();
    renderOrders(currentFilter || "all");
  }

  // sync khi admin page thay đổi orders
  window.addEventListener("storage", (e) => {
    if (e.key === "orders") {
      refreshOrdersFromStorage();
      renderOrders(currentFilter || "all");
    }
  });

  let currentFilter = "all";

  function renderOrders(filter = "all") {
    const list = document.getElementById("orders-list");
    list.innerHTML = "";
    currentFilter = filter;

    const filtered =
      filter === "all"
        ? userOrders
        : userOrders.filter((o) => getStatusKey(o) === filter);

    if (!filtered || filtered.length === 0) {
      list.innerHTML =
        '<p class="orders-empty">Không có đơn hàng phù hợp.</p>';
      return;
    }

    filtered.forEach((order) => {
      const items = order.products || order.items || [];
      const total =
        order.total ||
        order.totalAmount ||
        items.reduce(
          (s, p) => s + (Number(p.price) || 0) * (p.quantity || 1),
          0
        );

      const statusKey = order.status || "pending";
      const statusLabel = STATUS_LABEL[statusKey] || statusKey;

      const orderEl = document.createElement("div");
      orderEl.className = "order-item";

      // header
      const header = document.createElement("div");
      header.className = "order-header";

      const idEl = document.createElement("div");
      idEl.className = "order-id";
      idEl.textContent = `Đơn hàng: ${order.id || ""}`;

      const statusEl = document.createElement("div");
      statusEl.className = "order-status";
      statusEl.textContent = statusLabel;

      header.appendChild(idEl);
      header.appendChild(statusEl);

      // body: danh sách sản phẩm
      const body = document.createElement("div");
      body.className = "order-body";

      const itemsContainer = document.createElement("div");
      itemsContainer.className = "order-items-list";

      items.forEach((item) => {
        const itemRow = document.createElement("div");
        itemRow.className = "order-item-row";

        const img = document.createElement("img");
        img.className = "order-thumb";
        img.src = item.image || "placeholder.png";

        const info = document.createElement("div");
        info.className = "order-item-info";

        const nameEl = document.createElement("div");
        nameEl.className = "order-item-name";
        nameEl.textContent = item.name || "Sản phẩm";

        const qtyEl = document.createElement("div");
        qtyEl.className = "order-item-qty";
        qtyEl.textContent = `Số lượng: ${item.quantity || 1}`;

        const priceEl = document.createElement("div");
        priceEl.className = "order-item-price";
        priceEl.textContent = `Giá: ${Number(
          item.price || 0
        ).toLocaleString()}₫`;

        info.appendChild(nameEl);
        info.appendChild(qtyEl);
        info.appendChild(priceEl);

        itemRow.appendChild(img);
        itemRow.appendChild(info);
        itemsContainer.appendChild(itemRow);
      });

      body.appendChild(itemsContainer);

      // footer
      const footer = document.createElement("div");
      footer.className = "order-footer";

      const timeEl = document.createElement("div");
      timeEl.className = "order-time";
      timeEl.textContent = new Date(
        order.timestamp || order.createdAt || Date.now()
      ).toLocaleString();

      const rightFooter = document.createElement("div");
      rightFooter.className = "order-footer-right";

      const totalEl = document.createElement("div");
      totalEl.className = "order-total";
      totalEl.textContent = `Thành tiền: ${
        total ? Number(total).toLocaleString() + "₫" : "-"
      }`;

      const actions = document.createElement("div");
      actions.className = "order-actions";

      // actions
      if (statusKey === "pending" || statusKey === "shipping") {
        const btnCancel = document.createElement("button");
        btnCancel.className = "btn-cancel";
        btnCancel.textContent = "Hủy đơn";
        btnCancel.addEventListener("click", () => {
          if (!confirm("Bạn có chắc chắn muốn hủy đơn này?")) return;
          updateOrderStatus(order.id, "cancelled");
        });
        actions.appendChild(btnCancel);
      } else if (
        statusKey === "completed" ||
        statusKey === "cancelled" ||
        statusKey === "refund"
      ) {
        const btnBuy = document.createElement("button");
        btnBuy.className = "btn-buy";
        btnBuy.textContent = "Mua lại";
        btnBuy.addEventListener("click", () => {
          const carts = JSON.parse(localStorage.getItem("carts")) || {};
          const userCart = carts[currentUser.email] || [];

          items.forEach((p) => {
            const exist = userCart.find((it) => it.name === p.name);
            if (exist) {
              exist.quantity += p.quantity || 1;
            } else {
              userCart.push({ ...p, quantity: p.quantity || 1 });
            }
          });

          carts[currentUser.email] = userCart;
          localStorage.setItem("carts", JSON.stringify(carts));
          alert("Sản phẩm đã được thêm vào giỏ hàng.");
          window.location.href = "Shopping.html";
        });
        actions.appendChild(btnBuy);
      }

      rightFooter.appendChild(totalEl);
      rightFooter.appendChild(actions);

      footer.appendChild(timeEl);
      footer.appendChild(rightFooter);

      orderEl.appendChild(header);
      orderEl.appendChild(body);
      orderEl.appendChild(footer);

      list.appendChild(orderEl);
    });
  }

  // filter buttons
  document.querySelectorAll(".order-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".order-filter")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const f = btn.getAttribute("data-filter");

      const statusMap = {
        all: "all",
        pending: "pending",
        shipping: "shipping",
        completed: "completed",
        cancelled: "cancelled",
        refund: "refund",
      };

      renderOrders(statusMap[f] || "all");
    });
  });

  // initial render
  renderOrders("all");

  // Đăng xuất
  const sidebarLogout = document.getElementById("sidebar-logout");
  if (sidebarLogout) {
    sidebarLogout.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "Index.html";
    });
  }
});
