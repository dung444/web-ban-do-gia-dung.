// script_forgot-password.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== ELEMENTS =====
  const step1 = document.getElementById("forgot-step1");
  const step2 = document.getElementById("forgot-step2");
  const step3 = document.getElementById("forgot-step3");
  const successSection = document.getElementById("forgot-success");

  const forgotEmailForm = document.getElementById("forgot-email-form");
  const verifyCodeForm = document.getElementById("verify-code-form");
  const resetPasswordForm = document.getElementById("reset-password-form");

  const forgotEmailInput = document.getElementById("forgot-email");
  const verifyCodeInput = document.getElementById("verify-code");
  const newPasswordInput = document.getElementById("new-password");
  const confirmNewPasswordInput = document.getElementById("confirm-new-password");

  const sentEmailSpan = document.getElementById("sent-email");
  const resendCodeLink = document.getElementById("resend-code");
  const backToEmailLink = document.getElementById("back-to-email");
  const countdownSpan = document.getElementById("countdown");

  // ===== STATE =====
  let currentEmail = "";
  let generatedCode = "";
  let resendTimer = null;
  let canResend = false;

  // ===== UTILITY FUNCTIONS =====
  function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
      errorElement.style.display = "none";
    }
  }

  function hideAllErrors() {
    const errorElements = document.querySelectorAll(".error-message");
    errorElements.forEach(el => el.style.display = "none");
  }

  function showStep(stepElement) {
    [step1, step2, step3, successSection].forEach(el => {
      el.style.display = "none";
    });
    stepElement.style.display = "block";
    hideAllErrors();
  }

  function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  function startResendCountdown() {
    let timeLeft = 60;
    canResend = false;
    resendCodeLink.style.pointerEvents = "none";
    resendCodeLink.style.opacity = "0.6";

    resendTimer = setInterval(() => {
      timeLeft--;
      countdownSpan.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(resendTimer);
        canResend = true;
        resendCodeLink.style.pointerEvents = "auto";
        resendCodeLink.style.opacity = "1";
        resendCodeLink.innerHTML = '<i class="fas fa-redo"></i> Gửi lại mã';
      }
    }, 1000);
  }

  function simulateEmailSend(email, code) {
    // Trong thực tế, đây sẽ là API call để gửi email
    console.log(`[DEMO] Gửi mã ${code} đến email ${email}`);
    
    // Hiển thị mã trong console để test (chỉ trong môi trường dev)
    alert(`[DEMO MODE] Mã xác thực của bạn là: ${code}\n(Trong thực tế, mã này sẽ được gửi qua email)`);
    
    return Promise.resolve(true);
  }

  // ===== STEP 1: NHẬP EMAIL =====
  forgotEmailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const email = forgotEmailInput.value.trim();
    
    // Validation
    if (!email) {
      showError("forgot-email-error", "Vui lòng nhập email");
      return;
    }

    if (!validateEmail(email)) {
      showError("forgot-email-error", "Email không hợp lệ");
      return;
    }

    // Kiểm tra email có tồn tại trong hệ thống không
    const users = JSON.parse(localStorage.getItem("accounts") || "[]");
    const userExists = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if (!userExists) {
      showError("forgot-email-error", "Email này chưa được đăng ký trong hệ thống");
      return;
    }

    // Tạo mã xác thực và gửi email
    currentEmail = email;
    generatedCode = generateVerificationCode();

    try {
      // Disable button
      const submitBtn = forgotEmailForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang gửi...';

      await simulateEmailSend(currentEmail, generatedCode);

      // Chuyển sang bước 2
      sentEmailSpan.textContent = currentEmail;
      showStep(step2);
      startResendCountdown();
      verifyCodeInput.focus();

    } catch (error) {
      showError("forgot-email-error", "Có lỗi xảy ra khi gửi email. Vui lòng thử lại.");
    } finally {
      // Re-enable button
      const submitBtn = forgotEmailForm.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Gửi mã xác thực';
    }
  });

  // ===== STEP 2: XÁC THỰC MÃ =====
  verifyCodeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const enteredCode = verifyCodeInput.value.trim();
    
    // Validation
    if (!enteredCode) {
      showError("verify-code-error", "Vui lòng nhập mã xác thực");
      return;
    }

    if (enteredCode.length !== 6) {
      showError("verify-code-error", "Mã xác thực phải có 6 chữ số");
      return;
    }

    if (enteredCode !== generatedCode) {
      showError("verify-code-error", "Mã xác thực không đúng. Vui lòng kiểm tra lại.");
      return;
    }

    // Chuyển sang bước 3
    showStep(step3);
    newPasswordInput.focus();
  });

  // ===== STEP 3: ĐẶT MẬT KHẨU MỚI =====
  resetPasswordForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const newPassword = newPasswordInput.value;
    const confirmPassword = confirmNewPasswordInput.value;
    
    // Validation
    if (!newPassword) {
      showError("new-password-error", "Vui lòng nhập mật khẩu mới");
      return;
    }

    if (!validatePassword(newPassword)) {
      showError("new-password-error", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (!confirmPassword) {
      showError("confirm-new-password-error", "Vui lòng xác nhận mật khẩu");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("confirm-new-password-error", "Mật khẩu xác nhận không khớp");
      return;
    }

    // Cập nhật mật khẩu trong localStorage
    const users = JSON.parse(localStorage.getItem("accounts") || "[]");
    const userIndex = users.findIndex(user => user.email.toLowerCase() === currentEmail.toLowerCase());

    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem("accounts", JSON.stringify(users));

      // Hiển thị thành công
      showStep(successSection);
    } else {
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  });

  // ===== EVENT HANDLERS =====
  
  // Gửi lại mã
  resendCodeLink.addEventListener("click", async (e) => {
    e.preventDefault();
    
    if (!canResend) return;

    generatedCode = generateVerificationCode();
    
    try {
      await simulateEmailSend(currentEmail, generatedCode);
      startResendCountdown();
      hideError("verify-code-error");
    } catch (error) {
      showError("verify-code-error", "Có lỗi xảy ra khi gửi lại mã. Vui lòng thử lại.");
    }
  });

  // Quay lại thay đổi email
  backToEmailLink.addEventListener("click", (e) => {
    e.preventDefault();
    showStep(step1);
    if (resendTimer) {
      clearInterval(resendTimer);
    }
  });

  // Toggle password visibility
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("toggle-password")) {
      const targetId = e.target.getAttribute("data-target");
      const targetInput = document.getElementById(targetId);
      
      if (targetInput) {
        if (targetInput.type === "password") {
          targetInput.type = "text";
          e.target.classList.remove("fa-eye");
          e.target.classList.add("fa-eye-slash");
        } else {
          targetInput.type = "password";
          e.target.classList.remove("fa-eye-slash");
          e.target.classList.add("fa-eye");
        }
      }
    }
  });

  // Auto-format verification code input
  verifyCodeInput.addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, ""); // Chỉ cho phép số
    if (value.length > 6) {
      value = value.slice(0, 6);
    }
    e.target.value = value;
  });

  // Clear errors on input
  [forgotEmailInput, verifyCodeInput, newPasswordInput, confirmNewPasswordInput].forEach(input => {
    if (input) {
      input.addEventListener("input", () => {
        const errorId = input.id + "-error";
        hideError(errorId);
      });
    }
  });
});