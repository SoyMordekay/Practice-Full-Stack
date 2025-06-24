import React from 'react';
import { useSelector } from 'react-redux';
import { ProductList } from './features/products/ProductList';
import { PaymentModal } from './features/payment/PaymentModal';
import type { RootState } from './app/store';
import './App.css';

function App() {
  const { isModalOpen } = useSelector((state: RootState) => state.payment);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi Tienda Online</h1>
      </header>
      <main>
        <ProductList />
      </main>
      {isModalOpen && <PaymentModal />}
    </div>
  );
}

export default App;
