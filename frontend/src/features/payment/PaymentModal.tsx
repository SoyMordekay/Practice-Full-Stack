import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../app/store';
import { Modal } from '../../components/Modal';
import { closePaymentModal } from './paymentSlice';
import { PaymentForm } from './PaymentForm';

export const PaymentModal: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isModalOpen, selectedProduct } = useSelector((state: RootState) => state.payment);

  const handleClose = () => {
    dispatch(closePaymentModal());
  };

  return (
    <Modal 
      isOpen={isModalOpen} 
      onClose={handleClose} 
      title={`Pagar: ${selectedProduct?.name || ''}`}
    >
      <div style={{ marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <p>Estás comprando: <strong>{selectedProduct?.name}</strong></p>
        <p>Precio: <strong>${selectedProduct?.price?.toLocaleString('es-CO') ?? '0'}</strong></p>
        
      </div>
      
      <PaymentForm />

    </Modal>
  );
};