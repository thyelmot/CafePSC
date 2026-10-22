export const DEFAULT_SIZES = [
  { value: 'M', label: 'Tiêu chuẩn (M)', priceAdd: 0 },
];

export const INITIAL_MOCK_PRODUCTS = [
  { id: 1, name: 'Cà phê đen (đá)', price: 20000, category: 'coffee', is_available: true, sizes: DEFAULT_SIZES },
  { id: 2, name: 'Cà phê sữa', price: 20000, category: 'coffee', is_available: true, sizes: DEFAULT_SIZES },
  { id: 3, name: 'Bạc xỉu', price: 25000, category: 'coffee', is_available: true, sizes: DEFAULT_SIZES },
  { id: 4, name: 'Cafe latte', price: 35000, category: 'coffee', is_available: true, sizes: DEFAULT_SIZES },
  { id: 5, name: 'Cafe nước dừa', price: 35000, category: 'coffee', is_available: true, sizes: DEFAULT_SIZES },
  { id: 6, name: 'Cafe cốt dừa', price: 35000, category: 'coffee', is_available: true, sizes: DEFAULT_SIZES },
  { id: 7, name: 'Matcha latte', price: 35000, category: 'tea', is_available: true, sizes: DEFAULT_SIZES },
  { id: 8, name: 'Dây thẻ', price: 30000, category: 'merch', is_available: true, sizes: [] },
];

export const INITIAL_MOCK_ORDERS = [
  {
    id: 101,
    customer_name: 'Nguyễn Văn An',
    phone: '0901234567',
    delivery_address: 'Bàn 04',
    status: 'making',
    note: 'Ít ngọt giúp mình nhé',
    created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    order_items: [
      {
        id: 1,
        order_id: 101,
        product_id: 1,
        quantity: 2,
        options_json: { size: 'M', sugar: '70%', ice: 'Bình thường' },
        product: { id: 1, name: 'Cà Phê Sữa Đá', price: 25000, category: 'coffee' }
      },
      {
        id: 2,
        order_id: 101,
        product_id: 9,
        quantity: 1,
        options_json: { size: 'L', sugar: '50%', ice: 'Ít đá' },
        product: { id: 9, name: 'Trà Đào', price: 30000, category: 'tea' }
      }
    ]
  },
  {
    id: 102,
    customer_name: 'Trần Thị Mai',
    phone: '0912345678',
    delivery_address: 'Bàn 02',
    status: 'pending',
    note: 'Mang đi giúp mình',
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    order_items: [
      {
        id: 3,
        order_id: 102,
        product_id: 3,
        quantity: 1,
        options_json: { size: 'M', sugar: '100%', ice: 'Bình thường' },
        product: { id: 3, name: 'Bạc Xỉu', price: 28000, category: 'coffee' }
      }
    ]
  },
  {
    id: 100,
    customer_name: 'Lê Hoàng Long',
    phone: '0987654321',
    delivery_address: 'Bàn 01',
    status: 'done',
    note: '',
    created_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    order_items: [
      {
        id: 4,
        order_id: 100,
        product_id: 14,
        quantity: 1,
        options_json: { size: 'L', sugar: '70%', ice: 'Bình thường' },
        product: { id: 14, name: 'Sinh Tố Bơ', price: 35000, category: 'smoothie' }
      }
    ]
  }
];

export function getMockProducts() {
  const saved = localStorage.getItem('cafepsc_mock_products');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Tự động bổ sung bất kỳ món mới nào có trong INITIAL_MOCK_PRODUCTS (như Dây thẻ)
      const existingIds = new Set(parsed.map(p => p.id));
      const missingProducts = INITIAL_MOCK_PRODUCTS.filter(p => !existingIds.has(p.id));
      
      const updated = [...parsed, ...missingProducts].map(p => ({
        ...p,
        sizes: (p.category === 'merch' || p.category === 'accessories') 
          ? [] 
          : ((p.sizes && p.sizes.length > 0 && !p.sizes.some(s => (s.value || s.name) === 'L')) ? p.sizes : DEFAULT_SIZES)
      }));
      localStorage.setItem('cafepsc_mock_products', JSON.stringify(updated));
      return updated;
    } catch (e) {}
  }
  localStorage.setItem('cafepsc_mock_products', JSON.stringify(INITIAL_MOCK_PRODUCTS));
  return INITIAL_MOCK_PRODUCTS;
}

export function updateMockProductAvailability(id, isAvailable) {
  const products = getMockProducts();
  const updated = products.map(p => p.id === Number(id) ? { ...p, is_available: isAvailable } : p);
  localStorage.setItem('cafepsc_mock_products', JSON.stringify(updated));
  return updated.find(p => p.id === Number(id));
}

export function getMockOrders() {
  const saved = localStorage.getItem('cafepsc_mock_orders');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Tự động dọn dẹp các đơn ảo cũ bị gán tên "Món nước"
      const cleaned = parsed.filter(o => 
        !o.order_items?.some(item => item.product?.name === 'Món nước')
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem('cafepsc_mock_orders', JSON.stringify(cleaned));
      }
      return cleaned;
    } catch (e) {}
  }
  localStorage.setItem('cafepsc_mock_orders', JSON.stringify(INITIAL_MOCK_ORDERS));
  return INITIAL_MOCK_ORDERS;
}

export function getMockCustomerOrders(customerName, phone) {
  const orders = getMockOrders();
  return orders.filter(o => 
    (!customerName || o.customer_name?.toLowerCase() === customerName.toLowerCase()) &&
    (!phone || o.phone === phone)
  );
}

export function createMockOrder(orderData) {
  const orders = getMockOrders();
  const products = getMockProducts();
  const newId = Date.now();

  const formattedItems = (orderData.items || []).map((item, idx) => {
    const product = products.find(p => p.id === Number(item.product_id)) || 
      INITIAL_MOCK_PRODUCTS.find(p => p.id === Number(item.product_id)) || 
      item.product || {
        id: item.product_id,
        name: item.name || 'Bạc xỉu',
        price: 25000,
        category: 'coffee'
      };
    return {
      id: newId + idx + 1,
      order_id: newId,
      product_id: Number(item.product_id),
      quantity: Number(item.quantity) || 1,
      options_json: item.options || {},
      product: product
    };
  });

  const newOrder = {
    id: newId,
    customer_name: orderData.customer_name || 'Khách hàng',
    phone: orderData.phone || '',
    delivery_address: orderData.delivery_address || '',
    status: 'pending',
    note: orderData.note || '',
    created_at: new Date().toISOString(),
    order_items: formattedItems
  };

  const updatedOrders = [newOrder, ...orders];
  localStorage.setItem('cafepsc_mock_orders', JSON.stringify(updatedOrders));
  return newOrder;
}

export function updateMockOrderStatus(id, status) {
  const orders = getMockOrders();
  const updated = orders.map(o => o.id === Number(id) ? { ...o, status } : o);
  localStorage.setItem('cafepsc_mock_orders', JSON.stringify(updated));
  return updated.find(o => o.id === Number(id));
}

export function cancelMockOrder(id) {
  return updateMockOrderStatus(id, 'cancelled');
}

export function deleteMockOrder(id) {
  const orders = getMockOrders();
  const updated = orders.filter(o => o.id !== Number(id));
  localStorage.setItem('cafepsc_mock_orders', JSON.stringify(updated));
  return { success: true };
}

export function resetMockOrders() {
  localStorage.setItem('cafepsc_mock_orders', JSON.stringify([]));
  return { success: true };
}
