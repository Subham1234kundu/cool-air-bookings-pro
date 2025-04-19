
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
      category_id
    `)
    .order('id');
    
  if (error) throw error;
  return data;
}
