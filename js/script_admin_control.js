// script_admin_control.js
// Dashboard admin cho Gia Dụng Store

// CÁC DANH MỤC CHUẨN THEO CHỦ ĐỀ ĐỒ GIA DỤNG
var GD_CATEGORIES = [
  "Dụng cụ bếp",
  "Gia dụng nhỏ",
  "Vệ sinh & Làm sạch",
  "Lưu trữ",
  "Phòng tắm",
  "Vải & Khăn",
  "Phụ kiện"
];

// ------------------ HELPER CHUNG ------------------ //
function safeParse(key) {
  try {
    var val = localStorage.getItem(key);
    return val ? JSON.parse(val) : [];
  } catch (e) {
    console.error("Lỗi parse localStorage key=" + key, e);
    return [];
  }
}

function safeSave(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Lỗi lưu localStorage key=" + key, e);
  }
}

// ------------------ KHỞI TẠO DASHBOARD ------------------ //
document.addEventListener("DOMContentLoaded", function () {
  var currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser"));
  } catch (e) {
    currentUser = null;
  }

  var nameEl = document.getElementById("admin-name");
  var logoutBtn = document.getElementById("admin-logout");

  if (currentUser && currentUser.fullname) {
    nameEl.textContent = currentUser.fullname;
  } else {
    nameEl.textContent = "Quản trị viên";
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      localStorage.removeItem("currentUser");
      window.location.href = "Login.html";
    });
  }

  // Đếm thống kê
  var products = safeParse("products");
  var users = safeParse("accounts");
  var orders = safeParse("orders");

  var totalProductsEl = document.getElementById("total-products");
  var totalUsersEl = document.getElementById("total-users");
  var totalOrdersEl = document.getElementById("total-orders");

  if (totalProductsEl) totalProductsEl.textContent = products.length;
  if (totalUsersEl) totalUsersEl.textContent = users.length;
  if (totalOrdersEl) totalOrdersEl.textContent = orders.length;
});

