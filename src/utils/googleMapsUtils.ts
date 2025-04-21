
import { supabase } from "@/integrations/supabase/client";

export const saveUserLocation = async (location: {
  latitude: number,
  longitude: number,
  address?: string | null
}) => {
  const { data: userData } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('user_locations')
    .insert({
      user_id: userData.user?.id,
      latitude: location.latitude,
      longitude: location.longitude,
      address: location.address ?? '',
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
  address?: string
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Retrieved coordinates:', latitude, longitude);

        // Reverse geocoding to get formatted address
        try {
          const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
          console.log('Using API Key:', apiKey ? 'Available' : 'Not available');
          
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
          );
          
          const data = await response.json();
          console.log('Geocoding response:', data);
          
          const address = data.results[0]?.formatted_address;
          console.log('Formatted address:', address);

          resolve({
            latitude,
            longitude,
            address
          });
        } catch (error) {
          console.error('Geocoding error:', error);
          // Still resolve with coordinates if geocoding fails
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      }
    );
  });
};
