// API Service for backend communication
const API_BASE_URL = 'https://backend-kimklescravings.up.railway.app/api';

export class ApiService {
  /**
   * Make HTTP request to backend
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} API response
   */
  static async request(endpoint, options = {}) {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const defaultOptions = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const response = await fetch(url, { ...defaultOptions, ...options });
      
      // Check if response is ok
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          // If not JSON, use the text as error message
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      // Try to parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return { message: await response.text() };
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Create PayPal order
   * @param {Object} orderData - Order details
   * @returns {Promise<Object>} PayPal order response
   */
  static async createPayPalOrder(orderData) {
    return this.request('/payments/paypal/create-order', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  /**
   * Capture PayPal payment
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<Object>} Capture response
   */
  static async capturePayPalPayment(orderId) {
    return this.request('/payments/paypal/capture', {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  /**
   * Get PayPal order details
   * @param {string} orderId - PayPal order ID
   * @returns {Promise<Object>} Order details
   */
  static async getPayPalOrderDetails(orderId) {
    return this.request(`/payments/paypal/order/${orderId}`);
  }

  /**
   * Test API connection
   * @returns {Promise<Object>} Health check response
   */
  static async healthCheck() {
    try {
      const response = await fetch(API_BASE_URL.replace('/api', ''));
      return {
        success: true,
        status: response.status,
        message: await response.text()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default ApiService;
