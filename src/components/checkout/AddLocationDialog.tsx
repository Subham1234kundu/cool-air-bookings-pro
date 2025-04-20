
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

interface AddLocationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { address: string }) => void;
  isLoading: boolean;
}

export const AddLocationDialog = ({ 
  isOpen, 
  onOpenChange, 
  onSubmit,
  isLoading 
}: AddLocationDialogProps) => {
  const { register, handleSubmit, reset } = useForm();

  const handleFormSubmit = (data: any) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
          <DialogDescription>
            Enter the full address for your service location
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label>Full Address</Label>
            <Input 
              {...register('address', { required: 'Address is required' })}
              placeholder="Enter full address" 
            />
          </div>
          
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Location'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
