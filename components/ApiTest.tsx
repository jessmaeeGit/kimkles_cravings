import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import ApiService from '../services/apiService';

export default function ApiTest() {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const testApiConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await ApiService.healthCheck();
      
      if (result.success) {
        setTestResult(`✅ API Connection Successful!\nStatus: ${result.status}\nMessage: ${result.message}`);
        Alert.alert('API Test', 'Backend API is reachable!');
      } else {
        setTestResult(`❌ API Connection Failed!\nError: ${result.error}`);
        Alert.alert('API Test', 'Backend API is not reachable. Check your connection.');
      }
    } catch (error) {
      const errorMessage = `❌ API Test Error!\n${error.message}`;
      setTestResult(errorMessage);
      Alert.alert('API Test Error', error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const testPayPalOrder = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const testOrder = {
        items: [
          {
            name: 'Test Product',
            price: 100,
            quantity: 1
          }
        ],
        total: 100,
        currency: 'PHP'
      };

      const result = await ApiService.createPayPalOrder(testOrder);
      
      if (result.success) {
        setTestResult(`✅ PayPal Order Created!\nOrder ID: ${result.orderId}\nApproval URL: ${result.approvalUrl}`);
        Alert.alert('PayPal Test', 'PayPal order created successfully!');
      } else {
        setTestResult(`❌ PayPal Order Failed!\nError: ${result.error}`);
        Alert.alert('PayPal Test', 'PayPal order creation failed.');
      }
    } catch (error) {
      const errorMessage = `❌ PayPal Test Error!\n${error.message}`;
      setTestResult(errorMessage);
      Alert.alert('PayPal Test Error', error.message);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>API Connection Test</Text>
      
      <TouchableOpacity
        style={[styles.button, isTesting && styles.buttonDisabled]}
        onPress={testApiConnection}
        disabled={isTesting}
      >
        {isTesting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Test API Connection</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.paypalButton, isTesting && styles.buttonDisabled]}
        onPress={testPayPalOrder}
        disabled={isTesting}
      >
        {isTesting ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Test PayPal Order</Text>
        )}
      </TouchableOpacity>

      {testResult && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{testResult}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#059669',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  paypalButton: {
    backgroundColor: '#003087',
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  resultText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
});
