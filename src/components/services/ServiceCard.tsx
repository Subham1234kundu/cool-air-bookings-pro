
import React from "react";
import { Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { ServiceItem } from "@/context/CartContext";

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    price: number;
    duration: string;
    rating: number;
    reviews: number;
    image: string;
    description?: string;
  };
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { addItem } = useCart();

  const handleAddToCart = () => {
    const item: ServiceItem = {
      id: service.id,
      name: service.name,
      price: service.price,
      quantity: 1,
    };
    addItem(item);
  };

  return (
    <div className="flex flex-col md:flex-row border rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center mb-2">
          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium ml-1">{service.rating}</span>
          <span className="text-sm text-gray-500 ml-1">({service.reviews} reviews)</span>
        </div>
        
        <h3 className="font-semibold text-lg">{service.name}</h3>
        
        <div className="flex items-center mt-1 text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1" />
          <span>{service.duration}</span>
        </div>
        
        {service.description && (
          <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.description}</p>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-lg font-semibold">₹{service.price}</p>
          </div>
          <Button 
            onClick={handleAddToCart} 
            size="sm" 
            className="bg-brand hover:bg-brand/90 text-white"
          >
            Add
          </Button>
        </div>
      </div>
      
      <div className="h-40 md:h-auto md:w-48">
        <img 
          src={service.image} 
          alt={service.name} 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};
