
import { supabase } from "@/integrations/supabase/client";

/**
 * Create service-images bucket if it doesn't exist
 */
export async function ensureServiceImagesBucket() {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucket = buckets?.find(b => b.name === 'service-images');
    
    if (!bucket) {
      const { data, error } = await supabase.storage.createBucket('service-images', {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
      });
      
      if (error) {
        console.error('Error creating service-images bucket:', error);
        throw error;
      }
      
      console.log('Created service-images bucket:', data);
      
      // Set public policy for the bucket
      const { error: policyError } = await supabase.storage.from('service-images').updateBucket({
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/gif', 'image/webp']
      });
      
      if (policyError) {
        console.error('Error setting bucket permissions:', policyError);
      }
    }
    return true;
  } catch (error) {
    console.error('Error in ensureServiceImagesBucket:', error);
    return false;
  }
}

/**
 * Upload an image to the service-images bucket
 */
export async function uploadServiceImage(file: File) {
  // Ensure the bucket exists
  try {
    await ensureServiceImagesBucket();
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;
    
    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(filePath, file);
      
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('service-images')
      .getPublicUrl(filePath);
      
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}
