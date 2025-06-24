import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../app/store';
import { createTransaction } from './paymentSlice';
import axios from 'axios';
import './PaymentForm.css';

interface IFormInput {
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

const CardLogo = ({ type }: { type: 'VISA' | 'MASTERCARD' | null }) => {
  if (type === 'VISA') return <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" width="40" />;
  if (type === 'MASTERCARD') return <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" width="40" />;
  return null;
};

export const PaymentForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<IFormInput>({
    defaultValues: {
      cardHolder: 'PRUEBA APROBADA',
      cardNumber: '4242424242424242',
      expMonth: '12',
      expYear: '25',
      cvc: '123'
    }
  });
  
  const [apiError, setApiError] = useState<string | null>(null);
  const [cardType, setCardType] = useState<'VISA' | 'MASTERCARD' | null>('VISA');

  const dispatch = useDispatch<AppDispatch>();
  const { selectedProduct, status, error } = useSelector((state: RootState) => state.payment);

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value.startsWith('4')) setCardType('VISA');
    else if (value.startsWith('5')) setCardType('MASTERCARD');
    else setCardType(null);
  };

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setApiError(null);

    if (!selectedProduct) return;

    try {
      console.log("Intentando tokenizar directamente con la API de Wompi...");

      const tokenizationPayload = {
        number: data.cardNumber.replace(/\s/g, ''),
        cvc: data.cvc,
        exp_month: data.expMonth, 
        exp_year: data.expYear,
        card_holder: data.cardHolder,
      };

      const tokenizationUrl = 'https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards';
      const publicKey = 'pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7';

      const wompiTokenResponse = await axios.post(
        tokenizationUrl,
        tokenizationPayload,
        {
          headers: {
            'Authorization': `Bearer ${publicKey}`,
          },
        }
      );

      if (wompiTokenResponse.data && wompiTokenResponse.data.data && wompiTokenResponse.data.data.id) {
        const token = wompiTokenResponse.data.data.id;
        console.log('Token de Wompi generado directamente:', token);

        dispatch(createTransaction({
          productId: selectedProduct.id,
          creditCardToken: token,
          customerEmail: 'test.user@example.com',
          installments: 1,
        }));
      } else {
        console.error("Respuesta inesperada de la API de tokenización:", wompiTokenResponse.data);
        setApiError("Error en la respuesta de la API de tokenización.");
      }

    } catch (tokenizationError: any) {
      console.error("Error al tokenizar directamente:", tokenizationError.response?.data || tokenizationError.message);
      const errorMessage = tokenizationError.response?.data?.error?.messages 
        ? JSON.stringify(tokenizationError.response.data.error.messages)
        : tokenizationError.response?.data?.message
        || tokenizationError.message
        || 'Error desconocido al obtener token';
      setApiError(`Error al obtener el token: ${errorMessage}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="payment-form">
      <div className="form-group">
        <label>Nombre en la tarjeta</label>
        <input {...register("cardHolder", { required: true })} />
        {errors.cardHolder && <span className="error">Este campo es requerido.</span>}
      </div>

      <div className="form-group">
        <label>Número de la tarjeta</label>
        <div className="card-input-wrapper">
          <input 
            {...register("cardNumber", { required: true, pattern: /^\d{16}$/ })}
            onChange={handleCardNumberChange}
            placeholder="0000 0000 0000 0000"
          />
          <div className="card-logo">
            <CardLogo type={cardType} />
          </div>
        </div>
        {errors.cardNumber && <span className="error">Número de tarjeta inválido.</span>}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Mes Exp.</label>
          <input {...register("expMonth", { required: true, pattern: /^(0[1-9]|1[0-2])$/ })} placeholder="MM" />
          {errors.expMonth && <span className="error">Mes inválido.</span>}
        </div>
        <div className="form-group">
          <label>Año Exp.</label>
          <input {...register("expYear", { required: true, pattern: /^\d{2}$/ })} placeholder="YY" />
          {errors.expYear && <span className="error">Año inválido.</span>}
        </div>
        <div className="form-group">
          <label>CVC</label>
          <input {...register("cvc", { required: true, pattern: /^\d{3,4}$/ })} placeholder="123" />
          {errors.cvc && <span className="error">CVC inválido.</span>}
        </div>
      </div>
      
      <button 
        type="submit" 
        className="submit-button" 
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Procesando...' : 'Pagar con Datos de Prueba'}
      </button>

      {apiError && <p className="error" style={{textAlign: 'center', marginTop: '1rem'}}>{apiError}</p>}
      {status === 'failed' && <p className="error" style={{textAlign: 'center', marginTop: '1rem'}}>{error}</p>}
    </form>
  );
};