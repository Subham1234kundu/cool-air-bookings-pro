
import React from "react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetClose, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const CartSidebar = () => {
  const { items, removeItem, updateQuantity, totalPrice } = useCart();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <SheetHeader className="px-6 py-6 border-b">
        <SheetTitle className="flex items-center">
          <ShoppingCart className="h-5 w-5 mr-2" />
          Cart
        </SheetTitle>
      </SheetHeader>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-6">
          <div className="bg-muted rounded-full p-6 mb-4">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground text-center mb-6">
            Add services to your cart to book an appointment
          </p>
          <SheetClose asChild>
            <Link to="/services">
              <Button className="w-full bg-brand hover:bg-brand/90">
                Browse Services
              </Button>
            </Link>
          </SheetClose>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{item.name}</h4>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="h-8 w-8"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="h-8 w-8"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="font-semibold">₹{(item.price * item.quantity).toFixed(0)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">₹{totalPrice.toFixed(0)}</span>
            </div>
            <SheetClose asChild>
              <Link to="/checkout">
                <Button className="w-full bg-brand hover:bg-brand/90">
                  View Cart
                </Button>
              </Link>
            </SheetClose>
          </div>
        </>
      )}
    </div>
  );
};