// ------------------ QUẢN LÝ SẢN PHẨM ------------------ //
function manageProducts() {
  var win = window.open("", "Quản lý sản phẩm", "width=1040,height=680");
  if (!win) {
    alert("Trình duyệt đang chặn popup, hãy cho phép để mở trang quản lý sản phẩm.");
    return;
  }

  win.document.open();
  win.document.write(
    '<!DOCTYPE html>' +
      '<html lang="vi">' +
      "<head>" +
      '<meta charset="utf-8" />' +
      "<title>Quản lý sản phẩm</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;background:#f4f5fb;margin:0;padding:20px;color:#111827;}" +
      "h2{margin-bottom:4px;}" +
      "p.desc{margin:0 0 12px;color:#6b7280;font-size:13px;}" +
      ".layout{display:grid;grid-template-columns:2fr 1.1fr;gap:16px;align-items:flex-start;}" +
      ".card{background:#fff;border-radius:12px;box-shadow:0 10px 26px rgba(15,23,42,.1);padding:14px;}" +
      ".card h3{margin:0 0 8px;font-size:16px;}" +
      ".card small{color:#6b7280;}" +
      ".search-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;}" +
      ".search-bar input,.search-bar select{padding:6px 8px;border-radius:8px;border:1px solid #d1d5db;font-size:13px;}" +
      ".search-bar button{padding:6px 10px;border-radius:999px;border:none;cursor:pointer;background:#0ea5e9;color:#fff;font-size:13px;font-weight:600;}" +
      ".search-bar button:hover{background:#0284c7;}" +
      ".table-container{max-height:380px;overflow-y:auto;border-radius:10px;border:1px solid #e5e7eb;background:#f9fafb;}" +
      "table{width:100%;border-collapse:collapse;font-size:13px;}" +
      "th,td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:middle;}" +
      "thead th{position:sticky;top:0;background:#0ea5e9;color:#fff;z-index:1;}" +
      "tr:hover{background:#f3f4ff;}" +
      "img.thumb{width:46px;height:46px;object-fit:cover;border-radius:6px;}" +
      ".action-btn{padding:4px 8px;border-radius:999px;border:none;cursor:pointer;font-size:12px;margin-right:4px;}" +
      ".edit-btn{background:#22c55e;color:#fff;}" +
      ".edit-btn:hover{background:#16a34a;}" +
      ".delete-btn{background:#ef4444;color:#fff;}" +
      ".delete-btn:hover{background:#dc2626;}" +
      ".form-group{margin-bottom:8px;}" +
      ".form-group label{font-size:13px;color:#374151;display:block;margin-bottom:4px;}" +
      ".form-group input,.form-group select,.form-group textarea{width:100%;padding:7px 8px;border-radius:8px;border:1px solid #d1d5db;font-size:13px;}" +
      ".form-group textarea{resize:vertical;min-height:74px;}" +
      ".form-footer{margin-top:8px;display:flex;justify-content:flex-end;}" +
      ".primary-btn{padding:7px 12px;border-radius:999px;border:none;cursor:pointer;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#fff;font-weight:600;font-size:13px;}" +
      ".primary-btn:hover{opacity:.95;}" +
      "@media(max-width:900px){.layout{grid-template-columns:1fr;}}" +
      "</style>" +
      "</head>" +
      "<body>" +
      "<h2>Quản lý sản phẩm</h2>" +
      '<p class="desc">Thêm, sửa, xóa sản phẩm đồ gia dụng. Các thay đổi được lưu trong trình duyệt (localStorage).</p>' +
      '<div class="layout">' +
      '<div class="card">' +
      "<h3>Danh sách sản phẩm</h3>" +
      "<small>Tìm kiếm theo tên và lọc theo danh mục</small>" +
      '<div class="search-bar">' +
      '<input type="text" id="searchInput" placeholder="Tìm kiếm sản phẩm..." />' +
      '<select id="categoryFilter"></select>' +
      '<button type="button" onclick="applySearch()">Lọc</button>' +
      "</div>" +
      '<div class="table-container">' +
      "<table>" +
      "<thead>" +
      "<tr>" +
      "<th>Ảnh</th>" +
      "<th>Tên sản phẩm</th>" +
      "<th>Giá (₫)</th>" +
      "<th>Danh mục</th>" +
      "<th>Hành động</th>" +
      "</tr>" +
      "</thead>" +
      '<tbody id="productTable"></tbody>' +
      "</table>" +
      "</div>" +
      "</div>" +
      '<div class="card">' +
      "<h3>Thêm / Sửa sản phẩm</h3>" +
      "<small>Nhập thông tin chi tiết sản phẩm</small>" +
      '<input type="hidden" id="editIndex" />' +
      '<div class="form-group">' +
      "<label for=\"productName\">Tên sản phẩm</label>" +
      '<input type="text" id="productName" />' +
      "</div>" +
      '<div class="form-group">' +
      "<label for=\"productPrice\">Giá tiền (₫)</label>" +
      '<input type="text" id="productPrice" placeholder="Chỉ nhập số" />' +
      "</div>" +
      '<div class="form-group">' +
      "<label for=\"productCategory\">Danh mục</label>" +
      '<select id="productCategory"></select>' +
      "</div>" +
      '<div class="form-group">' +
      "<label for=\"productImage\">Ảnh sản phẩm</label>" +
      '<input type="file" id="productImage" accept="image/*" />' +
      "</div>" +
      '<div class="form-group">' +
      "<label for=\"productDescription\">Mô tả sản phẩm</label>" +
      '<textarea id="productDescription"></textarea>' +
      "</div>" +
      '<div class="form-footer">' +
      '<button class="primary-btn" type="button" onclick="saveProduct()">Lưu sản phẩm</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "<script>" +
      "var GD_CATEGORIES=" +
      JSON.stringify(GD_CATEGORIES) +
      ";" +
      "var products=JSON.parse(localStorage.getItem('products'))||[];" +
      "var productTable=document.getElementById('productTable');" +
      "var categoryFilter=document.getElementById('categoryFilter');" +
      "var productCategory=document.getElementById('productCategory');" +
      "function initCategories(){categoryFilter.innerHTML='';var optAll=document.createElement('option');optAll.value='all';optAll.textContent='Tất cả danh mục';categoryFilter.appendChild(optAll);GD_CATEGORIES.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;categoryFilter.appendChild(o);});productCategory.innerHTML='';GD_CATEGORIES.forEach(function(c){var o2=document.createElement('option');o2.value=c;o2.textContent=c;productCategory.appendChild(o2);});}" +
      "initCategories();" +
      "function renderTable(list){productTable.innerHTML='';list.forEach(function(p,idx){var row=document.createElement('tr');row.innerHTML=" +
      "'<td><img class=\"thumb\" src=\"'+(p.image||'')+'\" alt=\"'+(p.name||'')+'\" /></td>'+" +
      "'<td>'+(p.name||'')+'</td>'+" +
      "'<td>'+ (p.price? Number(p.price).toLocaleString(): '0') +'</td>'+" +
      "'<td>'+(p.category||'')+'</td>'+" +
      "'<td>'+" +
      "'<button class=\"action-btn edit-btn\" onclick=\"editProduct('+idx+')\">Sửa</button>'+" +
      "'<button class=\"action-btn delete-btn\" onclick=\"deleteProduct('+idx+')\">Xóa</button>'+" +
      "'</td>';productTable.appendChild(row);});}" +
      "renderTable(products);" +
      "function applySearch(){var kw=document.getElementById('searchInput').value.toLowerCase();var cat=categoryFilter.value;var filtered=products.filter(function(p){var m1=!kw|| (p.name||'').toLowerCase().indexOf(kw)>-1;var m2=(cat==='all')||p.category===cat;return m1&&m2;});renderTable(filtered);}" +
      "function saveProduct(){var name=document.getElementById('productName').value.trim();var priceStr=document.getElementById('productPrice').value.trim();var price=parseInt(priceStr,10);var cat=productCategory.value;var desc=document.getElementById('productDescription').value.trim();var imageInput=document.getElementById('productImage');var editIndex=document.getElementById('editIndex').value; if(!name||isNaN(price)||price<=0||!cat){alert('Vui lòng nhập đầy đủ thông tin và giá hợp lệ.');return;} function doSave(imageData){if(editIndex!==''&&editIndex!==null){var idx=parseInt(editIndex,10);if(!products[idx])return;products[idx].name=name;products[idx].price=price;products[idx].category=cat;products[idx].description=desc; if(imageData){products[idx].image=imageData;}}else{var newP={name:name,price:price,category:cat,description:desc,image:imageData||''};products.push(newP);} localStorage.setItem('products',JSON.stringify(products));renderTable(products);resetForm();}" +
      "if(imageInput.files && imageInput.files[0]){var reader=new FileReader();reader.onload=function(e){doSave(e.target.result);};reader.readAsDataURL(imageInput.files[0]);}else{doSave(null);}}" +
      "function resetForm(){document.getElementById('editIndex').value='';document.getElementById('productName').value='';document.getElementById('productPrice').value='';productCategory.selectedIndex=0;document.getElementById('productDescription').value='';document.getElementById('productImage').value='';}" +
      "function editProduct(index){var p=products[index];if(!p)return;document.getElementById('editIndex').value=index;document.getElementById('productName').value=p.name||'';document.getElementById('productPrice').value=p.price||'';productCategory.value=p.category||GD_CATEGORIES[0];document.getElementById('productDescription').value=p.description||'';document.getElementById('productImage').value='';}" +
      "function deleteProduct(index){if(!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?'))return;products.splice(index,1);localStorage.setItem('products',JSON.stringify(products));renderTable(products);}" +
      "document.getElementById('productPrice').addEventListener('input',function(e){this.value=this.value.replace(/[^0-9]/g,'');});" +
      "</script>" +
      "</body></html>"
  );
  win.document.close();
}

