// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PayPalOrderResponse {
  success: boolean;
  orderId: string;
  approvalUrl: string;
  message?: string;
  error?: string;
}

export interface PayPalCaptureResponse {
  success: boolean;
  transactionId: string;
  status: string;
  message?: string;
  error?: string;
}

export interface PayPalOrderDetailsResponse {
  success: boolean;
  order: any;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface PayPalOrderData {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  currency?: string;
  returnUrl?: string;
  cancelUrl?: string;
}
