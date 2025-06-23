import React, { useEffect } from 'react'; 
import './App.css';
import { ProductList } from './features/products/ProductList';
import { PaymentModal } from './features/payment/PaymentModal';
import { useScript } from './hooks/useScript';

declare const WompiCheckout: any;

function App() {

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mi Tienda Fantástica</h1>
      </header>
      <main>
        <ProductList />
      </main>
      <PaymentModal />
    </div>
  );
}

export default App;