
import { supabase } from "@/integrations/supabase/client";

export async function fetchUserCart() {
  const { data, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      service:services (
        id,
        name,
        price,
        image_url
      )
    `);
  
  if (error) throw error;
  return data;
}

export async function addToCart(serviceId: number, quantity: number) {
  const { data, error } = await supabase
    .from('cart_items')
    .upsert({
      service_id: serviceId,
      quantity,
      user_id: (await supabase.auth.getUser()).data.user?.id
    }, {
      onConflict: 'user_id,service_id'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function removeFromCart(serviceId: number) {
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('service_id', serviceId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id);
  
  if (error) throw error;
}

export async function updateCartQuantity(serviceId: number, quantity: number) {
  const { data, error } = await supabase
    .from('cart_items')
    .update({ quantity })
    .eq('service_id', serviceId)
    .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}