// ------------------ QUẢN LÝ NGƯỜI DÙNG ------------------ //
function manageUsers() {
  var win = window.open("", "Quản lý người dùng", "width=1040,height=640");
  if (!win) {
    alert("Trình duyệt đang chặn popup, hãy cho phép để mở trang quản lý người dùng.");
    return;
  }

  win.document.open();
  win.document.write(
    '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />' +
      "<title>Quản lý người dùng</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;background:#f4f5fb;margin:0;padding:20px;color:#111827;}" +
      "h2{margin-bottom:6px;}" +
      "p.desc{margin:0 0 12px;color:#6b7280;font-size:13px;}" +
      ".table-card{background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(15,23,42,.14);padding:14px;}" +
      "table{width:100%;border-collapse:collapse;font-size:13px;}" +
      "th,td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:middle;}" +
      "thead th{background:#0ea5e9;color:#fff;position:sticky;top:0;z-index:1;}" +
      "tr:nth-child(even){background:#f9fafb;}" +
      "tr:hover{background:#eff6ff;}" +
      ".status-active{color:#16a34a;font-weight:600;}" +
      ".status-denied{color:#ef4444;font-weight:600;}" +
      ".block-btn{padding:5px 10px;border-radius:999px;border:none;cursor:pointer;font-size:12px;color:#fff;background:#ef4444;}" +
      ".block-btn:hover{background:#dc2626;}" +
      "</style></head><body>" +
      "<h2>Quản lý người dùng</h2>" +
      '<p class="desc">Xem danh sách tài khoản, khóa hoặc mở khóa người dùng.</p>' +
      '<div class="table-card">' +
      "<table>" +
      "<thead><tr>" +
      "<th>Họ và tên</th>" +
      "<th>Email</th>" +
      "<th>Số điện thoại</th>" +
      "<th>Mật khẩu</th>" +
      "<th>Trạng thái</th>" +
      "<th>Hành động</th>" +
      "</tr></thead>" +
      '<tbody id="userTable"></tbody>' +
      "</table>" +
      "</div>" +
      "<script>" +
      "var users=JSON.parse(localStorage.getItem('accounts'))||[];" +
      "var userTable=document.getElementById('userTable');" +
      "function renderUserTable(){userTable.innerHTML='';users.forEach(function(u,idx){var tr=document.createElement('tr');var statusText=(u.status==='denied')?'Bị khóa':'Hoạt động';var statusClass=(u.status==='denied')?'status-denied':'status-active'; tr.innerHTML=" +
      "'<td>'+(u.fullname||'')+'</td>'+" +
      "'<td>'+(u.email||'')+'</td>'+" +
      "'<td>'+(u.phone||'')+'</td>'+" +
      "'<td>'+(u.password||'')+'</td>'+" +
      "'<td><span class=\"'+statusClass+'\">'+statusText+'</span></td>'+" +
      "'<td><button class=\"block-btn\" onclick=\"toggleUserStatus('+idx+')\">'+(u.status==='denied'?'Mở khóa':'Khóa')+'</button></td>';userTable.appendChild(tr);});}" +
      "function toggleUserStatus(index){var u=users[index];if(!u)return;u.status=(u.status==='denied')?'active':'denied';localStorage.setItem('accounts',JSON.stringify(users));renderUserTable();}" +
      "renderUserTable();" +
      "</script></body></html>"
  );
  win.document.close();
}

