export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
}

import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  const response = await axios.get<Product[]>('http://localhost:3000/products');
  return response.data;
});


interface ProductsState {
  items: Product[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ProductsState = {
  items: [],
  status: 'idle',
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {}, 
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProducts.fulfilled, (state, action: PayloadAction<Product[]>) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Something went wrong';
      });
  },
});

export default productsSlice.reducer;