// script_admin_payment.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== KIỂM TRA QUYỀN ADMIN =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "Login.html";
    return;
  }

  // ===== KHỞI TẠO =====
  initTabs();
  loadPaymentMethods();
  loadBankInfo();
  loadQRCodes();
  loadTransactions();

  // ===== TAB MANAGEMENT =====
  function initTabs() {
    const tabs = document.querySelectorAll(".payment-tab");
    const contents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        const targetTab = tab.dataset.tab;

        // Remove active class from all tabs and contents
        tabs.forEach(t => t.classList.remove("active"));
        contents.forEach(c => c.classList.remove("active"));

        // Add active class to clicked tab and corresponding content
        tab.classList.add("active");
        document.getElementById(`${targetTab}-tab`).classList.add("active");
      });
    });
  }

  // ===== PHƯƠNG THỨC THANH TOÁN =====
  function loadPaymentMethods() {
    const defaultMethods = [
      {
        id: "cod",
        name: "Thanh toán khi nhận hàng (COD)",
        description: "Khách hàng thanh toán tiền mặt khi nhận hàng",
        icon: "💵",
        enabled: true,
        fee: 0
      },
      {
        id: "bank_transfer",
        name: "Chuyển khoản ngân hàng",
        description: "Chuyển khoản qua tài khoản ngân hàng",
        icon: "🏦",
        enabled: true,
        fee: 0
      },
      {
        id: "qr_payment",
        name: "Thanh toán QR Code",
        description: "Quét mã QR để thanh toán nhanh",
        icon: "📱",
        enabled: true,
        fee: 0
      },
      {
        id: "credit_card",
        name: "Thẻ tín dụng/Ghi nợ",
        description: "Thanh toán bằng thẻ Visa, Mastercard",
        icon: "💳",
        enabled: false,
        fee: 2.5
      }
    ];

    let paymentMethods = JSON.parse(localStorage.getItem("paymentMethods"));
    if (!paymentMethods) {
      paymentMethods = defaultMethods;
      localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    }

    renderPaymentMethods(paymentMethods);
  }

  function renderPaymentMethods(methods) {
    const container = document.getElementById("payment-methods-list");
    container.innerHTML = "";

    methods.forEach(method => {
      const methodElement = document.createElement("div");
      methodElement.className = "payment-method-item";
      methodElement.innerHTML = `
        <div class="payment-method-info">
          <div class="payment-method-icon">${method.icon}</div>
          <div class="payment-method-details">
            <h4>${method.name}</h4>
            <p>${method.description}</p>
            ${method.fee > 0 ? `<p><strong>Phí: ${method.fee}%</strong></p>` : ''}
          </div>
        </div>
        <div class="payment-method-actions">
          <label class="toggle-switch">
            <input type="checkbox" ${method.enabled ? 'checked' : ''} 
                   onchange="togglePaymentMethod('${method.id}', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </div>
      `;
      container.appendChild(methodElement);
    });
  }

  window.togglePaymentMethod = function(methodId, enabled) {
    const methods = JSON.parse(localStorage.getItem("paymentMethods"));
    const method = methods.find(m => m.id === methodId);
    if (method) {
      method.enabled = enabled;
      localStorage.setItem("paymentMethods", JSON.stringify(methods));
      showSuccess(`${enabled ? 'Bật' : 'Tắt'} phương thức thanh toán thành công`);
    }
  };

  // ===== THÔNG TIN NGÂN HÀNG =====
  function loadBankInfo() {
    const bankInfo = JSON.parse(localStorage.getItem("bankInfo"));
    if (bankInfo) {
      document.getElementById("bank-name").value = bankInfo.bankName || "";
      document.getElementById("account-number").value = bankInfo.accountNumber || "";
      document.getElementById("account-holder").value = bankInfo.accountHolder || "";
      document.getElementById("branch").value = bankInfo.branch || "";
      document.getElementById("transfer-note").value = bankInfo.transferNote || "";
    }
  }

  document.getElementById("bank-info-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const bankInfo = {
      bankName: document.getElementById("bank-name").value.trim(),
      accountNumber: document.getElementById("account-number").value.trim(),
      accountHolder: document.getElementById("account-holder").value.trim(),
      branch: document.getElementById("branch").value.trim(),
      transferNote: document.getElementById("transfer-note").value.trim(),
      updatedAt: new Date().toISOString()
    };

    // Validation
    if (!bankInfo.bankName || !bankInfo.accountNumber || !bankInfo.accountHolder) {
      showError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    localStorage.setItem("bankInfo", JSON.stringify(bankInfo));
    showSuccess("Lưu thông tin ngân hàng thành công!");
  });

  // ===== MÃ QR THANH TOÁN =====
  function loadQRCodes() {
    const qrCodes = JSON.parse(localStorage.getItem("qrCodes"));
    if (qrCodes) {
      if (qrCodes.mainQR) {
        showQRPreview("main-qr-preview", qrCodes.mainQR);
      }
      if (qrCodes.backupQR) {
        showQRPreview("backup-qr-preview", qrCodes.backupQR);
      }
    }
  }

  function showQRPreview(containerId, imageData) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <img src="${imageData}" alt="QR Code" />
      <p style="margin-top: 8px; color: #6b7280; font-size: 14px;">
        <i class="fas fa-check-circle" style="color: #10b981;"></i>
        Đã tải lên
      </p>
    `;
  }

  // Handle QR upload
  document.getElementById("main-qr-upload").addEventListener("change", (e) => {
    handleQRUpload(e, "main-qr-preview");
  });

  document.getElementById("backup-qr-upload").addEventListener("change", (e) => {
    handleQRUpload(e, "backup-qr-preview");
  });

  function handleQRUpload(event, previewId) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showError("Vui lòng chọn file ảnh!");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError("Kích thước file không được vượt quá 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      showQRPreview(previewId, e.target.result);
    };
    reader.readAsDataURL(file);
  }

  window.saveQRCodes = function() {
    const mainQRImg = document.querySelector("#main-qr-preview img");
    const backupQRImg = document.querySelector("#backup-qr-preview img");

    const qrCodes = {
      mainQR: mainQRImg ? mainQRImg.src : null,
      backupQR: backupQRImg ? backupQRImg.src : null,
      updatedAt: new Date().toISOString()
    };

    if (!qrCodes.mainQR) {
      showError("Vui lòng tải lên ít nhất một mã QR chính!");
      return;
    }

    localStorage.setItem("qrCodes", JSON.stringify(qrCodes));
    showSuccess("Lưu mã QR thành công!");
  };

  // ===== GIAO DỊCH =====
  function loadTransactions() {
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const transactionsContainer = document.getElementById("transactions-list");

    if (orders.length === 0) {
      transactionsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #6b7280;">
          <i class="fas fa-receipt" style="font-size: 48px; margin-bottom: 16px;"></i>
          <p>Chưa có giao dịch nào</p>
        </div>
      `;
      return;
    }

    const transactionsHTML = orders.map(order => {
      const date = new Date(order.timestamp).toLocaleString('vi-VN');
      const statusColor = getStatusColor(order.status);
      const paymentStatusColor = getPaymentStatusColor(order.payment);

      return `
        <div class="transaction-item" style="
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 12px;
          background: white;
        ">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <div>
              <h4 style="margin: 0 0 4px 0; color: #111827;">Đơn hàng #${order.id}</h4>
              <p style="margin: 0; color: #6b7280; font-size: 14px;">
                <i class="fas fa-clock"></i> ${date}
              </p>
            </div>
            <div style="text-align: right;">
              <div style="
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                color: white;
                background: ${statusColor};
                margin-bottom: 4px;
              ">
                ${getStatusText(order.status)}
              </div>
              <div style="
                display: inline-block;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                font-weight: 500;
                color: white;
                background: ${paymentStatusColor};
              ">
                ${getPaymentStatusText(order.payment)}
              </div>
            </div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; font-size: 14px;">
            <div>
              <strong>Khách hàng:</strong><br>
              ${order.user?.fullname || 'N/A'}<br>
              ${order.user?.email || 'N/A'}
            </div>
            <div>
              <strong>Địa chỉ:</strong><br>
              ${order.address || 'N/A'}
            </div>
            <div>
              <strong>Tổng tiền:</strong><br>
              <span style="color: #ef4444; font-weight: 600; font-size: 16px;">
                ₫${Number(order.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #f3f4f6;">
            <strong style="font-size: 14px;">Sản phẩm:</strong>
            <div style="margin-top: 8px;">
              ${order.products?.map(product => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px;">
                  <span>${product.name} x${product.quantity}</span>
                  <span>₫${Number(product.price * product.quantity).toLocaleString()}</span>
                </div>
              `).join('') || '<span style="color: #6b7280;">Không có thông tin sản phẩm</span>'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    transactionsContainer.innerHTML = transactionsHTML;
  }

  function getStatusColor(status) {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'shipping': return '#8b5cf6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  }

  function getStatusText(status) {
    switch (status) {
      case 'pending': return 'Chờ xác nhận';
      case 'confirmed': return 'Đã xác nhận';
      case 'shipping': return 'Đang giao';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  }

  function getPaymentStatusColor(payment) {
    switch (payment) {
      case 'unpaid': return '#ef4444';
      case 'paid': return '#10b981';
      case 'refunded': return '#6b7280';
      default: return '#f59e0b';
    }
  }

  function getPaymentStatusText(payment) {
    switch (payment) {
      case 'unpaid': return 'Chưa thanh toán';
      case 'paid': return 'Đã thanh toán';
      case 'refunded': return 'Đã hoàn tiền';
      default: return 'Chờ thanh toán';
    }
  }

  // ===== UTILITY FUNCTIONS =====
  function showSuccess(message) {
    const successElement = document.getElementById("success-message");
    const successText = document.getElementById("success-text");
    successText.textContent = message;
    successElement.style.display = "block";
    
    setTimeout(() => {
      successElement.style.display = "none";
    }, 3000);
  }

  function showError(message) {
    const errorElement = document.getElementById("error-message");
    const errorText = document.getElementById("error-text");
    errorText.textContent = message;
    errorElement.style.display = "block";
    
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
});