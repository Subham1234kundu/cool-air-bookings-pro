import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tables } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { createService, updateService } from "@/services/supabase/services";

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editForm: {
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    duration: string;
    isActive: boolean;
    image: string;
  };
  setEditForm: React.Dispatch<React.SetStateAction<{
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    duration: string;
    isActive: boolean;
    image: string;
  }>>;
  categories: Tables<'categories'>[];
  selectedService: Tables<'services'> | null;
}

export const ServiceFormDialog: React.FC<ServiceFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editForm,
  setEditForm,
  categories,
  selectedService
}) => {
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      const serviceData = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        category_id: editForm.categoryId,
        duration_minutes: parseInt(editForm.duration),
        is_active: editForm.isActive,
        image_url: editForm.image
      };

      if (selectedService) {
        await updateService(selectedService.id, serviceData);
        toast({
          title: "Service Updated",
          description: "The service has been updated successfully."
        });
      } else {
        await createService(serviceData);
        toast({
          title: "Service Created",
          description: "The new service has been created successfully."
        });
      }

      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save service. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{selectedService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="col-span-1">Name</Label>
            <Input 
              id="name" 
              value={editForm.name} 
              onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="col-span-1">Category</Label>
            <Select 
              value={editForm.categoryId.toString()} 
              onValueChange={(value) => setEditForm({...editForm, categoryId: parseInt(value)})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="col-span-1">Price (₹)</Label>
            <Input 
              id="price" 
              type="number" 
              value={editForm.price} 
              onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value)})} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="col-span-1">Duration (min)</Label>
            <Input 
              id="duration" 
              value={editForm.duration} 
              onChange={(e) => setEditForm({...editForm, duration: e.target.value})} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="col-span-1 pt-2">Description</Label>
            <Textarea 
              id="description" 
              value={editForm.description} 
              onChange={(e) => setEditForm({...editForm, description: e.target.value})} 
              className="col-span-3" 
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="col-span-1">Image</Label>
            <Input 
              id="image" 
              type="file" 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isActive" className="col-span-1">Active</Label>
            <div className="col-span-3 flex items-center">
              <Switch 
                id="isActive" 
                checked={editForm.isActive} 
                onCheckedChange={(checked) => setEditForm({...editForm, isActive: checked})} 
              />
              <span className="ml-2 text-sm text-muted-foreground">
                {editForm.isActive ? 'Service is visible to customers' : 'Service is hidden'}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {selectedService ? 'Update' : 'Add'} Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
