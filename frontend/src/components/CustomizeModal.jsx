import { useState, useMemo } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import styles from './CustomizeModal.module.css';
import { normalizeSizes, calculateUnitPrice } from '../utils/productUtils';

const SUGAR_OPTIONS = [
  { value: '0%', label: 'Không đường' },
  { value: '30%', label: 'Ít đường (30%)' },
  { value: '50%', label: 'Nửa đường (50%)' },
  { value: '70%', label: 'Bình thường (70%)' },
  { value: '100%', label: 'Ngọt (100%)' },
];

const ICE_OPTIONS = [
  { value: 'Không đá', label: 'Không đá' },
  { value: 'Ít đá', label: 'Ít đá' },
  { value: 'Bình thường', label: 'Bình thường' },
  { value: 'Nhiều đá', label: 'Nhiều đá' },
];

export default function CustomizeModal({ product, onClose, onConfirm, onPlaceOrder }) {
  const sizeOptions = useMemo(() => normalizeSizes(product?.sizes), [product?.sizes]);
  const defaultSize = sizeOptions[0]?.value || 'M';

  const [options, setOptions] = useState({
    size: defaultSize,
    sugar: '70%',
    ice: 'Bình thường',
  });
  const [quantity, setQuantity] = useState(1);

  const calculateTotal = () => {
    return calculateUnitPrice(product, options) * quantity;
  };

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleConfirm = () => {
    onConfirm(product, options, quantity);
  };

  const handlePlaceOrder = () => {
    if (onPlaceOrder) {
      onPlaceOrder(product, options, quantity);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>{product.name}</h2>
            <p className={styles.basePrice}>
              Giá gốc: {product.price.toLocaleString('vi-VN')}đ
            </p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        {/* Options */}
        <div className={styles.options}>
          {/* Size (chỉ hiển thị khi sản phẩm có từ 2 size trở lên) */}
          {sizeOptions.length > 1 && (
            <div className={styles.optionGroup}>
              <h3 className={styles.optionLabel}>Kích cỡ</h3>
              <div className={styles.optionButtons}>
                {sizeOptions.map(size => (
                  <button
                    key={size.value}
                    className={`${styles.optionBtn} ${options.size === size.value ? styles.selected : ''}`}
                    onClick={() => setOptions(prev => ({ ...prev, size: size.value }))}
                  >
                    <span className={styles.optionText}>{size.label}</span>
                    {size.priceAdd !== 0 && (
                      <span className={styles.optionPrice}>
                        {size.priceAdd > 0 ? '+' : ''}{size.priceAdd.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sugar */}
          <div className={styles.optionGroup}>
            <h3 className={styles.optionLabel}>Độ ngọt</h3>
            <div className={styles.optionButtons}>
              {SUGAR_OPTIONS.map(sugar => (
                <button
                  key={sugar.value}
                  className={`${styles.optionBtn} ${styles.small} ${options.sugar === sugar.value ? styles.selected : ''}`}
                  onClick={() => setOptions(prev => ({ ...prev, sugar: sugar.value }))}
                >
                  {sugar.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ice */}
          <div className={styles.optionGroup}>
            <h3 className={styles.optionLabel}>Đá</h3>
            <div className={styles.optionButtons}>
              {ICE_OPTIONS.map(ice => (
                <button
                  key={ice.value}
                  className={`${styles.optionBtn} ${styles.small} ${options.ice === ice.value ? styles.selected : ''}`}
                  onClick={() => setOptions(prev => ({ ...prev, ice: ice.value }))}
                >
                  {ice.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerTop}>
            <div className={styles.quantitySelector}>
              <button 
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Minus size={20} />
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button 
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
              >
                <Plus size={20} />
              </button>
            </div>
            <div className={styles.total}>
              <span className={styles.totalPrice}>
                {calculateTotal().toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.addToCartBtn} onClick={handleConfirm}>
              Thêm vào giỏ hàng
            </button>
            {onPlaceOrder && (
              <button className={styles.placeOrderBtn} onClick={handlePlaceOrder}>
                Đặt hàng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