// ------------------ QUẢN LÝ FLASH SALE ------------------ //
function updateContent() {
  var win = window.open("", "Cập nhật Flash Sale", "width=1080,height=700");
  if (!win) {
    alert("Trình duyệt chặn popup, hãy cho phép để mở trang quản lý Flash Sale.");
    return;
  }

  win.document.open();
  win.document.write(
    '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />' +
      "<title>Quản lý Flash Sale</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;background:#f4f5fb;margin:0;padding:20px;color:#111827;}" +
      "h2{margin-bottom:6px;}" +
      "p.desc{margin:0 0 12px;color:#6b7280;font-size:13px;}" +
      ".layout{display:grid;grid-template-columns:2fr 1.1fr;gap:16px;align-items:flex-start;}" +
      ".card{background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(15,23,42,.14);padding:14px;}" +
      ".card h3{margin:0 0 8px;font-size:16px;}" +
      ".card small{color:#6b7280;}" +
      ".search-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;}" +
      ".search-bar input,.search-bar select{padding:6px 8px;border-radius:8px;border:1px solid #d1d5db;font-size:13px;}" +
      ".search-bar button{padding:6px 10px;border-radius:999px;border:none;cursor:pointer;background:#0ea5e9;color:#fff;font-size:13px;font-weight:600;}" +
      ".search-bar button:hover{background:#0284c7;}" +
      ".table-container{max-height:380px;overflow-y:auto;border-radius:10px;border:1px solid #e5e7eb;background:#f9fafb;}" +
      "table{width:100%;border-collapse:collapse;font-size:13px;}" +
      "th,td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:middle;}" +
      "thead th{position:sticky;top:0;background:#f97316;color:#fff;z-index:1;}" +
      "tr:hover{background:#fff7ed;}" +
      "img.thumb{width:46px;height:46px;object-fit:cover;border-radius:6px;}" +
      ".action-btn{padding:4px 8px;border-radius:999px;border:none;cursor:pointer;font-size:12px;margin-right:4px;}" +
      ".edit-btn{background:#22c55e;color:#fff;}" +
      ".edit-btn:hover{background:#16a34a;}" +
      ".delete-btn{background:#ef4444;color:#fff;}" +
      ".delete-btn:hover{background:#dc2626;}" +
      ".form-group{margin-bottom:8px;}" +
      ".form-group label{font-size:13px;color:#374151;display:block;margin-bottom:4px;}" +
      ".form-group input,.form-group select,.form-group textarea{width:100%;padding:7px 8px;border-radius:8px;border:1px solid #d1d5db;font-size:13px;}" +
      ".form-group textarea{resize:vertical;min-height:60px;}" +
      ".form-footer{margin-top:8px;display:flex;justify-content:flex-end;}" +
      ".primary-btn{padding:7px 12px;border-radius:999px;border:none;cursor:pointer;background:linear-gradient(135deg,#f97316,#fb7185);color:#fff;font-weight:600;font-size:13px;}" +
      ".primary-btn:hover{opacity:.95;}" +
      "@media(max-width:900px){.layout{grid-template-columns:1fr;}}" +
      "</style></head><body>" +
      "<h2>Cập nhật nội dung Flash Sale</h2>" +
      '<p class="desc">Thiết lập sản phẩm Flash Sale: giá gốc, phần trăm giảm, thời gian kết thúc.</p>' +
      '<div class="layout">' +
      '<div class="card">' +
      "<h3>Danh sách Flash Sale</h3>" +
      "<small>Lọc theo tên và danh mục</small>" +
      '<div class="search-bar">' +
      '<input type="text" id="searchInput" placeholder="Tìm kiếm sản phẩm..." />' +
      '<select id="categoryFilter"></select>' +
      '<button type="button" onclick="applySearch()">Lọc</button>' +
      "</div>" +
      '<div class="table-container">' +
      "<table><thead><tr>" +
      "<th>Ảnh</th>" +
      "<th>Sản phẩm</th>" +
      "<th>Giá gốc</th>" +
      "<th>Giảm (%)</th>" +
      "<th>Giá sau giảm</th>" +
      "<th>Kết thúc</th>" +
      "<th>Danh mục</th>" +
      "<th>Hành động</th>" +
      "</tr></thead><tbody id=\"flashSaleTable\"></tbody></table>" +
      "</div>" +
      "</div>" +
      '<div class="card">' +
      "<h3>Thêm / Sửa Flash Sale</h3>" +
      "<small>Liên kết với sản phẩm và cấu hình khuyến mãi</small>" +
      '<input type="hidden" id="editIndex" />' +
      '<div class="form-group"><label for="productName">Tên sản phẩm</label><input type="text" id="productName" /></div>' +
      '<div class="form-group"><label for="productPrice">Giá gốc (₫)</label><input type="text" id="productPrice" placeholder="Chỉ nhập số" /></div>' +
      '<div class="form-group"><label for="discountPercent">Giảm giá (%)</label><input type="text" id="discountPercent" placeholder="0 - 100" /></div>' +
      '<div class="form-group"><label for="discountedPrice">Giá sau giảm (tự tính)</label><input type="text" id="discountedPrice" readonly /></div>' +
      '<div class="form-group"><label for="productCategory">Danh mục</label><select id="productCategory"></select></div>' +
      '<div class="form-group"><label for="saleEndTime">Thời gian kết thúc</label><input type="datetime-local" id="saleEndTime" /></div>' +
      '<div class="form-group"><label for="productDescription">Mô tả</label><textarea id="productDescription"></textarea></div>' +
      '<div class="form-group"><label for="productImage">Ảnh Flash Sale</label><input type="file" id="productImage" accept="image/*" /></div>' +
      '<div class="form-footer"><button type="button" class="primary-btn" onclick="saveFlashSaleProduct()">Lưu Flash Sale</button></div>' +
      "</div>" +
      "</div>" +
      "<script>" +
      "var GD_CATEGORIES=" +
      JSON.stringify(GD_CATEGORIES) +
      ";" +
      "var flashSaleProducts=JSON.parse(localStorage.getItem('flashSaleProducts'))||[];" +
      "var flashSaleTable=document.getElementById('flashSaleTable');" +
      "var catFilter=document.getElementById('categoryFilter');" +
      "var catSelect=document.getElementById('productCategory');" +
      "function initCats(){catFilter.innerHTML='';var oAll=document.createElement('option');oAll.value='all';oAll.textContent='Tất cả danh mục';catFilter.appendChild(oAll);GD_CATEGORIES.forEach(function(c){var o=document.createElement('option');o.value=c;o.textContent=c;catFilter.appendChild(o);});catSelect.innerHTML='';GD_CATEGORIES.forEach(function(c2){var o2=document.createElement('option');o2.value=c2;o2.textContent=c2;catSelect.appendChild(o2);});}" +
      "initCats();" +
      "function renderFlashSaleTable(list){flashSaleTable.innerHTML='';list.forEach(function(p,idx){var tr=document.createElement('tr');var endStr=p.saleEndTime? new Date(p.saleEndTime).toLocaleString():'';tr.innerHTML=" +
      "'<td><img class=\"thumb\" src=\"'+(p.image||'')+'\" alt=\"'+(p.name||'')+'\"/></td>'+" +
      "'<td>'+(p.name||'')+'</td>'+" +
      "'<td>₫'+(p.originalPrice? Number(p.originalPrice).toLocaleString(): '0')+'</td>'+" +
      "'<td>'+(p.discountPercent||0)+'%</td>'+" +
      "'<td>₫'+(p.discountedPrice? Number(p.discountedPrice).toLocaleString(): '0')+'</td>'+" +
      "'<td>'+endStr+'</td>'+" +
      "'<td>'+(p.category||'')+'</td>'+" +
      "'<td><button class=\"action-btn edit-btn\" onclick=\"editFlashSaleProduct('+idx+')\">Sửa</button>'+" +
      "'<button class=\"action-btn delete-btn\" onclick=\"deleteFlashSaleProduct('+idx+')\">Xóa</button></td>';flashSaleTable.appendChild(tr);});}" +
      "renderFlashSaleTable(flashSaleProducts);" +
      "function editFlashSaleProduct(index){var p=flashSaleProducts[index];if(!p)return;document.getElementById('editIndex').value=index;document.getElementById('productName').value=p.name||'';document.getElementById('productPrice').value=p.originalPrice||'';document.getElementById('discountPercent').value=p.discountPercent||'';document.getElementById('discountedPrice').value=p.discountedPrice||'';document.getElementById('saleEndTime').value=p.saleEndTime||'';document.getElementById('productDescription').value=p.description||'';catSelect.value=p.category||GD_CATEGORIES[0];document.getElementById('productImage').value='';}" +
      "function deleteFlashSaleProduct(index){if(!confirm('Xóa sản phẩm Flash Sale này?'))return;flashSaleProducts.splice(index,1);localStorage.setItem('flashSaleProducts',JSON.stringify(flashSaleProducts));renderFlashSaleTable(flashSaleProducts);}" +
      "function saveFlashSaleProduct(){var name=document.getElementById('productName').value.trim();var originalPriceStr=document.getElementById('productPrice').value.trim();var originalPrice=parseFloat(originalPriceStr);var discountStr=document.getElementById('discountPercent').value.trim();var discountPercent=parseFloat(discountStr);var saleEndTime=document.getElementById('saleEndTime').value;var desc=document.getElementById('productDescription').value.trim();var cat=catSelect.value;var imageInput=document.getElementById('productImage');var editIndex=document.getElementById('editIndex').value;if(!name||isNaN(originalPrice)||isNaN(discountPercent)||!saleEndTime||!cat){alert('Vui lòng nhập đầy đủ & chính xác thông tin.');return;}var discountedPrice=originalPrice-(originalPrice*discountPercent/100);function doSave(imageData){if(editIndex!==''&&editIndex!==null){var idx=parseInt(editIndex,10);var p=flashSaleProducts[idx];if(!p)return;p.name=name;p.originalPrice=originalPrice;p.discountPercent=discountPercent;p.discountedPrice=discountedPrice;p.saleEndTime=saleEndTime;p.description=desc;p.category=cat;if(imageData){p.image=imageData;}}else{if(!imageData){alert('Vui lòng tải ảnh sản phẩm Flash Sale.');return;}flashSaleProducts.push({name:name,originalPrice:originalPrice,discountPercent:discountPercent,discountedPrice:discountedPrice,saleEndTime:saleEndTime,description:desc,category:cat,image:imageData});}localStorage.setItem('flashSaleProducts',JSON.stringify(flashSaleProducts));renderFlashSaleTable(flashSaleProducts);resetForm();}" +
      "if(imageInput.files && imageInput.files[0]){var reader=new FileReader();reader.onload=function(e){doSave(e.target.result);};reader.readAsDataURL(imageInput.files[0]);}else{doSave(null);}}" +
      "function resetForm(){document.getElementById('editIndex').value='';document.getElementById('productName').value='';document.getElementById('productPrice').value='';document.getElementById('discountPercent').value='';document.getElementById('discountedPrice').value='';document.getElementById('saleEndTime').value='';document.getElementById('productDescription').value='';catSelect.selectedIndex=0;document.getElementById('productImage').value='';}" +
      "function updateDiscountedPrice(){var op=parseFloat(document.getElementById('productPrice').value.trim());var dp=parseFloat(document.getElementById('discountPercent').value.trim());if(!isNaN(op)&&!isNaN(dp)){var final=op-(op*dp/100);document.getElementById('discountedPrice').value=final.toFixed(0);}else{document.getElementById('discountedPrice').value='';}}" +
      "document.getElementById('productPrice').addEventListener('input',function(){this.value=this.value.replace(/[^0-9]/g,'');updateDiscountedPrice();});" +
      "document.getElementById('discountPercent').addEventListener('input',function(){this.value=this.value.replace(/[^0-9.]/g,'');updateDiscountedPrice();});" +
      "function applySearch(){var kw=document.getElementById('searchInput').value.toLowerCase();var cat=catFilter.value;var filtered=flashSaleProducts.filter(function(p){var m1=!kw||(p.name||'').toLowerCase().indexOf(kw)>-1;var m2=(cat==='all')||p.category===cat;return m1&&m2;});renderFlashSaleTable(filtered);}" +
      "</script></body></html>"
  );
  win.document.close();
}

