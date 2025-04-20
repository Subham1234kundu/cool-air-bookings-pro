
import { supabase } from "@/integrations/supabase/client";

export const saveUserLocation = async (location: {
  latitude: number, 
  longitude: number, 
  formatted_address?: string
}) => {
  const { data: userData } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('user_locations')
    .insert({
      user_id: userData.user?.id,
      latitude: location.latitude,
      longitude: location.longitude,
      formatted_address: location.formatted_address,
      is_default: true
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving location:', error);
    throw error;
  }
  
  return data;
};

export const getCurrentLocation = (): Promise<{
  latitude: number, 
  longitude: number, 
  formatted_address?: string
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Reverse geocoding to get formatted address
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();
          const formatted_address = data.results[0]?.formatted_address;
          
          resolve({ 
            latitude, 
            longitude, 
            formatted_address 
          });
        } catch (error) {
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        reject(error);
      }
    );
  });
};
