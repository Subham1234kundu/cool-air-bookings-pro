
import { supabase } from "@/integrations/supabase/client";

export type PaymentDetails = {
  orderId: number | null;
  amount: number;
  currency: string;
  notes: {
    address: string;
    email: string;
    name: string;
    userId: string;
  };
};

export async function createPayment(paymentDetails: PaymentDetails) {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    console.log("Creating payment for order:", paymentDetails.orderId);
    
    const { data, error } = await supabase
      .from('payments')
      .insert({
        order_id: paymentDetails.orderId,
        user_id: user.user.id,
        payment_amount: paymentDetails.amount,
        payment_gateway: 'razorpay',
        payment_status: 'initiated',
        payment_details: {
          currency: paymentDetails.currency,
          notes: paymentDetails.notes
        }
      })
      .select()
      .single();
    
    if (error) {
      console.error("Payment creation error:", error);
      throw error;
    }
    
    if (!data) {
      throw new Error('No data returned from payment creation');
    }
    
    return data;
  } catch (error) {
    console.error("Create payment error:", error);
    throw error;
  }
}

export async function updatePaymentStatus(paymentId: number, status: string, paymentDetails: any) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      payment_status: status,
      payment_id: paymentDetails?.razorpay_payment_id || null,
      payment_details: paymentDetails
    })
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
