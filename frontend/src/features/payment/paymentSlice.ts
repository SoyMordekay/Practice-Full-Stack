import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

const LAST_TRANSACTION_KEY = 'lastPaymentTransaction';

interface PaymentState {
  loading: boolean;
  error: string | null;
  success: boolean;
  transactionId: string | null;
  lastTransaction: any | null;
}

const initialState: PaymentState = {
  loading: false,
  error: null,
  success: false,
  transactionId: null,
  lastTransaction: null,
};

export const processPayment = createAsyncThunk(
  'payment/processPayment',
  async (paymentData: {
    productId: string;
    customerEmail: string;
    creditCardToken: string;
    installments: number;
    customerData?: {
      name: string;
      email: string;
      phone: string;
    };
    deliveryData?: {
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      customerEmail: string;
    };
  }, { rejectWithValue }) => {
    try {
      console.log('Sending payment data:', paymentData);
      
      const response = await fetch('http://localhost:3000/payment/process-with-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log('Server error response:', errorData);
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        // Extraer mensaje de error más amigable
        let errorMessage = 'Error al procesar el pago';
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (response.status === 400) {
          errorMessage = 'Datos de pago incorrectos. Por favor, verifica la información.';
        } else if (response.status === 404) {
          errorMessage = 'Producto no encontrado.';
        } else if (response.status === 500) {
          errorMessage = 'Error del servidor. Por favor, intenta más tarde.';
        }
        
        return rejectWithValue(errorMessage);
      }

      const result = await response.json();
      // Guardar la última transacción exitosa en localStorage
      if (result && result.data && result.data.transaction) {
        localStorage.setItem(LAST_TRANSACTION_KEY, JSON.stringify(result.data.transaction));
      }
      return result;
    } catch (error) {
      let errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    ...initialState,
    lastTransaction: (() => {
      const saved = localStorage.getItem(LAST_TRANSACTION_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          localStorage.removeItem(LAST_TRANSACTION_KEY);
        }
      }
      return null;
    })(),
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
      state.transactionId = null;
    },
    resetPaymentState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
      state.transactionId = null;
      state.lastTransaction = null;
    },
    clearLastTransaction: (state) => {
      state.lastTransaction = null;
      localStorage.removeItem(LAST_TRANSACTION_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(processPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.transactionId = action.payload.transaction?.id || null;
        state.error = null;
        if (action.payload && action.payload.data && action.payload.data.transaction) {
          state.lastTransaction = action.payload.data.transaction;
        }
      })
      .addCase(processPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Error desconocido al procesar el pago';
        state.success = false;
      });
  },
});

export const { clearError, clearSuccess, resetPaymentState, clearLastTransaction } = paymentSlice.actions;
export default paymentSlice.reducer;