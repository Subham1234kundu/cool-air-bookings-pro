
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

interface ServiceCardProps {
  service: Tables<'services'>;
  categories: Tables<'categories'>[];
  onEdit: (service: Tables<'services'>) => void;
  onDelete: (serviceId: number) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  categories,
  onEdit,
  onDelete,
}) => {
  return (
    <Card className={!service.is_active ? 'opacity-60' : ''}>
      <CardContent className="p-0">
        <div className="relative">
          <img 
            src={service.image_url || '/placeholder.svg'} 
            alt={service.name}
            className="w-full h-48 object-cover"
          />
          {!service.is_active && (
            <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
              Inactive
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className="text-lg font-semibold text-white">{service.name}</h3>
            <p className="text-sm text-white/80">₹{service.price} • {service.duration_minutes} min</p>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm line-clamp-2">{service.description}</p>
          <div className="flex justify-between items-center mt-4">
            <span className="text-xs bg-slate-100 px-2 py-1 rounded">
              {categories.find(c => c.id === service.category_id)?.name}
            </span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => onEdit(service)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(service.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