// ------------------ QUẢN LÝ THƯƠNG HIỆU ------------------ //
function ensureDefaultBrands() {
  var brands = safeParse("brands");
  if (!Array.isArray(brands) || brands.length === 0) {
    // Khởi tạo với default brands có ảnh
    brands = [
      { name: "Sunhouse", image: "icon/brand-sunhouse.png" },
      { name: "Lock&Lock", image: "icon/brand-locknlock.png" },
      { name: "Philips", image: "icon/brand-philips.png" },
      { name: "Panasonic", image: "icon/brand-panasonic.png" },
      { name: "Electrolux", image: "icon/brand-electrolux.png" }
    ];
    safeSave("brands", brands);
  }
  // Migrate old format (array of strings) to new format (array of objects)
  if (brands.length > 0 && typeof brands[0] === "string") {
    var defaultImages = {
      "Sunhouse": "icon/brand-sunhouse.png",
      "Lock&Lock": "icon/brand-locknlock.png",
      "Philips": "icon/brand-philips.png",
      "Panasonic": "icon/brand-panasonic.png",
      "Electrolux": "icon/brand-electrolux.png"
    };
    brands = brands.map(function(name) {
      return {
        name: name,
        image: defaultImages[name] || ""
      };
    });
    safeSave("brands", brands);
  }
  return brands;
}

