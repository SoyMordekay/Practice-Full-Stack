import { configureStore } from '@reduxjs/toolkit';
import productsReducer from '../features/products/productSlice';
import paymentReducer from '../features/payment/paymentSlice'; 

export const store = configureStore({
  reducer: {
    products: productsReducer,
    payment: paymentReducer, 
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;