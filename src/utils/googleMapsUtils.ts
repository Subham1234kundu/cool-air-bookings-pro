
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
          
          // Extract full formatted address
          const formattedAddress = data.results[0]?.formatted_address;

          // Extract detailed address components for more structured data
          let detailedAddress = formattedAddress;
          if (data.results[0]?.address_components) {
            const addressComponents = data.results[0].address_components;
            // Try to construct a more readable address with key components
            const buildingName = addressComponents.find(c => c.types.includes('premise') || c.types.includes('subpremise'))?.long_name;
            const streetNumber = addressComponents.find(c => c.types.includes('street_number'))?.long_name;
            const route = addressComponents.find(c => c.types.includes('route'))?.long_name;
            const locality = addressComponents.find(c => c.types.includes('locality'))?.long_name;
            const sublocality = addressComponents.find(c => c.types.includes('sublocality'))?.long_name;
            const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name;

            // Construct a more detailed address
            const addressParts = [];
            if (buildingName) addressParts.push(buildingName);
            if (streetNumber && route) addressParts.push(`${streetNumber} ${route}`);
            else if (route) addressParts.push(route);
            if (sublocality && sublocality !== locality) addressParts.push(sublocality);
            if (locality) addressParts.push(locality);
            if (postalCode) addressParts.push(postalCode);

            if (addressParts.length > 0) {
              detailedAddress = addressParts.join(', ');
            }
          }
          
          console.log('Detailed address:', detailedAddress);

          resolve({
            latitude,
            longitude,
            address: detailedAddress || formattedAddress
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
