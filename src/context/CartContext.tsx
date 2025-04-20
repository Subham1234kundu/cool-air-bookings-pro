
import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserCart, addToCart, removeFromCart, updateCartQuantity } from "@/services/supabase/cart";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/components/ui/use-toast";

// Types
export type ServiceItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  category?: string;
  image?: string;
};

type CartContextType = {
  items: ServiceItem[];
  addItem: (item: ServiceItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const { data: cartItems = [], isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: fetchUserCart,
    enabled: !!session,
  });

  const addItemMutation = useMutation({
    mutationFn: ({ serviceId, quantity }: { serviceId: number, quantity: number }) =>
      addToCart(serviceId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Item added to cart",
        description: "Your cart has been updated.",
      });
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Item removed from cart",
        description: "Your cart has been updated.",
      });
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ serviceId, quantity }: { serviceId: number, quantity: number }) =>
      updateCartQuantity(serviceId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  const items = cartItems.map(item => ({
    id: item.service_id,
    name: item.service.name,
    price: item.service.price,
    quantity: item.quantity,
    image: item.service.image_url,
  }));

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalPrice = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const addItem = (item: ServiceItem) => {
    if (!session) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }
    addItemMutation.mutate({ serviceId: item.id, quantity: item.quantity });
  };

  const removeItem = (id: number) => {
    removeItemMutation.mutate(id);
  };

  const updateQuantity = (id: number, quantity: number) => {
    updateQuantityMutation.mutate({ serviceId: id, quantity });
  };

  const clearCart = () => {
    items.forEach(item => removeItem(item.id));
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      totalItems,
      totalPrice,
      isLoading,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
