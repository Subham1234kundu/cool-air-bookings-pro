
import { supabase } from "@/integrations/supabase/client";

export async function fetchUserBookings() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function createBooking(bookingData: {
  locationId: number,
  scheduledAt: string,
  items: Array<{
    service_id: number,
    quantity: number,
    unit_price: number,
    service_name: string
  }>,
  totalAmount: number,
  address: string,
  contactInfo?: {
    fullName: string,
    email: string,
    phone: string
  }
}) {
  const { data: userData } = await supabase.auth.getUser();
  
  // First create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userData.user?.id,
      scheduled_at: bookingData.scheduledAt,
      total_amount: bookingData.totalAmount,
      status: 'pending',
      payment_status: 'unpaid',
      address: bookingData.address,
      // Store contact information
      fullName: bookingData.contactInfo?.fullName,
      email: bookingData.contactInfo?.email,
      phone: bookingData.contactInfo?.phone
    })
    .select()
    .single();
  
  if (orderError) throw orderError;

  // Then create order items
  const orderItems = bookingData.items.map(item => ({
    order_id: order.id,
    service_id: item.service_id,
    service_name: item.service_name,
    quantity: item.quantity,
    unit_price: item.unit_price,
    item_total: item.quantity * item.unit_price
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) throw itemsError;

  return order;
}
