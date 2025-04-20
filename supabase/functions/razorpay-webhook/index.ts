
import { serve } from "std/server";
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the webhook signature
    // NOTE: In a production environment, you should verify the signature
    // using your Razorpay webhook secret
    
    // Parse the request body
    const payload = await req.json();
    console.log('Webhook payload received:', payload);
    
    // Handle different event types
    const { event, payload: eventPayload } = payload;
    
    if (event === 'payment.authorized') {
      // Update payment status in database
      const { order_id, razorpay_payment_id } = eventPayload;
      
      await supabaseClient
        .from('payments')
        .update({
          payment_status: 'completed',
          payment_id: razorpay_payment_id,
          payment_details: eventPayload
        })
        .eq('id', order_id);
      
      // Also update the related order
      await supabaseClient
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_id: razorpay_payment_id
        })
        .eq('id', order_id);
    }
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400 
      }
    );
  }
});
