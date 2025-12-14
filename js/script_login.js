// SCRIPT ĐĂNG NHẬP / ĐĂNG KÝ – GIA DỤNG STORE

// --- Helpers -------------------------------------------------

// Hiện / ẩn mật khẩu
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.getElementById("toggle-password");
  if (!passwordInput || !toggleIcon) return;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  }
}

// Kiểm tra định dạng email
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Kiểm tra định dạng số điện thoại (10–11 số)
function isValidPhoneNumber(phone) {
  const phoneRegex = /^[0-9]{10,11}$/;
  return phoneRegex.test(phone);
}

// Tạo tài khoản admin mặc định (nếu chưa có)
function ensureDefaultAdmin() {
  const ACC_KEY = "accounts";
  const accounts = JSON.parse(localStorage.getItem(ACC_KEY)) || [];

  if (!accounts.some((acc) => acc.email === "admin")) {
    accounts.push({
      fullname: "Administrator",
      email: "admin",
      phone: "",
      password: "1",
      status: "active",
      role: "admin",
    });
    localStorage.setItem(ACC_KEY, JSON.stringify(accounts));
  }
}

// --- Xử lý đăng nhập ----------------------------------------
function handleLoginSubmit(event) {
  event.preventDefault();

  const emailOrPhoneInput = document.getElementById("email-or-phone");
  const passwordInput = document.getElementById("password");
  const errorElement = document.getElementById("login-error");

  if (!emailOrPhoneInput || !passwordInput || !errorElement) return;

  const emailOrPhone = emailOrPhoneInput.value.trim();
  const password = passwordInput.value.trim();

  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];
  const account = accounts.find(
    (acc) =>
      (acc.email === emailOrPhone || acc.phone === emailOrPhone) &&
      acc.password === password
  );

  if (!account) {
    errorElement.textContent =
      "Email/Số điện thoại hoặc mật khẩu không đúng!";
    errorElement.style.display = "block";
    return;
  }

  // Lưu user hiện tại
  localStorage.setItem("currentUser", JSON.stringify(account));

  if (account.status === "denied") {
    errorElement.textContent =
      "Tài khoản của bạn đã bị khóa vì vi phạm điều khoản!";
    errorElement.style.display = "block";
    return;
  }

  // Admin => chuyển sang trang quản trị
  if (account.role === "admin") {
    window.location.href = "admin-control.html";
  } else {
    window.location.href = "Index.html";
  }
}

