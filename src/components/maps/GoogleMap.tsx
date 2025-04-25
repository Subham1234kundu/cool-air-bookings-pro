
import React, { useEffect, useRef, useState } from 'react';

interface GoogleMapProps {
  location: { latitude: number; longitude: number } | null;
  onLocationSelect?: (latitude: number, longitude: number, address: string) => void;
  height?: string;
  readOnly?: boolean;
}

export const GoogleMap = ({ 
  location, 
  onLocationSelect, 
  height = '100%',
  readOnly = false
}: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Load Google Maps script
    if (!window.google && googleMapsApiKey) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
      };
    } else if (window.google) {
      initializeMap();
    }
  }, []);

  useEffect(() => {
    if (map && location) {
      // Clear any previous markers
      if (marker) {
        marker.setMap(null);
      }

      const position = new google.maps.LatLng(location.latitude, location.longitude);
      map.setCenter(position);
      map.setZoom(15); // Set an appropriate zoom level
      
      // Create a new marker
      const newMarker = new google.maps.Marker({
        position,
        map,
        draggable: !readOnly,
        animation: google.maps.Animation.DROP
      });
      setMarker(newMarker);

      if (!readOnly && onLocationSelect) {
        newMarker.addListener('dragend', handleMarkerDragEnd);
      }
    }
  }, [map, location]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const defaultLocation = location || { latitude: 28.6139, longitude: 77.2090 }; // Default to Delhi, India
    const mapOptions = {
      center: { 
        lat: defaultLocation.latitude, 
        lng: defaultLocation.longitude 
      },
      zoom: 15,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true
    };

    const newMap = new google.maps.Map(mapRef.current, mapOptions);
    setMap(newMap);

    if (!readOnly) {
      newMap.addListener('click', handleMapClick);
    }
  };

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    if (!map || !onLocationSelect || readOnly) return;

    const lat = event.latLng?.lat();
    const lng = event.latLng?.lng();
    
    if (lat === undefined || lng === undefined) return;

    // Update marker
    if (marker) {
      marker.setPosition({ lat, lng });
    } else {
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map,
        draggable: true
      });
      newMarker.addListener('dragend', handleMarkerDragEnd);
      setMarker(newMarker);
    }

    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  const handleMarkerDragEnd = () => {
    if (!marker || !onLocationSelect || readOnly) return;
    
    const position = marker.getPosition();
    if (!position) return;
    
    const lat = position.lat();
    const lng = position.lng();
    
    // Reverse geocode to get address
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!onLocationSelect || !window.google) return;
    
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const address = results[0].formatted_address;
          
          // Extract detailed components if possible
          let detailedAddress = address;
          const addressComponents = results[0].address_components;
          if (addressComponents) {
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
          
          onLocationSelect(lat, lng, detailedAddress);
        } else {
          onLocationSelect(lat, lng, "Unknown location");
        }
      }
    );
  };

  return (
    <div 
      ref={mapRef}
      style={{ width: '100%', height: height }}
      className="rounded-md"
    />
  );
};
