import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { fetchProducts, type Product } from './productSlice';
import PaymentForm from '../payment/PaymentForm';
import './ProductList.css';

export const ProductList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleBuyClick = (product: Product) => {
    setSelectedProduct(product);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedProduct(null);
    dispatch(fetchProducts());
  };

  const { items: products, status, error } = useSelector((state: RootState) => state.products);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [status, dispatch]);

  let content;

  if (status === 'loading') {
    content = <div>Cargando productos...</div>;
  } else if (status === 'succeeded') {
    content = (
      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              loading="lazy"
              onLoad={(e) => {
                e.currentTarget.classList.add('loaded');
              }}
              onError={(e) => {
                e.currentTarget.src = '';
                e.currentTarget.alt = 'Imagen no disponible';
              }}
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <div className="product-info">
              <span>Precio: ${product.price.toLocaleString('es-CO')}</span>
              <span className={`stock-badge ${product.stock === 0 ? 'out-of-stock' : product.stock < 5 ? 'low-stock' : ''}`}>
                {product.stock === 0 ? 'Agotado' : `Stock: ${product.stock}`}
              </span>
            </div>
            <button 
              onClick={() => handleBuyClick(product)}
              disabled={product.stock === 0}
              className={product.stock === 0 ? 'disabled' : ''}
            >
              {product.stock === 0 ? 'Sin stock' : 'Comprar'}
            </button>
          </div>
        ))}
      </div>
    );
  } else if (status === 'failed') {
    content = <div>{error}</div>;
  }

  return (
    <>
      <section className="product-list-section">
        <h2>Nuestros Productos</h2>
        {content}
      </section>
      
      {showPaymentModal && selectedProduct && (
        <PaymentForm
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          price={selectedProduct.price}
          onClose={handleClosePaymentModal}
        />
      )}
    </>
  );
};