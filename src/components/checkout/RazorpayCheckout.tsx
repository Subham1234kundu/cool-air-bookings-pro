
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
    onSettled: (data, error) => {
      if (error) {
        toast({
          title: 'Payment initialization failed',
          description: 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
        onFailure(error);
      }
    }
  });

  useEffect(() => {
    const initializePayment = async () => {
      const isScriptLoaded = await loadRazorpayScript();
      
      if (isScriptLoaded) {
        try {
          const paymentData = await paymentMutation.mutateAsync({
            orderId,
            amount: amount * 100, // Razorpay takes amount in paise
            currency: 'INR',
            notes: {
              address,
              email,
              name,
              userId: (await supabase.auth.getUser()).data.user?.id || ''
            }
          });
          
          const options = {
            key: 'rzp_test_your_key_here', // Replace with your actual Razorpay key
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
              navigate('/bookings');
            },
            prefill: {
              name,
              email,
              contact: phone,
            },
            notes: {
              address: address
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

          const razorpay = new window.Razorpay(options);
          razorpay.open();
          
        } catch (error) {
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
  }, [amount, name, email, phone, address, orderId, onSuccess, onFailure, paymentMutation, navigate, toast]);

  return null;
};
