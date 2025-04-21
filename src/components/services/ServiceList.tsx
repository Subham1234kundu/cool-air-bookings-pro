
import React from "react";
import { ServiceCard } from "./ServiceCard";

interface ServiceListProps {
  services: {
    id: string;
    name: string;
    price: number;
    duration: string;
    rating: number;
    reviews: number;
    image: string;
    description?: string;
    categoryId: string;
  }[];
  category: string;
  title: string;
}

export const ServiceList: React.FC<ServiceListProps> = ({ services, category, title }) => {
  const filteredServices = category === "all" 
    ? services 
    : services.filter(service => service.categoryId === category);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{title}</h2>
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-lg p-6 text-center border">
          <h3 className="text-lg font-medium text-gray-900">No services found</h3>
          <p className="mt-1 text-gray-500">
            Try selecting a different category or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              id={parseInt(service.id)}
              name={service.name}
              price={service.price}
              description={service.description}
              image={service.image}
              rating={service.rating}
              review_count={service.reviews}
            />
          ))}
        </div>
      )}
    </div>
  );
};