function manageBrands() {
  var win = window.open("", "Quản lý thương hiệu", "width=1040,height=700");
  if (!win) {
    alert("Trình duyệt đang chặn popup, hãy cho phép để mở trang quản lý thương hiệu.");
    return;
  }

  var brands = ensureDefaultBrands();
  var products = safeParse("products");

  win.document.open();
  win.document.write(
    '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />' +
      "<title>Quản lý thương hiệu</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;background:#f4f5fb;margin:0;padding:20px;color:#111827;}" +
      "h2{margin-bottom:6px;}" +
      "p.desc{margin:0 0 12px;color:#6b7280;font-size:13px;}" +
      ".layout{display:grid;grid-template-columns:1.1fr 2fr;gap:16px;align-items:flex-start;}" +
      ".card{background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(15,23,42,.14);padding:14px;}" +
      ".card h3{margin:0 0 8px;font-size:16px;}" +
      ".card small{color:#6b7280;}" +
      ".table-container{max-height:380px;overflow-y:auto;border-radius:10px;border:1px solid #e5e7eb;background:#f9fafb;}" +
      "table{width:100%;border-collapse:collapse;font-size:13px;}" +
      "th,td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;vertical-align:middle;}" +
      "thead th{position:sticky;top:0;background:#06b6d4;color:#fff;z-index:1;}" +
      ".flex{display:flex;gap:8px;align-items:center;}" +
      ".flex-col{flex-direction:column;align-items:stretch;}" +
      ".input{padding:7px 8px;border-radius:8px;border:1px solid #d1d5db;font-size:13px;width:100%;box-sizing:border-box;}" +
      ".file-input{font-size:12px;padding:6px;}" +
      ".btn{padding:7px 12px;border-radius:999px;border:none;cursor:pointer;color:#fff;font-weight:600;font-size:13px;}" +
      ".btn-add{background:#22c55e;}" +
      ".btn-del{background:#ef4444;}" +
      ".btn-save{background:linear-gradient(135deg,#0ea5e9,#6366f1);}" +
      ".brand-item{display:flex;align-items:center;gap:8px;padding:8px;background:#f9fafb;border-radius:8px;margin-bottom:8px;border:1px solid #e5e7eb;}" +
      ".brand-item img{width:40px;height:40px;object-fit:contain;border-radius:6px;background:#fff;padding:4px;}" +
      ".brand-item span{flex:1;font-weight:600;color:#111827;}" +
      ".preview-img{width:60px;height:60px;object-fit:contain;border-radius:8px;background:#f9fafb;padding:4px;border:1px solid #e5e7eb;}" +
      "@media(max-width:900px){.layout{grid-template-columns:1fr;}}" +
      "</style></head><body>" +
      "<h2>Quản lý thương hiệu</h2>" +
      '<p class="desc">Thêm/sửa/xóa thương hiệu với ảnh logo và gán thương hiệu cho sản phẩm.</p>' +
      '<div class="layout">' +
      '<div class="card">' +
      "<h3>Danh sách thương hiệu</h3>" +
      "<small>Thêm thương hiệu mới với ảnh logo hoặc xóa thương hiệu hiện có</small>" +
      '<div class="flex flex-col" style="margin:8px 0;gap:8px;">' +
      '<input id="brandInput" class="input" type="text" placeholder="Tên thương hiệu..." />' +
      '<input id="brandImageInput" class="input file-input" type="file" accept="image/*" onchange="previewImage(event)" />' +
      '<div id="imagePreview" style="text-align:center;margin:8px 0;"></div>' +
      '<button class="btn btn-add" type="button" onclick="addBrand()">Thêm thương hiệu</button>' +
      "</div>" +
      '<div id="brandsArea"></div>' +
      "</div>" +
      '<div class="card">' +
      "<h3>Gán thương hiệu cho sản phẩm</h3>" +
      "<small>Chọn thương hiệu cho từng sản phẩm</small>" +
      '<div class="table-container">' +
      "<table><thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Thương hiệu</th></tr></thead><tbody id=\"productBrandBody\"></tbody></table>" +
      "</div>" +
      '<div style="margin-top:8px;text-align:right">' +
      '<button class="btn btn-save" type="button" onclick="saveProductBrands()">Lưu thay đổi</button>' +
      "</div>" +
      "</div>" +
      "</div>" +
      "<script>" +
      "var brands=" +
      JSON.stringify(brands) +
      ";var products=" +
      JSON.stringify(products) +
      ";var currentImageBase64='';" +
      "var brandsArea=document.getElementById('brandsArea');" +
      "var productBody=document.getElementById('productBrandBody');" +
      "var imagePreview=document.getElementById('imagePreview');" +
      "function previewImage(event){var file=event.target.files[0];if(!file){imagePreview.innerHTML='';currentImageBase64='';return;}var reader=new FileReader();reader.onload=function(e){currentImageBase64=e.target.result;imagePreview.innerHTML='<img src=\"'+currentImageBase64+'\" class=\"preview-img\" alt=\"Preview\" />';};reader.readAsDataURL(file);}" +
      "function renderBrands(){brandsArea.innerHTML='';brands.forEach(function(b,idx){var brandName=typeof b==='object'?b.name:b;var brandImage=typeof b==='object'?b.image:'';var row=document.createElement('div');row.className='brand-item';row.innerHTML='<img src=\"'+(brandImage||'')+'\" alt=\"'+brandName+'\" onerror=\"this.style.display=\\'none\\'\" />' + '<span>'+brandName+'</span>' + '<button class=\"btn btn-del\" type=\"button\" onclick=\"delBrand('+idx+')\">Xóa</button>';brandsArea.appendChild(row);});}" +
      "function addBrand(){var input=document.getElementById('brandInput');var imageInput=document.getElementById('brandImageInput');var name=(input.value||'').trim();if(!name){alert('Nhập tên thương hiệu.');return;}var image=currentImageBase64||'';if(!image){if(!confirm('Bạn chưa chọn ảnh. Tiếp tục thêm thương hiệu không có ảnh?')){return;}}brands.push({name:name,image:image});input.value='';imageInput.value='';imagePreview.innerHTML='';currentImageBase64='';renderBrands();}" +
      "function delBrand(idx){if(!confirm('Xóa thương hiệu này?'))return;brands.splice(idx,1);renderBrands();}" +
      "function renderProductBrands(){productBody.innerHTML='';products.forEach(function(p,idx){var tr=document.createElement('tr');var brandOptions=brands.map(function(b){var brandName=typeof b==='object'?b.name:b;var selected=(String(p.brand||'')===String(brandName))?' selected':'';return'<option value=\"'+brandName+'\"'+selected+'>'+brandName+'</option>';}).join('');var sel='<select data-index=\"'+idx+'\">'+brandOptions+'</select>';tr.innerHTML='<td>'+(p.name||'')+'</td><td>'+(p.category||'')+'</td><td>'+sel+'</td>';productBody.appendChild(tr);});Array.prototype.forEach.call(productBody.querySelectorAll('select'),function(s){s.addEventListener('change',function(e){var i=parseInt(e.target.getAttribute('data-index'),10);var brandName=e.target.value;products[i].brand=brandName;});});}" +
      "function saveProductBrands(){localStorage.setItem('products',JSON.stringify(products));localStorage.setItem('brands',JSON.stringify(brands));alert('Đã lưu thương hiệu và gán thương hiệu cho sản phẩm.');}" +
      "renderBrands();renderProductBrands();" +
      "</script></body></html>"
  );
  win.document.close();
}

