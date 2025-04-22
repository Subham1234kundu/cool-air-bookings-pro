
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { createPayment } from '@/services/supabase/payments';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayCheckoutProps {
  amount: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  orderId: number;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Replace with your actual Razorpay test key (this is typically safe to expose in client-side code)
// In production, you would want to get this from environment variables
const RAZORPAY_KEY = 'rzp_test_gPj9pWYShmkiZW'; 

export const RazorpayCheckout = ({ 
  amount,
  name,
  email,
  phone,
  address,
  orderId,
  onSuccess,
  onFailure
}: RazorpayCheckoutProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const paymentMutation = useMutation({
    mutationFn: createPayment,
    onSuccess: (data) => {
      console.log("Payment initialized successfully:", data);
      // After payment is initialized, open Razorpay
      openRazorpayCheckout(data);
    },
    onError: (error) => {
      console.error("Payment initialization error:", error);
      toast({
        title: 'Payment initialization failed',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
      onFailure(error);
    }
  });

  const openRazorpayCheckout = (paymentData: any) => {
    const options = {
      key: RAZORPAY_KEY, // Using the key from constant
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      name: 'Cool Air Service',
      description: `Payment for service order #${orderId}`,
      order_id: paymentData.id.toString(),
      handler: function(response: any) {
        toast({
          title: 'Payment Successful',
          description: 'Your payment was processed successfully',
        });
        onSuccess(response);
      },
      prefill: {
        name,
        email,
        contact: phone,
      },
      notes: {
        address: address,
        userId: paymentData.user_id || ''
      },
      theme: {
        color: '#3399cc',
      },
      modal: {
        ondismiss: function() {
          toast({
            title: 'Payment Cancelled',
            description: 'You cancelled the payment process',
            variant: 'destructive',
          });
          onFailure(new Error('Payment process cancelled'));
        }
      }
    };

    try {
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Error opening Razorpay:", error);
      toast({
        title: 'Payment Error',
        description: 'Failed to open payment gateway',
        variant: 'destructive',
      });
      onFailure(error);
    }
  };

  useEffect(() => {
    const initializePayment = async () => {
      console.log("Initializing payment with order ID:", orderId);
      const isScriptLoaded = await loadRazorpayScript();
      
      if (isScriptLoaded) {
        try {          
          console.log("Creating payment with amount:", amount);
          const { data: user } = await supabase.auth.getUser();
          const userId = user?.user?.id || '';
          
          paymentMutation.mutate({
            orderId,
            amount: amount * 100, // Razorpay takes amount in paise
            currency: 'INR',
            notes: {
              address,
              email,
              name,
              userId
            }
          });
          
        } catch (error) {
          console.error("Payment script loading error:", error);
          toast({
            title: 'Payment Error',
            description: 'An error occurred while initializing payment',
            variant: 'destructive',
          });
          onFailure(error);
        }
      } else {
        toast({
          title: 'Payment Gateway Error',
          description: 'Failed to load payment gateway',
          variant: 'destructive',
        });
        onFailure(new Error('Failed to load Razorpay script'));
      }
    };

    initializePayment();
  }, []);

  return null;
};

export default RazorpayCheckout;
