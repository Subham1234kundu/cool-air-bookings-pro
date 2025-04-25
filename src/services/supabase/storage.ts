
import { supabase } from "@/integrations/supabase/client";

/**
 * Create service-images bucket if it doesn't exist
 */
export async function ensureServiceImagesBucket() {
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
    
    // Add public policy to the bucket
    const { error: policyError } = await supabase.storage.from('service-images').createBucketWithPermissions({
      permissions: {
        read: 'public',
        write: 'service_role'
      }
    });
    
    if (policyError) {
      console.error('Error setting bucket permissions:', policyError);
    }
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
