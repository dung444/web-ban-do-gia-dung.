// script_admin_orders.js
document.addEventListener("DOMContentLoaded", () => {
  // ===== KIỂM TRA QUYỀN ADMIN =====
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Bạn không có quyền truy cập trang này!");
    window.location.href = "Login.html";
    return;
  }

  // ===== KHỞI TẠO =====
  let allOrders = [];
  let filteredOrders = [];
  
  loadOrders();
  setupDateFilters();
  
  // ===== LOAD DỮ LIỆU ĐỚN HÀNG =====
  function loadOrders() {
    allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    filteredOrders = [...allOrders];
    
    renderStats();
    renderCharts();
    renderOrdersList();
  }

  // ===== THIẾT LẬP BỘ LỌC NGÀY =====
  function setupDateFilters() {
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    document.getElementById("date-from").value = formatDate(sevenDaysAgo);
    document.getElementById("date-to").value = formatDate(today);
  }

  function formatDate(date) {
    return date.toISOString().split('T')[0];
  }

  // ===== THỐNG KÊ TỔNG QUAN =====
  function renderStats() {
    const stats = calculateStats(filteredOrders);
    const statsGrid = document.getElementById("stats-grid");
    
    statsGrid.innerHTML = `
      <div class="stat-card revenue">
        <div class="stat-icon">💰</div>
        <div class="stat-value">₫${stats.totalRevenue.toLocaleString()}</div>
        <div class="stat-label">Tổng doanh thu</div>
        <div class="stat-change ${stats.revenueChange >= 0 ? 'positive' : 'negative'}">
          <i class="fas fa-arrow-${stats.revenueChange >= 0 ? 'up' : 'down'}"></i>
          ${Math.abs(stats.revenueChange).toFixed(1)}% so với tuần trước
        </div>
      </div>
      
      <div class="stat-card orders">
        <div class="stat-icon">📦</div>
        <div class="stat-value">${stats.totalOrders}</div>
        <div class="stat-label">Tổng đơn hàng</div>
        <div class="stat-change ${stats.ordersChange >= 0 ? 'positive' : 'negative'}">
          <i class="fas fa-arrow-${stats.ordersChange >= 0 ? 'up' : 'down'}"></i>
          ${Math.abs(stats.ordersChange).toFixed(1)}% so với tuần trước
        </div>
      </div>
      
      <div class="stat-card pending">
        <div class="stat-icon">⏳</div>
        <div class="stat-value">${stats.pendingOrders}</div>
        <div class="stat-label">Đơn chờ xử lý</div>
        <div class="stat-change ${stats.pendingOrders > 0 ? 'negative' : 'positive'}">
          <i class="fas fa-exclamation-triangle"></i>
          Cần xử lý
        </div>
      </div>
      
      <div class="stat-card completed">
        <div class="stat-icon">✅</div>
        <div class="stat-value">${stats.completedOrders}</div>
        <div class="stat-label">Đơn hoàn thành</div>
        <div class="stat-change positive">
          <i class="fas fa-check-circle"></i>
          ${((stats.completedOrders / stats.totalOrders) * 100 || 0).toFixed(1)}% tổng đơn
        </div>
      </div>
    `;
  }

  function calculateStats(orders) {
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const thisWeekOrders = orders.filter(order => 
      new Date(order.timestamp) >= thisWeekStart
    );
    
    const lastWeekOrders = orders.filter(order => {
      const orderDate = new Date(order.timestamp);
      return orderDate >= lastWeekStart && orderDate < thisWeekStart;
    });
    
    const thisWeekRevenue = thisWeekOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const lastWeekRevenue = lastWeekOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const revenueChange = lastWeekRevenue > 0 ? 
      ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;
    
    const ordersChange = lastWeekOrders.length > 0 ? 
      ((thisWeekOrders.length - lastWeekOrders.length) / lastWeekOrders.length) * 100 : 0;

    return {
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      revenueChange,
      ordersChange
    };
  }

  // ===== BIỂU ĐỒ THỐNG KÊ =====
  function renderCharts() {
    renderRevenueChart();
    renderStatusChart();
  }

  function renderRevenueChart() {
    const chartContainer = document.getElementById("revenue-chart");
    const last7Days = getLast7DaysData();
    
    let chartHTML = '<div style="display: flex; align-items: end; height: 160px; gap: 8px; padding: 20px;">';
    
    const maxRevenue = Math.max(...last7Days.map(day => day.revenue));
    
    last7Days.forEach(day => {
      const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 120 : 0;
      chartHTML += `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: 100%;
            height: ${height}px;
            background: linear-gradient(to top, #3b82f6, #60a5fa);
            border-radius: 4px 4px 0 0;
            margin-bottom: 8px;
            position: relative;
            transition: all 0.3s ease;
          " title="₫${day.revenue.toLocaleString()}">
          </div>
          <div style="font-size: 11px; color: #6b7280; text-align: center;">
            ${day.date}
          </div>
          <div style="font-size: 10px; color: #3b82f6; font-weight: 600;">
            ₫${(day.revenue / 1000).toFixed(0)}k
          </div>
        </div>
      `;
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
  }

  function renderStatusChart() {
    const chartContainer = document.getElementById("status-chart");
    const statusStats = getStatusStats();
    
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      shipping: '#8b5cf6',
      completed: '#10b981',
      cancelled: '#ef4444'
    };
    
    const statusLabels = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    
    let chartHTML = '<div style="display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; padding: 20px;">';
    
    Object.entries(statusStats).forEach(([status, count]) => {
      if (count > 0) {
        const percentage = ((count / filteredOrders.length) * 100).toFixed(1);
        chartHTML += `
          <div style="text-align: center; min-width: 80px;">
            <div style="
              width: 60px;
              height: 60px;
              border-radius: 50%;
              background: ${colors[status]};
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 700;
              font-size: 14px;
              margin: 0 auto 8px;
            ">
              ${count}
            </div>
            <div style="font-size: 12px; color: #374151; font-weight: 500;">
              ${statusLabels[status]}
            </div>
            <div style="font-size: 11px; color: #6b7280;">
              ${percentage}%
            </div>
          </div>
        `;
      }
    });
    
    chartHTML += '</div>';
    chartContainer.innerHTML = chartHTML;
  }

  function getLast7DaysData() {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = formatDate(date);
      const dayOrders = filteredOrders.filter(order => {
        const orderDate = formatDate(new Date(order.timestamp));
        return orderDate === dateStr;
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      data.push({
        date: date.toLocaleDateString('vi-VN', { month: 'numeric', day: 'numeric' }),
        revenue: revenue,
        orders: dayOrders.length
      });
    }
    
    return data;
  }

  function getStatusStats() {
    const stats = {
      pending: 0,
      confirmed: 0,
      shipping: 0,
      completed: 0,
      cancelled: 0
    };
    
    filteredOrders.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
    });
    
    return stats;
  }

  // ===== DANH SÁCH ĐƠN HÀNG =====
  function renderOrdersList() {
    const container = document.getElementById("orders-list");
    const countElement = document.getElementById("orders-count");
    
    countElement.textContent = filteredOrders.length;
    
    if (filteredOrders.length === 0) {
      container.innerHTML = `
        <div class="no-orders">
          <i class="fas fa-inbox"></i>
          <h3>Không có đơn hàng nào</h3>
          <p>Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại</p>
        </div>
      `;
      return;
    }
    
    // Sắp xếp theo thời gian mới nhất
    const sortedOrders = [...filteredOrders].sort((a, b) => b.timestamp - a.timestamp);
    
    container.innerHTML = sortedOrders.map(order => renderOrderItem(order)).join('');
  }

  function renderOrderItem(order) {
    const date = new Date(order.timestamp).toLocaleString('vi-VN');
    const statusClass = `status-${order.status}`;
    const paymentClass = `payment-${order.payment}`;
    
    const statusText = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    
    const paymentText = {
      unpaid: 'Chưa thanh toán',
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán'
    };
    
    const paymentMethodText = {
      cod: 'COD',
      bank_transfer: 'Chuyển khoản',
      qr_payment: 'QR Code',
      credit_card: 'Thẻ tín dụng'
    };

    return `
      <div class="order-item">
        <div class="order-header">
          <div>
            <div class="order-id">#${order.id}</div>
            <div class="order-date">
              <i class="fas fa-clock"></i> ${date}
            </div>
          </div>
          <div class="order-status">
            <span class="status-badge ${statusClass}">
              ${statusText[order.status] || order.status}
            </span>
            <span class="status-badge ${paymentClass}">
              ${paymentText[order.payment] || order.payment}
            </span>
          </div>
        </div>
        
        <div class="order-details">
          <div class="customer-info">
            <h4><i class="fas fa-user"></i> Thông tin khách hàng</h4>
            <p><strong>Tên:</strong> ${order.recipientName || order.user?.fullname || 'N/A'}</p>
            <p><strong>Email:</strong> ${order.user?.email || 'N/A'}</p>
            <p><strong>SĐT:</strong> ${order.phone || order.user?.phone || 'N/A'}</p>
            <p><strong>Địa chỉ:</strong> ${order.address || 'N/A'}</p>
          </div>
          
          <div class="order-info">
            <h4><i class="fas fa-box"></i> Thông tin đơn hàng</h4>
            <p><strong>Số sản phẩm:</strong> ${order.products?.length || 0}</p>
            <p><strong>Phương thức TT:</strong> ${paymentMethodText[order.paymentMethod] || order.paymentMethod || 'N/A'}</p>
            <p class="order-total"><strong>Tổng tiền: ₫${Number(order.total || 0).toLocaleString()}</strong></p>
          </div>
          
          <div class="payment-info">
            <h4><i class="fas fa-credit-card"></i> Sản phẩm</h4>
            ${order.products?.slice(0, 3).map(product => `
              <p>${product.name} x${product.quantity}</p>
            `).join('') || '<p>Không có thông tin</p>'}
            ${order.products?.length > 3 ? `<p><em>... và ${order.products.length - 3} sản phẩm khác</em></p>` : ''}
          </div>
        </div>
        
        <div class="order-actions">
          ${order.status === 'pending' ? `
            <button class="btn btn-success" onclick="updateOrderStatus('${order.id}', 'confirmed')">
              <i class="fas fa-check"></i> Xác nhận
            </button>
            <button class="btn btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">
              <i class="fas fa-times"></i> Hủy đơn
            </button>
          ` : ''}
          
          ${order.status === 'confirmed' ? `
            <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'shipping')">
              <i class="fas fa-truck"></i> Giao hàng
            </button>
          ` : ''}
          
          ${order.status === 'shipping' ? `
            <button class="btn btn-success" onclick="updateOrderStatus('${order.id}', 'completed')">
              <i class="fas fa-check-circle"></i> Hoàn thành
            </button>
          ` : ''}
          
          ${order.payment === 'unpaid' || order.payment === 'pending' ? `
            <button class="btn btn-warning" onclick="updatePaymentStatus('${order.id}', 'paid')">
              <i class="fas fa-money-check"></i> Đã thanh toán
            </button>
          ` : ''}
          
          <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')">
            <i class="fas fa-eye"></i> Chi tiết
          </button>
        </div>
      </div>
    `;
  }

  // ===== CẬP NHẬT TRẠNG THÁI =====
  window.updateOrderStatus = function(orderId, newStatus) {
    if (!confirm(`Bạn có chắc muốn cập nhật trạng thái đơn hàng này?`)) return;
    
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = newStatus;
      orders[orderIndex].updatedAt = Date.now();
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders();
      
      alert(`Đã cập nhật trạng thái đơn hàng thành "${getStatusText(newStatus)}"`);
    }
  };

  window.updatePaymentStatus = function(orderId, newPayment) {
    if (!confirm(`Bạn có chắc muốn cập nhật trạng thái thanh toán?`)) return;
    
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    const orderIndex = orders.findIndex(order => order.id === orderId);
    
    if (orderIndex !== -1) {
      orders[orderIndex].payment = newPayment;
      orders[orderIndex].updatedAt = Date.now();
      
      localStorage.setItem("orders", JSON.stringify(orders));
      loadOrders();
      
      alert(`Đã cập nhật trạng thái thanh toán thành "${getPaymentText(newPayment)}"`);
    }
  };

  window.viewOrderDetails = function(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    const details = `
Mã đơn hàng: ${order.id}
Thời gian: ${new Date(order.timestamp).toLocaleString('vi-VN')}
Khách hàng: ${order.recipientName || order.user?.fullname}
Email: ${order.user?.email}
Số điện thoại: ${order.phone}
Địa chỉ: ${order.address}
Phương thức thanh toán: ${order.paymentMethod}
Trạng thái: ${getStatusText(order.status)}
Thanh toán: ${getPaymentText(order.payment)}
Tổng tiền: ₫${Number(order.total).toLocaleString()}

Sản phẩm:
${order.products?.map(p => `- ${p.name} x${p.quantity} = ₫${Number(p.price * p.quantity).toLocaleString()}`).join('\n') || 'Không có thông tin'}
    `;
    
    alert(details);
  };

  // ===== BỘ LỌC =====
  window.applyFilters = function() {
    const dateFrom = document.getElementById("date-from").value;
    const dateTo = document.getElementById("date-to").value;
    const statusFilter = document.getElementById("status-filter").value;
    const paymentFilter = document.getElementById("payment-filter").value;
    const searchTerm = document.getElementById("search-order").value.toLowerCase();
    
    filteredOrders = allOrders.filter(order => {
      const orderDate = formatDate(new Date(order.timestamp));
      
      // Lọc theo ngày
      if (dateFrom && orderDate < dateFrom) return false;
      if (dateTo && orderDate > dateTo) return false;
      
      // Lọc theo trạng thái
      if (statusFilter && order.status !== statusFilter) return false;
      if (paymentFilter && order.payment !== paymentFilter) return false;
      
      // Tìm kiếm
      if (searchTerm) {
        const searchFields = [
          order.id,
          order.user?.fullname,
          order.user?.email,
          order.recipientName,
          order.phone
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchFields.includes(searchTerm)) return false;
      }
      
      return true;
    });
    
    renderStats();
    renderCharts();
    renderOrdersList();
  };

  window.refreshOrders = function() {
    loadOrders();
    alert("Đã làm mới dữ liệu!");
  };

  window.exportOrders = function() {
    if (filteredOrders.length === 0) {
      alert("Không có đơn hàng nào để xuất!");
      return;
    }
    
    // Tạo CSV data
    const headers = ['Mã đơn hàng', 'Thời gian', 'Khách hàng', 'Email', 'SĐT', 'Địa chỉ', 'Tổng tiền', 'Trạng thái', 'Thanh toán'];
    const csvData = [headers];
    
    filteredOrders.forEach(order => {
      csvData.push([
        order.id,
        new Date(order.timestamp).toLocaleString('vi-VN'),
        order.recipientName || order.user?.fullname || '',
        order.user?.email || '',
        order.phone || '',
        order.address || '',
        order.total || 0,
        getStatusText(order.status),
        getPaymentText(order.payment)
      ]);
    });
    
    // Tạo và download file
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `don-hang-${formatDate(new Date())}.csv`;
    link.click();
  };

  // ===== UTILITY FUNCTIONS =====
  function getStatusText(status) {
    const statusMap = {
      pending: 'Chờ xác nhận',
      confirmed: 'Đã xác nhận',
      shipping: 'Đang giao',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  }

  function getPaymentText(payment) {
    const paymentMap = {
      unpaid: 'Chưa thanh toán',
      pending: 'Chờ thanh toán',
      paid: 'Đã thanh toán'
    };
    return paymentMap[payment] || payment;
  }
});