
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
  const { data: user } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('payments')
    .insert({
      order_id: paymentDetails.orderId,
      user_id: user.user?.id,
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
  
  if (error) throw error;
  return data;
}

export async function updatePaymentStatus(paymentId: string, status: string, paymentDetails: any) {
  const { data, error } = await supabase
    .from('payments')
    .update({ 
      payment_status: status,
      payment_id: paymentId,
      payment_details: paymentDetails
    })
    .eq('id', paymentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
