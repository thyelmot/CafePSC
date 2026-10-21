import {
  getMockProducts,
  updateMockProductAvailability,
  getMockOrders,
  getMockCustomerOrders,
  createMockOrder,
  updateMockOrderStatus,
  cancelMockOrder,
  deleteMockOrder,
  resetMockOrders,
} from './mockData';

// API URL - sử dụng Vercel API routes hoặc localhost cho development
const API_URL = import.meta.env.VITE_API_URL || (
  window.location.hostname === 'localhost' 
    ? `http://localhost:3001/api`  // Local backend
    : '/api'  // Vercel serverless functions
);

// Helper function to get CSRF token from localStorage
function getCSRFToken() {
  return localStorage.getItem('csrfToken') || null;
}

// Helper function to set CSRF token
function setCSRFToken(token) {
  if (token) {
    localStorage.setItem('csrfToken', token);
  } else {
    localStorage.removeItem('csrfToken');
  }
}

// Products API
export async function fetchProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (response.ok) return await response.json();
  } catch (error) {
    console.info('[Mock] Backend offline, loading sample menu items.');
  }
  return getMockProducts();
}

export async function updateProductAvailability(id, isAvailable) {
  try {
    const csrfToken = getCSRFToken();
    const headers = { 
      'Content-Type': 'application/json'
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    const response = await fetch(`${API_URL}/products/${id}/availability`, {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: JSON.stringify({ is_available: isAvailable }),
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.info('[Mock] Backend offline, updating mock availability.');
  }
  return updateMockProductAvailability(id, isAvailable);
}

// Orders API
export async function fetchOrders() {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      credentials: 'include'
    });
    if (response.status === 401) {
      throw new Error('Unauthorized');
    }
    if (response.ok) return await response.json();
  } catch (error) {
    if (error.message === 'Unauthorized') throw error;
    console.info('[Mock] Backend offline, loading mock orders.');
  }
  return getMockOrders();
}

export async function fetchCustomerOrders(customerName, phone) {
  try {
    const params = new URLSearchParams({
      customer_name: customerName,
      phone: phone
    });
    const response = await fetch(`${API_URL}/orders/customer?${params}`);
    if (response.ok) return await response.json();
  } catch (error) {
    if (window.location.hostname === 'localhost') {
      console.info('[Mock] Backend offline, fetching mock customer orders.');
      return getMockCustomerOrders(customerName, phone);
    }
  }
  return window.location.hostname === 'localhost' ? getMockCustomerOrders(customerName, phone) : [];
}

export async function createOrder(orderData) {
  try {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // Server trả về mã lỗi (400, 403, 429, 500...)
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Không thể đặt hàng (mã lỗi: ${response.status})`);
  } catch (error) {
    // Chỉ fallback sang mock KHI chạy trên localhost và backend offline hoàn toàn
    const isNetworkError = error.name === 'TypeError' || error.message?.includes('fetch') || error.message?.includes('Failed to fetch');
    if (window.location.hostname === 'localhost' && isNetworkError) {
      console.info('[Mock] Backend offline, creating order locally.');
      return createMockOrder(orderData);
    }
    // Nếu là lỗi nghiệp vụ (hoặc lỗi trên production), throw lỗi để toast thông báo cho khách biết lý do
    throw error;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const csrfToken = getCSRFToken();
    const headers = { 
      'Content-Type': 'application/json'
    };
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    const response = await fetch(`${API_URL}/orders/${id}/status`, {
      method: 'PUT',
      credentials: 'include',
      headers,
      body: JSON.stringify({ status }),
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.info('[Mock] Backend offline, updating order status in mock data.');
  }
  return updateMockOrderStatus(id, status);
}

export async function resetAllOrders() {
  try {
    const csrfToken = getCSRFToken();
    const headers = {};
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    const response = await fetch(`${API_URL}/orders/reset`, {
      method: 'DELETE',
      credentials: 'include',
      headers
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.info('[Mock] Backend offline, resetting mock orders.');
  }
  return resetMockOrders();
}

export async function cancelOrder(id, customerName, phone) {
  try {
    const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: customerName,
        phone: phone
      }),
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.info('[Mock] Backend offline, cancelling mock order.');
  }
  return cancelMockOrder(id);
}

export async function deleteOrder(id) {
  try {
    const csrfToken = getCSRFToken();
    const headers = {};
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers
    });
    if (response.ok) return await response.json();
  } catch (error) {
    console.info('[Mock] Backend offline, deleting mock order.');
  }
  return deleteMockOrder(id);
}

// Admin authentication
export async function adminLogin(password) {
  try {
    const response = await fetch(`${API_URL}/admin/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      const data = await response.json();
      if (data.csrfToken) {
        setCSRFToken(data.csrfToken);
      }
      return data;
    }
  } catch (error) {
    console.info('[Mock] Backend offline, checking mock admin password.');
  }
  
  if (password === 'admin123' || password === 'admin') {
    localStorage.setItem('cafepsc_mock_auth', 'true');
    setCSRFToken('mock-csrf-token');
    return { success: true, token: 'mock-admin-token' };
  }
  throw new Error('Mật khẩu không đúng (Mặc định: admin123)');
}

// Admin logout
export async function adminLogout() {
  setCSRFToken(null);
  localStorage.removeItem('cafepsc_mock_auth');
  try {
    await fetch(`${API_URL}/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {}
  return { success: true };
}

// Check admin authentication status
export async function checkAdminAuth() {
  try {
    const response = await fetch(`${API_URL}/admin/check`, {
      method: 'GET',
      credentials: 'include',
    });
    if (response.status === 200) return true;
    if (response.status === 401) return false;
  } catch (error) {
    // Network error -> fallback
  }
  return localStorage.getItem('cafepsc_mock_auth') === 'true';
}
