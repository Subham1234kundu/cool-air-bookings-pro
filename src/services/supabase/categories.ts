import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('id');
    
  if (error) throw error;
  return data;
}

export async function createCategory(categoryData: {
  name: string;
  description?: string;
  image_url?: string;
}) {
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryData)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: number,
  categoryData: {
    name: string;
    description?: string;
    image_url?: string;
  }
) {
  const { data, error } = await supabase
    .from('categories')
    .update(categoryData)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