// ------------------ THỐNG KÊ ------------------ //
function viewStatistics() {
  var win = window.open("", "Thống kê", "width=1080,height=700");
  if (!win) {
    alert("Trình duyệt đang chặn popup, hãy cho phép để mở trang thống kê.");
    return;
  }

  var products = safeParse("products");
  var orders = safeParse("orders");

  function sumRevenue(list) {
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var o = list[i];
      var items = o.products || o.items || [];
      var t =
        o.total ||
        o.totalAmount ||
        items.reduce(function (s, p) {
          var price = Number(p.price) || 0;
          var q = p.quantity || 1;
          return s + price * q;
        }, 0);
      var paid = o.payment === "paid" || o.paid === true || o.status === "completed";
      if (paid) total += Number(t) || 0;
    }
    return total;
  }

  function formatDate(ts) {
    var d = new Date(ts || Date.now());
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return { y: y, m: m, d: day, labelDay: day + "/" + m + "/" + y, labelMonth: m + "/" + y, labelYear: String(y) };
  }

  var revenueByDay = {};
  var revenueByMonth = {};
  var revenueByYear = {};
  var qtyByProduct = {};
  var spendByUser = {};

  orders.forEach(function (o) {
    var paid = o.payment === "paid" || o.paid === true || o.status === "completed";
    var ts = o.timestamp || o.createdAt || Date.now();
    var fd = formatDate(ts);
    var items = o.products || o.items || [];
    var total =
      o.total ||
      o.totalAmount ||
      items.reduce(function (s, p) {
        var price = Number(p.price) || 0;
        var q = p.quantity || 1;
        return s + price * q;
      }, 0);

    if (paid) {
      revenueByDay[fd.labelDay] = (revenueByDay[fd.labelDay] || 0) + Number(total);
      revenueByMonth[fd.labelMonth] = (revenueByMonth[fd.labelMonth] || 0) + Number(total);
      revenueByYear[fd.labelYear] = (revenueByYear[fd.labelYear] || 0) + Number(total);
    }

    items.forEach(function (p) {
      var name = p.name || "Sản phẩm";
      var q = p.quantity || 1;
      qtyByProduct[name] = (qtyByProduct[name] || 0) + q;
    });

    var userKey = (o.user && (o.user.email || o.user.fullname)) || o.customerEmail || "Khách";
    spendByUser[userKey] = (spendByUser[userKey] || 0) + Number(total);
  });

  var byCategory = {};
  var byBrand = {};
  products.forEach(function (p) {
    var c = p.category || "Khác";
    var b = p.brand || "Khác";
    byCategory[c] = (byCategory[c] || 0) + 1;
    byBrand[b] = (byBrand[b] || 0) + 1;
  });

  var byStatus = { pending: 0, shipping: 0, completed: 0, cancelled: 0, refund: 0 };
  orders.forEach(function (o) {
    var s = o.status || "pending";
    if (!byStatus.hasOwnProperty(s)) byStatus[s] = 0;
    byStatus[s]++;
  });

  var revenue = sumRevenue(orders);

  win.document.open();
  win.document.write(
    '<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8" />' +
      "<title>Thống kê</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;background:#f4f5fb;margin:0;padding:20px;color:#111827;}" +
      "h2{margin-bottom:6px;}" +
      "p.desc{margin:0 0 12px;color:#6b7280;font-size:13px;}" +
      ".card{background:#fff;border-radius:14px;box-shadow:0 10px 26px rgba(15,23,42,.14);padding:14px;}" +
      ".topbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:10px;}" +
      ".tabbar{display:flex;flex-wrap:wrap;gap:8px;margin:8px 0 12px;}" +
      ".tab-btn{border:none;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:600;background:#e0f2fe;color:#075985;cursor:pointer;}" +
      ".tab-btn:hover{filter:brightness(0.98);}" +
      ".tab-btn.active{background:#0ea5e9;color:#fff;}" +
      ".search{flex:1;display:flex;align-items:center;gap:8px;}" +
      ".search input{flex:1;padding:7px 10px;border:1px solid #d1d5db;border-radius:8px;font-size:13px;}" +
      "table{width:100%;border-collapse:collapse;font-size:13px;margin-top:6px;}" +
      "th,td{padding:8px;border-bottom:1px solid #e5e7eb;text-align:left;}" +
      "thead th{background:#3b82f6;color:#fff;}" +
      ".revenue{font-size:18px;font-weight:700;color:#16a34a;}" +
      "</style></head><body>" +
      "<h2>Thống kê hệ thống</h2>" +
      '<p class="desc">Chọn nút để xem bảng thống kê tương ứng. Dùng ô tìm kiếm để lọc nhanh.</p>' +
      '<div class="card">' +
      '<div class="topbar"><div class="revenue">Tổng doanh thu ước tính: ₫' +
      Number(revenue).toLocaleString() +
      '</div><div style="margin-left:auto"></div></div>' +
      '<div class="tabbar">' +
      '<button class="tab-btn" data-view="cat">Theo danh mục</button>' +
      '<button class="tab-btn" data-view="brand">Theo thương hiệu</button>' +
      '<button class="tab-btn" data-view="status">Đơn hàng theo trạng thái</button>' +
      '<button class="tab-btn" data-view="revDay">Doanh thu theo ngày</button>' +
      '<button class="tab-btn" data-view="revMonth">Doanh thu theo tháng</button>' +
      '<button class="tab-btn" data-view="revYear">Doanh thu theo năm</button>' +
      '<button class="tab-btn" data-view="topProduct">Top sản phẩm</button>' +
      '<button class="tab-btn" data-view="topUser">Top người dùng</button>' +
      "</div>" +
      '<div class="search"><input id="searchInput" type="text" placeholder="Tìm trong bảng hiện tại..." /></div>' +
      '<table><thead><tr id="theadRow"></tr></thead><tbody id="tbodyRows"></tbody></table>' +
      "</div>" +
      "<script>" +
      "var DATASETS={" +
      "cat:{title:'Sản phẩm theo danh mục',headers:['Danh mục','Số lượng'],obj:" +
      JSON.stringify(byCategory) +
      "}," +
      "brand:{title:'Sản phẩm theo thương hiệu',headers:['Thương hiệu','Số lượng'],obj:" +
      JSON.stringify(byBrand) +
      "}," +
      "status:{title:'Đơn hàng theo trạng thái',headers:['Trạng thái','Số lượng'],obj:" +
      JSON.stringify(byStatus) +
      "}," +
      "revDay:{title:'Doanh thu theo ngày',headers:['Ngày','Doanh thu (₫)'],obj:" +
      JSON.stringify(revenueByDay) +
      "}," +
      "revMonth:{title:'Doanh thu theo tháng',headers:['Tháng/Năm','Doanh thu (₫)'],obj:" +
      JSON.stringify(revenueByMonth) +
      "}," +
      "revYear:{title:'Doanh thu theo năm',headers:['Năm','Doanh thu (₫)'],obj:" +
      JSON.stringify(revenueByYear) +
      "}," +
      "topProduct:{title:'Sản phẩm mua nhiều nhất',headers:['Sản phẩm','Số lượng'],obj:" +
      JSON.stringify(qtyByProduct) +
      "}," +
      "topUser:{title:'Người dùng mua hàng nhiều nhất',headers:['Người dùng','Tổng chi (₫)'],obj:" +
      JSON.stringify(spendByUser) +
      "}" +
      "};" +
      "var currentView='revDay';" +
      "var thead=document.getElementById('theadRow');" +
      "var tbody=document.getElementById('tbodyRows');" +
      "var searchInput=document.getElementById('searchInput');" +
      "function sortDesc(obj){return Object.entries(obj).sort(function(a,b){return Number(b[1]) - Number(a[1]);});}" +
      "function render(){var cfg=DATASETS[currentView];document.title=cfg.title;thead.innerHTML='';cfg.headers.forEach(function(h){var th=document.createElement('th');th.textContent=h;thead.appendChild(th);});var q=(searchInput.value||'').toLowerCase();tbody.innerHTML='';sortDesc(cfg.obj).forEach(function(entry){var k=String(entry[0]);var v=entry[1];if(q && k.toLowerCase().indexOf(q)===-1)return;var tr=document.createElement('tr');var val=(typeof v==='number')?Number(v).toLocaleString():v;tr.innerHTML='<td>'+k+'</td><td>'+val+'</td>';tbody.appendChild(tr);});}" +
      "Array.prototype.forEach.call(document.querySelectorAll('.tab-btn'),function(btn){btn.addEventListener('click',function(){Array.prototype.forEach.call(document.querySelectorAll('.tab-btn'),function(b){b.classList.remove('active');});btn.classList.add('active');currentView=btn.getAttribute('data-view');render();});});" +
      "searchInput.addEventListener('input',render);" +
      "document.querySelector('.tab-btn[data-view=\"'+currentView+'\"]').classList.add('active');" +
      "render();" +
      "</script></body></html>"
  );
  win.document.close();
}

// ------------------ XEM ĐƠN HÀNG ------------------ //
function viewOrders() {
  window.location.href = "admin-order-management.html";
}

// ------------------ QUẢN LÝ THANH TOÁN ------------------ //
function managePayments() {
  window.location.href = "admin-payment-management.html";
}