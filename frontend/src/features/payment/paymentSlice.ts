import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Product } from '../products/productSlice';

interface TransactionData {
  productId: string;
  customerEmail: string; 
  creditCardToken: string;
  installments: number;
}

export const createTransaction = createAsyncThunk(
  'payment/createTransaction',
  async (transactionData: TransactionData) => {
    const response = await axios.post(
      'http://localhost:3000/payments', 
      transactionData
    );
    return response.data; 
  }
);


interface PaymentState {
  isModalOpen: boolean;
  selectedProduct: Product | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; 
  error: string | null;
}

const initialState: PaymentState = {
  isModalOpen: false,
  selectedProduct: null,
  status: 'idle', 
  error: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    openPaymentModal: (state, action: PayloadAction<Product>) => {
      state.isModalOpen = true;
      state.selectedProduct = action.payload;
      state.status = 'idle'; 
      state.error = null;
    },
    closePaymentModal: (state) => {
      state.isModalOpen = false;
      state.selectedProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTransaction.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createTransaction.fulfilled, (state) => {
        state.status = 'succeeded';
        state.isModalOpen = false; 
      })
      .addCase(createTransaction.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ocurrió un error al procesar el pago.';
      });
  },
});

export const { openPaymentModal, closePaymentModal } = paymentSlice.actions;
export default paymentSlice.reducer;