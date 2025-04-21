
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useCart } from '@/context/CartContext';

interface ServiceCardProps {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  review_count?: number;
}

export const ServiceCard = ({
  id,
  name,
  description,
  price,
  image,
  rating = 0,
  review_count = 0,
}: ServiceCardProps) => {
  const { addToCart, items } = useCart();
  
  const isInCart = items.some(item => item.id === id);
  
  const handleAddToCart = () => {
    addToCart({
      id,
      name,
      price,
      quantity: 1,
    });
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img
          src={image || "/placeholder.svg"}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader className="pb-2">
        <CardTitle>{name}</CardTitle>
        {rating > 0 && (
          <div className="flex items-center mt-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="ml-1 text-sm font-medium">{rating}</span>
            <span className="text-xs text-gray-500 ml-1">({review_count} reviews)</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="font-semibold">₹{price.toFixed(0)}</div>
        <Button 
          onClick={handleAddToCart} 
          disabled={isInCart}
          className="bg-brand hover:bg-brand/90"
          size="sm"
        >
          {isInCart ? "Added" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};
