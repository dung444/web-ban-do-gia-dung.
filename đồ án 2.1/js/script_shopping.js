// SCRIPT GIỎ HÀNG – GIA DỤNG STORE
document.addEventListener("DOMContentLoaded", () => {
  const selectAllCheckbox = document.getElementById("select-all");
  const selectAllFooter = document.getElementById("select-all-footer");
  const totalLabel = document.querySelector(".footer-left label");
  const totalTextSpan = document.querySelector(".footer-right span");
  const emptyCartMessage = document.getElementById("empty-cart-message");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const userInfo = document.getElementById("user-info");
  const logoutBtn = document.getElementById("logout-btn");

  // Thêm nút đăng nhập nếu chưa đăng nhập
  const loginLink = document.createElement("a");
  loginLink.href = "Login.html";
  loginLink.id = "login-link";
  loginLink.innerHTML = `<button class="login-btn">Đăng nhập</button>`;

  if (currentUser) {
    userInfo.textContent = `${currentUser.fullname}`;
    logoutBtn.style.display = "inline-flex";

    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      userInfo.textContent = "";
      logoutBtn.style.display = "none";
      userInfo.parentElement.appendChild(loginLink);
    });
  } else {
    userInfo.textContent = "";
    logoutBtn.style.display = "none";
    userInfo.parentElement.appendChild(loginLink);
  }

  let productCheckboxes = [];
  let quantityInputs = [];

  // Lưu giỏ hàng vào localStorage (theo tài khoản)
  function saveCartToLocalStorage() {
    const tbodyRows = document.querySelectorAll(".shopping-table tbody tr");
    const cart = [];

    tbodyRows.forEach((row) => {
      const quantityInput = row.querySelector(".quantity-input");
      const price = row.querySelector(".price")?.dataset.price;
      const nameCell = row.querySelector("td:nth-child(3)");
      const imgEl = row.querySelector(".product-image");

      if (!quantityInput || !price || !nameCell || !imgEl) return;

      cart.push({
        name: nameCell.textContent.trim(),
        quantity: parseInt(quantityInput.value),
        price: parseInt(price),
        image: imgEl.src,
      });
    });

    if (currentUser) {
      const carts = JSON.parse(localStorage.getItem("carts")) || {};
      carts[currentUser.email] = cart;
      localStorage.setItem("carts", JSON.stringify(carts));
    }
  }

  // Cập nhật trạng thái hiển thị giỏ trống / có hàng
  function updateEmptyCartState() {
    const tbodyRows = document.querySelectorAll(".shopping-table tbody tr");

    if (tbodyRows.length === 0) {
      if (emptyCartMessage) emptyCartMessage.style.display = "block";
    } else {
      if (emptyCartMessage) emptyCartMessage.style.display = "none";
    }
  }

  // Gửi lại tổng tiền & số lượng
  function updateTotals() {
    let totalCheckedProducts = 0;
    let totalQuantity = 0;
    let totalPrice = 0;

    productCheckboxes.forEach((checkbox, index) => {
      if (checkbox.checked) {
        const quantity = parseInt(quantityInputs[index]?.value || "0", 10);
        const row = checkbox.closest("tr");
        const price = parseInt(
          row.querySelector(".price")?.dataset.price || "0",
          10
        );

        totalCheckedProducts += 1;
        totalQuantity += quantity;
        totalPrice += quantity * price;
      }
    });

    if (totalLabel) {
      totalLabel.textContent = `Chọn Tất Cả (${totalCheckedProducts})`;
    }

    if (totalTextSpan) {
      totalTextSpan.innerHTML = `Tổng cộng (${totalQuantity} Sản phẩm): <strong>₫${totalPrice.toLocaleString()}</strong>`;
    }
  }

  // Load giỏ hàng từ localStorage
  function loadCartFromLocalStorage() {
    const tbody = document.querySelector(".shopping-table tbody");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (!currentUser) {
      // Nếu chưa đăng nhập
      updateEmptyCartState();
      return;
    }

    const carts = JSON.parse(localStorage.getItem("carts")) || {};
    const cart = carts[currentUser.email] || [];
    const flashSaleProducts =
      JSON.parse(localStorage.getItem("flashSaleProducts")) || [];

    cart.forEach((item) => {
      const flashSaleProduct = flashSaleProducts.find(
        (p) => p.name === item.name
      );
      const price = flashSaleProduct
        ? flashSaleProduct.discountedPrice
        : item.price;

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>
          <input type="checkbox" class="product-checkbox" />
        </td>
        <td>
          <img src="${item.image}" alt="${item.name}" class="product-image" />
        </td>
        <td>
          <span>${item.name}</span>
        </td>
        <td class="price" data-price="${price}">
          ₫${price.toLocaleString()}
        </td>
        <td>
          <div class="quantity-wrapper">
            <button class="quantity-btn btn-decrease" type="button">-</button>
            <input type="text" class="quantity-input" value="${item.quantity}" />
            <button class="quantity-btn btn-increase" type="button">+</button>
          </div>
        </td>
        <td class="total-price">
          ₫${(item.quantity * price).toLocaleString()}
        </td>
        <td>
          <a href="#" class="delete-row">Xóa</a>
        </td>
      `;
      tbody.appendChild(row);
    });

    attachEventListeners();
    updateTotals();
    updateEmptyCartState();
  }

  // Gán lại NodeList sau khi render
  function refreshInputs() {
    productCheckboxes = Array.from(
      document.querySelectorAll(".product-checkbox")
    );
    quantityInputs = Array.from(
      document.querySelectorAll(".quantity-input")
    );
  }

  // Gắn các event cho các phần tử trong bảng
  function attachEventListeners() {
    refreshInputs();

    // + / - số lượng
    const increaseButtons = document.querySelectorAll(".btn-increase");
    const decreaseButtons = document.querySelectorAll(".btn-decrease");

    increaseButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const quantityInput = quantityInputs[index];
        if (!quantityInput) return;

        let quantity = parseInt(quantityInput.value || "0", 10);
        quantity = isNaN(quantity) ? 1 : quantity + 1;
        quantityInput.value = quantity;

        const row = button.closest("tr");
        const price = parseInt(
          row.querySelector(".price")?.dataset.price || "0",
          10
        );

        row.querySelector(".total-price").textContent = `₫${(
          quantity * price
        ).toLocaleString()}`;

        updateTotals();
        saveCartToLocalStorage();
      });
    });

    decreaseButtons.forEach((button, index) => {
      button.addEventListener("click", () => {
        const quantityInput = quantityInputs[index];
        if (!quantityInput) return;

        let quantity = parseInt(quantityInput.value || "0", 10);
        quantity = isNaN(quantity) ? 1 : quantity - 1;

        if (quantity < 1) quantity = 1;
        quantityInput.value = quantity;

        const row = button.closest("tr");
        const price = parseInt(
          row.querySelector(".price")?.dataset.price || "0",
          10
        );

        row.querySelector(".total-price").textContent = `₫${(
          quantity * price
        ).toLocaleString()}`;

        updateTotals();
        saveCartToLocalStorage();
      });
    });

    // Tự sửa số lượng bằng tay
    quantityInputs.forEach((input) => {
      input.addEventListener("change", () => {
        let quantity = parseInt(input.value || "0", 10);
        if (isNaN(quantity) || quantity < 1) quantity = 1;
        input.value = quantity;

        const row = input.closest("tr");
        const price = parseInt(
          row.querySelector(".price")?.dataset.price || "0",
          10
        );
        row.querySelector(".total-price").textContent = `₫${(
          quantity * price
        ).toLocaleString()}`;

        updateTotals();
        saveCartToLocalStorage();
      });
    });

    // Checkbox từng sản phẩm
    productCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        if (!checkbox.checked) {
          if (selectAllCheckbox) selectAllCheckbox.checked = false;
          if (selectAllFooter) selectAllFooter.checked = false;
        } else if (
          productCheckboxes.length > 0 &&
          productCheckboxes.every((cb) => cb.checked)
        ) {
          if (selectAllCheckbox) selectAllCheckbox.checked = true;
          if (selectAllFooter) selectAllFooter.checked = true;
        }
        updateTotals();
      });
    });

    // Xóa từng hàng
    const deleteButtons = document.querySelectorAll(".delete-row");
    deleteButtons.forEach((deleteButton) => {
      deleteButton.addEventListener("click", (event) => {
        event.preventDefault();
        const row = deleteButton.closest("tr");
        if (row) {
          row.remove();
          refreshInputs();
          updateTotals();
          saveCartToLocalStorage();
          updateEmptyCartState();
        }
      });
    });
  }

  // Chọn tất cả (trên đầu)
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener("change", () => {
      const isChecked = selectAllCheckbox.checked;
      if (selectAllFooter) selectAllFooter.checked = isChecked;
      productCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      updateTotals();
    });
  }

  // Chọn tất cả (dưới footer)
  if (selectAllFooter) {
    selectAllFooter.addEventListener("change", () => {
      const isChecked = selectAllFooter.checked;
      if (selectAllCheckbox) selectAllCheckbox.checked = isChecked;
      productCheckboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
      });
      updateTotals();
    });
  }

  // Xóa nhiều sản phẩm / xóa hết
  const deleteAllLink = document.querySelector(".delete-all");
  if (deleteAllLink) {
    deleteAllLink.addEventListener("click", (e) => {
      e.preventDefault();

      const checked = document.querySelectorAll(".product-checkbox:checked");
      const tbody = document.querySelector(".shopping-table tbody");
      if (!tbody) return;

      if (checked.length === 0) {
        // Không tick gì -> hỏi có muốn xóa toàn bộ
        const confirmAll = confirm(
          "Bạn chưa chọn sản phẩm nào. Bạn có muốn xóa toàn bộ sản phẩm trong giỏ hàng không?"
        );
        if (!confirmAll) return;
        tbody.innerHTML = "";
      } else {
        checked.forEach((cb) => {
          const row = cb.closest("tr");
          if (row) row.remove();
        });
      }

      refreshInputs();
      updateTotals();
      saveCartToLocalStorage();
      updateEmptyCartState();

      if (selectAllCheckbox) selectAllCheckbox.checked = false;
      if (selectAllFooter) selectAllFooter.checked = false;
    });
  }

  // Nút Mua hàng
  const buyButton = document.querySelector(".buy-button");
  if (buyButton) {
    buyButton.addEventListener("click", () => {
      const selectedProducts = [];
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser) {
        alert("Vui lòng đăng nhập trước khi mua hàng");
        window.location.href = "Login.html";
        return;
      }

      const rows = document.querySelectorAll(".shopping-table tbody tr");
      rows.forEach((row) => {
        const checkbox = row.querySelector(".product-checkbox");
        if (!checkbox || !checkbox.checked) return;

        const name = row
          .querySelector("td:nth-child(3)")
          ?.textContent.trim();
        const price = parseFloat(
          row.querySelector(".price")?.dataset.price || "0"
        );
        const quantity = parseInt(
          row.querySelector(".quantity-input")?.value || "0",
          10
        );
        const image = row.querySelector(".product-image")?.src || "";
        const totalPrice = price * quantity;

        if (!name || quantity <= 0 || price <= 0) return;

        selectedProducts.push({
          name,
          price,
          quantity,
          image,
          totalPrice,
        });
      });

      if (selectedProducts.length === 0) {
        alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
        return;
      }

      localStorage.setItem(
        "selectedProducts",
        JSON.stringify(selectedProducts)
      );
      window.location.href = "Thanh-toan.html";
    });
  }

  // Khởi động
  loadCartFromLocalStorage();
});