// --- Xử lý đăng ký ------------------------------------------
function handleSignupSubmit(event) {
  event.preventDefault();

  const fullnameInput = document.getElementById("signup-fullname");
  const emailInput = document.getElementById("signup-email");
  const phoneInput = document.getElementById("signup-phone");
  const passwordInput = document.getElementById("signup-password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  if (
    !fullnameInput ||
    !emailInput ||
    !phoneInput ||
    !passwordInput ||
    !confirmPasswordInput
  ) {
    return;
  }

  const fullname = fullnameInput.value.trim();
  const email = emailInput.value.trim();
  const phone = phoneInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  const fullnameError = document.getElementById("signup-fullname-error");
  const emailError = document.getElementById("signup-email-error");
  const phoneError = document.getElementById("signup-phone-error");
  const passwordError = document.getElementById("signup-password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );

  // Reset lỗi
  [
    fullnameError,
    emailError,
    phoneError,
    passwordError,
    confirmPasswordError,
  ].forEach((el) => {
    if (!el) return;
    el.style.display = "none";
    el.textContent = "";
  });

  [fullnameInput, emailInput, phoneInput, passwordInput, confirmPasswordInput].forEach(
    (input) => {
      input.classList.remove("error");
    }
  );

  let hasError = false;
  const accounts = JSON.parse(localStorage.getItem("accounts")) || [];

  // Họ tên
  if (!fullname) {
    fullnameError.textContent = "Vui lòng nhập họ và tên!";
    fullnameError.style.display = "block";
    fullnameInput.classList.add("error");
    hasError = true;
  }

  // Email
  if (!email) {
    emailError.textContent = "Vui lòng nhập email!";
    emailError.style.display = "block";
    emailInput.classList.add("error");
    hasError = true;
  } else if (!isValidEmail(email)) {
    emailError.textContent = "Email không hợp lệ!";
    emailError.style.display = "block";
    emailInput.classList.add("error");
    hasError = true;
  } else if (accounts.some((acc) => acc.email === email)) {
    emailError.textContent = "Email đã được sử dụng!";
    emailError.style.display = "block";
    emailInput.classList.add("error");
    hasError = true;
  }

  // Số điện thoại
  if (!phone) {
    phoneError.textContent = "Vui lòng nhập số điện thoại!";
    phoneError.style.display = "block";
    phoneInput.classList.add("error");
    hasError = true;
  } else if (!isValidPhoneNumber(phone)) {
    phoneError.textContent = "Số điện thoại không hợp lệ!";
    phoneError.style.display = "block";
    phoneInput.classList.add("error");
    hasError = true;
  } else if (accounts.some((acc) => acc.phone === phone)) {
    phoneError.textContent = "Số điện thoại đã được sử dụng!";
    phoneError.style.display = "block";
    phoneInput.classList.add("error");
    hasError = true;
  }

  // Mật khẩu
  if (!password) {
    passwordError.textContent = "Vui lòng nhập mật khẩu!";
    passwordError.style.display = "block";
    passwordInput.classList.add("error");
    hasError = true;
  }

  // Xác nhận mật khẩu
  if (!confirmPassword) {
    confirmPasswordError.textContent = "Vui lòng xác nhận mật khẩu!";
    confirmPasswordError.style.display = "block";
    confirmPasswordInput.classList.add("error");
    hasError = true;
  } else if (password !== confirmPassword) {
    confirmPasswordError.textContent =
      "Mật khẩu và xác nhận mật khẩu không khớp!";
    confirmPasswordError.style.display = "block";
    confirmPasswordInput.classList.add("error");
    hasError = true;
  }

  if (hasError) return;

  // Lưu tài khoản
  accounts.push({
    fullname,
    email,
    phone,
    password,
    status: "active",
    role: "user",
  });

  localStorage.setItem("accounts", JSON.stringify(accounts));

  alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");

  // Chuyển về form đăng nhập
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");
  if (loginForm && signupForm) {
    signupForm.style.display = "none";
    loginForm.style.display = "block";
  }
}

// --- Chuyển đổi form -----------------------------------------
function bindFormSwitch() {
  const toSignup = document.getElementById("switch-to-signup");
  const toLogin = document.getElementById("switch-to-login");
  const loginForm = document.getElementById("login-form");
  const signupForm = document.getElementById("signup-form");

  if (toSignup) {
    toSignup.addEventListener("click", (e) => {
      e.preventDefault();
      if (!loginForm || !signupForm) return;
      loginForm.style.display = "none";
      signupForm.style.display = "block";
    });
  }

  if (toLogin) {
    toLogin.addEventListener("click", (e) => {
      e.preventDefault();
      if (!loginForm || !signupForm) return;
      signupForm.style.display = "none";
      loginForm.style.display = "block";
    });
  }
}

// --- Khởi tạo ------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  ensureDefaultAdmin();

  // Gắn sự kiện toggle password
  const toggleIcon = document.getElementById("toggle-password");
  if (toggleIcon) {
    toggleIcon.addEventListener("click", togglePasswordVisibility);
  }

  // Submit đăng nhập
  const loginFormEl = document.querySelector("#login-form form");
  if (loginFormEl) {
    loginFormEl.addEventListener("submit", handleLoginSubmit);
  }

  // Submit đăng ký
  const signupFormEl = document.querySelector("#signup-form form");
  if (signupFormEl) {
    signupFormEl.addEventListener("submit", handleSignupSubmit);
  }

  // Chuyển đổi form
  bindFormSwitch();
});
