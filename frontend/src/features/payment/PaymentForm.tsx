import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../app/store';
import { processPayment, clearError, clearSuccess, resetPaymentState } from './paymentSlice';
import { fetchProducts } from '../products/productSlice';
import './PaymentForm.css';

interface PaymentFormProps {
  productId: string;
  productName: string;
  price: number;
  onClose: () => void;
}

interface FormData {
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  // Datos de dirección
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  // Datos de la tarjeta
  cardNumber: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
  installments: number;
}

interface FormErrors {
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  cardNumber?: string;
  expMonth?: string;
  expYear?: string;
  cvc?: string;
  cardHolder?: string;
}

const FORM_STORAGE_KEY = 'paymentFormData';

const PaymentForm: React.FC<PaymentFormProps> = ({ productId, productName, price, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success, transactionId } = useSelector((state: RootState) => state.payment);
  
  const [formData, setFormData] = useState<FormData>(() => {
    const saved = localStorage.getItem(FORM_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Si hay error, limpiar y usar valores por defecto
        localStorage.removeItem(FORM_STORAGE_KEY);
      }
    }
    return {
      customerEmail: '',
      customerName: '',
      customerPhone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      cardNumber: '',
      expMonth: '',
      expYear: '',
      cvc: '',
      cardHolder: '',
      installments: 1,
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [cardType, setCardType] = useState<'VISA' | 'MASTERCARD' | null>(null);

  // Guardar el progreso en localStorage cada vez que cambia el formulario
  useEffect(() => {
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (success) {
      alert(`¡Pago exitoso! Tu transacción ID es: ${transactionId}`);
      dispatch(clearSuccess());
      localStorage.removeItem(FORM_STORAGE_KEY);
      window.location.reload(); // Recarga la página para limpiar el estado y evitar errores de token repetido
    }
  }, [success, transactionId, dispatch, onClose]);

  useEffect(() => {
    if (error) {
      alert(`Error: ${error}`);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar email
    if (!formData.customerEmail) {
      newErrors.customerEmail = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'El email no es válido';
    }

    // Validar nombre
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'El nombre es requerido';
    }

    // Validar teléfono
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'El teléfono es requerido';
    } else if (!/^\d{7,15}$/.test(formData.customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'El teléfono debe tener entre 7 y 15 dígitos';
    }

    // Validar dirección
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    // Validar ciudad
    if (!formData.city.trim()) {
      newErrors.city = 'La ciudad es requerida';
    }

    // Validar departamento
    if (!formData.state.trim()) {
      newErrors.state = 'El departamento es requerido';
    }

    // Validar código postal
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'El código postal es requerido';
    } else if (!/^\d{4,10}$/.test(formData.zipCode.replace(/\s/g, ''))) {
      newErrors.zipCode = 'El código postal debe tener entre 4 y 10 dígitos';
    }

    // Validar país
    if (!formData.country.trim()) {
      newErrors.country = 'El país es requerido';
    }

    // Validar número de tarjeta
    const cardNumber = formData.cardNumber.replace(/\s/g, '');
    if (!cardNumber) {
      newErrors.cardNumber = 'El número de tarjeta es requerido';
    } else if (!/^\d{16}$/.test(cardNumber)) {
      newErrors.cardNumber = 'El número de tarjeta debe tener 16 dígitos';
    } else if (!/^[4-5]/.test(cardNumber)) {
      newErrors.cardNumber = 'Solo se aceptan tarjetas Visa (4) o Mastercard (5)';
    }

    // Validar mes de expiración
    if (!formData.expMonth) {
      newErrors.expMonth = 'El mes es requerido';
    } else if (!/^(0[1-9]|1[0-2])$/.test(formData.expMonth)) {
      newErrors.expMonth = 'Mes inválido (01-12)';
    }

    // Validar año de expiración
    if (!formData.expYear) {
      newErrors.expYear = 'El año es requerido';
    } else if (!/^\d{2}$/.test(formData.expYear)) {
      newErrors.expYear = 'Año inválido (YY)';
    } else {
      const currentYear = new Date().getFullYear() % 100;
      const expYear = parseInt(formData.expYear);
      if (expYear < currentYear) {
        newErrors.expYear = 'La tarjeta ha expirado';
      } else if (expYear > currentYear + 20) {
        newErrors.expYear = 'Año de expiración muy lejano';
      }
    }

    // Validar CVC
    if (!formData.cvc) {
      newErrors.cvc = 'El CVC es requerido';
    } else if (!/^\d{3,4}$/.test(formData.cvc)) {
      newErrors.cvc = 'CVC inválido (3-4 dígitos)';
    }

    // Validar titular de la tarjeta
    if (!formData.cardHolder.trim()) {
      newErrors.cardHolder = 'El titular de la tarjeta es requerido';
    } else if (formData.cardHolder.length < 3) {
      newErrors.cardHolder = 'El nombre del titular debe tener al menos 3 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, '');
    
    if (value.length <= 16) {
      // Formatear con espacios cada 4 dígitos
      value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
      
      setFormData(prev => ({ ...prev, cardNumber: value }));
      
      // Detectar tipo de tarjeta
      if (value.startsWith('4')) {
        setCardType('VISA');
      } else if (value.startsWith('5')) {
        setCardType('MASTERCARD');
      } else {
        setCardType(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // 1. Tokenizar la tarjeta con Wompi
      const tokenizationPayload = {
        number: formData.cardNumber.replace(/\s/g, ''),
        cvc: formData.cvc,
        exp_month: formData.expMonth,
        exp_year: formData.expYear,
        card_holder: formData.cardHolder.toUpperCase(),
      };

      // Validar que los datos estén en el formato correcto
      const expMonth = parseInt(formData.expMonth);
      if (expMonth < 1 || expMonth > 12) {
        alert('Mes de expiración inválido. Debe estar entre 01 y 12.');
        return;
      }

      const expYear = parseInt('20' + formData.expYear);
      if (expYear < 2024) {
        alert('Año de expiración inválido. La tarjeta ha expirado.');
        return;
      }

      console.log('Tokenization payload:', JSON.stringify(tokenizationPayload, null, 2));

      const tokenizationResponse = await fetch('https://api-sandbox.co.uat.wompi.dev/v1/tokens/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7',
        },
        body: JSON.stringify(tokenizationPayload),
      });

      const responseData = await tokenizationResponse.json();
      console.log('Tokenization response:', JSON.stringify(responseData, null, 2));

      if (!tokenizationResponse.ok) {
        console.error('Tokenization error:', responseData);
        
        // Manejar errores específicos de Wompi
        let errorMessage = 'Error al validar la tarjeta.';
        
        if (responseData.error?.messages) {
          const messages = responseData.error.messages;
          console.log('Error messages:', messages);
          
          if (messages.number) {
            errorMessage = 'Número de tarjeta inválido.';
          } else if (messages.cvc) {
            errorMessage = 'CVC inválido.';
          } else if (messages.exp_month) {
            errorMessage = `Mes de expiración inválido: ${messages.exp_month.join(', ')}`;
          } else if (messages.exp_year) {
            errorMessage = `Año de expiración inválido: ${messages.exp_year.join(', ')}`;
          } else if (messages.card_holder) {
            errorMessage = 'Nombre del titular inválido.';
          } else if (messages.payment_method) {
            errorMessage = 'Error en los datos de la tarjeta.';
          }
        }
        
        alert(errorMessage + ' Por favor, verifica los datos e intenta nuevamente.');
        return;
      }

      if (!responseData.data || !responseData.data.id) {
        alert('Error: No se pudo obtener el token de la tarjeta.');
        return;
      }

      const realToken = responseData.data.id;
      console.log('Token obtenido:', realToken);

      // 2. Crear customer y delivery antes del pago
      const customerData = {
        name: formData.customerName,
        email: formData.customerEmail,
        phone: formData.customerPhone,
      };

      const deliveryData = {
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        customerEmail: formData.customerEmail,
      };

      // 3. Procesar el pago con el token real y datos completos
      await dispatch(processPayment({
        productId,
        customerEmail: formData.customerEmail,
        creditCardToken: realToken,
        installments: formData.installments,
        customerData,
        deliveryData,
      })).unwrap();
    } catch (error) {
      console.error('Payment error:', error);
      if (error instanceof Error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Error al procesar el pago. Por favor, intenta nuevamente.');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const getCardLogo = () => {
    if (cardType === 'VISA') {
      return <span style={{ color: '#1a1f71', fontWeight: 'bold' }}>VISA</span>;
    }
    if (cardType === 'MASTERCARD') {
      return <span style={{ color: '#eb001b', fontWeight: 'bold' }}>MC</span>;
    }
    return null;
  };

  const loadTestData = () => {
    setFormData({
      customerEmail: 'maria.garcia@test.com',
      customerName: 'María García',
      customerPhone: '3101234567',
      address: 'Calle 123',
      city: 'Bogotá',
      state: 'Cundinamarca',
      zipCode: '11001',
      country: 'Colombia',
      cardNumber: '4242424242424242', // Tarjeta de prueba Visa
      expMonth: '12',
      expYear: '26', // Año 2026 (2 dígitos)
      cvc: '123',
      cardHolder: 'MARIA GARCIA',
      installments: 1,
    });
    setCardType('VISA');
    setErrors({});
  };

  // Limpiar storage al cerrar el modal manualmente
  const handleClose = () => {
    localStorage.removeItem(FORM_STORAGE_KEY);
    onClose();
  };

  return (
    <div className="payment-form-overlay">
      <div className="payment-form-container">
        <div className="payment-form-header">
          <h2>💳 Completar Compra</h2>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="payment-form-content">
          <div className="product-summary">
            <h3>🛍️ {productName}</h3>
            <p className="price">${price.toLocaleString('es-CO')} COP</p>
          </div>

          <form onSubmit={handleSubmit} className="payment-form">
            {/* Información del Cliente */}
            <div className="form-section">
              <div className="form-section-title">👤 Información Personal</div>
              
              <div className="form-group">
                <label htmlFor="customerName" className="required">Nombre Completo</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Nombre y Apellido"
                  className={errors.customerName ? 'error' : ''}
                />
                {errors.customerName && <div className="error-message">⚠️ {errors.customerName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="customerEmail" className="required">Email</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="correo@ejemplo.com"
                  className={errors.customerEmail ? 'error' : ''}
                />
                {errors.customerEmail && <div className="error-message">⚠️ {errors.customerEmail}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="customerPhone" className="required">Teléfono</label>
                <input
                  type="text"
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="3101234567"
                  className={errors.customerPhone ? 'error' : ''}
                />
                {errors.customerPhone && <div className="error-message">⚠️ {errors.customerPhone}</div>}
              </div>
            </div>

            {/* Información de la Tarjeta */}
            <div className="form-section">
              <div className="form-section-title">💳 Datos de la Tarjeta</div>
              
              <div className="form-group">
                <label htmlFor="cardHolder" className="required">Titular de la Tarjeta</label>
                <input
                  type="text"
                  id="cardHolder"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  placeholder="NOMBRE APELLIDO"
                  className={errors.cardHolder ? 'error' : ''}
                />
                {errors.cardHolder && <div className="error-message">⚠️ {errors.cardHolder}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="cardNumber" className="required">Número de Tarjeta</label>
                <div className="card-input-wrapper">
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className={errors.cardNumber ? 'error' : ''}
                  />
                  <div className="card-logo">
                    {getCardLogo()}
                  </div>
                </div>
                {errors.cardNumber && <div className="error-message">⚠️ {errors.cardNumber}</div>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expMonth" className="required">Mes Exp.</label>
                  <input
                    type="text"
                    id="expMonth"
                    name="expMonth"
                    value={formData.expMonth}
                    onChange={handleInputChange}
                    placeholder="MM"
                    maxLength={2}
                    className={errors.expMonth ? 'error' : ''}
                  />
                  {errors.expMonth && <div className="error-message">⚠️ {errors.expMonth}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="expYear" className="required">Año Exp.</label>
                  <input
                    type="text"
                    id="expYear"
                    name="expYear"
                    value={formData.expYear}
                    onChange={handleInputChange}
                    placeholder="YY"
                    maxLength={2}
                    className={errors.expYear ? 'error' : ''}
                  />
                  {errors.expYear && <div className="error-message">⚠️ {errors.expYear}</div>}
                </div>
                <div className="form-group">
                  <label htmlFor="cvc" className="required">CVC</label>
                  <input
                    type="text"
                    id="cvc"
                    name="cvc"
                    value={formData.cvc}
                    onChange={handleInputChange}
                    placeholder="123"
                    maxLength={4}
                    className={errors.cvc ? 'error' : ''}
                  />
                  {errors.cvc && <div className="error-message">⚠️ {errors.cvc}</div>}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="installments">Cuotas</label>
                <select
                  id="installments"
                  name="installments"
                  value={formData.installments}
                  onChange={handleInputChange}
                >
                  <option value={1}>1 cuota - ${price.toLocaleString('es-CO')}</option>
                  <option value={2}>2 cuotas - ${Math.round(price/2).toLocaleString('es-CO')} c/u</option>
                  <option value={3}>3 cuotas - ${Math.round(price/3).toLocaleString('es-CO')} c/u</option>
                  <option value={6}>6 cuotas - ${Math.round(price/6).toLocaleString('es-CO')} c/u</option>
                  <option value={12}>12 cuotas - ${Math.round(price/12).toLocaleString('es-CO')} c/u</option>
                </select>
              </div>
            </div>

            {/* Información de Dirección */}
            <div className="form-section">
              <div className="form-section-title">📍 Dirección de Entrega</div>
              
              <div className="form-group">
                <label htmlFor="address" className="required">Dirección</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Calle 123"
                  className={errors.address ? 'error' : ''}
                />
                {errors.address && <div className="error-message">⚠️ {errors.address}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="city" className="required">Ciudad</label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Bogotá"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <div className="error-message">⚠️ {errors.city}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="state" className="required">Departamento</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Cundinamarca"
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <div className="error-message">⚠️ {errors.state}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="zipCode" className="required">Código Postal</label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="11001"
                  className={errors.zipCode ? 'error' : ''}
                />
                {errors.zipCode && <div className="error-message">⚠️ {errors.zipCode}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="country" className="required">País</label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Colombia"
                  className={errors.country ? 'error' : ''}
                />
                {errors.country && <div className="error-message">⚠️ {errors.country}</div>}
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={handleClose}
                className="cancel-button"
                disabled={loading}
              >
                ❌ Cancelar
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={loading}
              >
                {loading ? '⏳ Procesando...' : '💳 Pagar Ahora'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentForm;