// PayPal Service for React Native
import ApiService from './apiService.js';
import { Linking } from 'react-native';
import type { PayPalOrderResponse, PayPalCaptureResponse, PayPalOrderDetailsResponse, ValidationResult, PayPalOrderData } from './types';

export class PayPalService {
  /**
   * Create a PayPal order
   * @param {PayPalOrderData} orderData - Order details
   * @returns {Promise<PayPalOrderResponse>} PayPal order response
   */
  static async createOrder(orderData: PayPalOrderData): Promise<PayPalOrderResponse> {
    try {
      const result = await ApiService.createPayPalOrder(orderData);
      return result;
    } catch (error) {
      console.error('PayPal create order error:', error);
      throw error;
    }
  }

  /**
   * Capture a PayPal payment
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<PayPalCaptureResponse>} Capture response
   */
  static async capturePayment(orderId: string): Promise<PayPalCaptureResponse> {
    try {
      const result = await ApiService.capturePayPalPayment(orderId);
      return result;
    } catch (error) {
      console.error('PayPal capture payment error:', error);
      throw error;
    }
  }

  /**
   * Get PayPal order details
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<PayPalOrderDetailsResponse>} Order details
   */
  static async getOrderDetails(orderId: string): Promise<PayPalOrderDetailsResponse> {
    try {
      const result = await ApiService.getPayPalOrderDetails(orderId);
      return result;
    } catch (error) {
      console.error('PayPal get order details error:', error);
      throw error;
    }
  }

  /**
   * Format cart items for PayPal
   * @param {Array} cartItems - Cart items
   * @returns {Array} Formatted items for PayPal
   */
  static formatCartItems(cartItems) {
    return cartItems.map(item => ({
      name: item.product.name,
      price: item.product.price,
      quantity: item.qty
    }));
  }

  /**
   * Open PayPal payment in browser
   * @param {string} approvalUrl - PayPal approval URL
   * @returns {Promise<string>} Order ID after approval
   */
  static async openPayPalPayment(approvalUrl) {
    return new Promise((resolve, reject) => {
      Linking.openURL(approvalUrl)
        .then(() => {
          // In a real app, you would handle the return URL
          // and extract the order ID from the URL parameters
          // For now, we'll simulate this with a timeout
          setTimeout(() => {
            // This is a simulation - in reality, you'd get this from the return URL
            const mockOrderId = 'PAYPAL_ORDER_' + Date.now();
            resolve(mockOrderId);
          }, 3000);
        })
        .catch(reject);
    });
  }

  /**
   * Validate payment data
   * @param {PayPalOrderData} data - Payment data
   * @returns {ValidationResult} Validation result
   */
  static validatePaymentData(data: PayPalOrderData): ValidationResult {
    const { items, total } = data;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return { valid: false, error: 'Items are required' };
    }
    
    if (!total || total <= 0) {
      return { valid: false, error: 'Total amount must be greater than 0' };
    }
    
    for (const item of items) {
      if (!item.name || !item.price || !item.quantity) {
        return { valid: false, error: 'Each item must have name, price, and quantity' };
      }
    }
    
    return { valid: true };
  }
}

export default PayPalService;
