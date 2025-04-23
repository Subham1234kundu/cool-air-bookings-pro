import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export async function fetchServices() {
  const { data, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      description,
      price,
      duration_minutes,
      rating,
      review_count,
      image_url,
      category_id,
      is_active
    `)
    .order('id');
    
  if (error) throw error;
  return data;
}

export async function toggleServiceStatus(serviceId: number, isActive: boolean) {
  const { data, error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('id', serviceId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function createService(serviceData: {
  name: string;
  description: string;
  price: number;
  category_id: number;
  duration_minutes: number;
  is_active: boolean;
  image_url?: string;
}) {
  const { data, error } = await supabase
    .from('services')
    .insert(serviceData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateService(
  id: number,
  serviceData: {
    name: string;
    description: string;
    price: number;
    category_id: number;
    duration_minutes: number;
    is_active: boolean;
    image_url?: string;
  }
) {
  const { data, error } = await supabase
    .from('services')
    .update(serviceData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
