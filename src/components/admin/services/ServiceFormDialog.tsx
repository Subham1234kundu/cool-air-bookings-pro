
import React, { useState, useEffect } from 'react';
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
import { supabase } from "@/integrations/supabase/client";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize the form properly when the dialog opens or the selected service changes
  useEffect(() => {
    if (selectedService) {
      setImagePreview(selectedService.image_url || null);
    } else {
      setImagePreview(null);
    }
  }, [selectedService, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `services/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('service-images')
        .upload(filePath, file);
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data } = supabase.storage
        .from('service-images')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      let imageUrl = editForm.image;
      
      // Upload image if there's a new file
      if (imageFile) {
        const uploadedUrl = await uploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          toast({
            title: "Warning",
            description: "Failed to upload image, but continuing with service save.",
            variant: "destructive"
          });
        }
      }
      
      const serviceData = {
        name: editForm.name,
        description: editForm.description,
        price: editForm.price,
        category_id: editForm.categoryId,
        duration_minutes: parseInt(editForm.duration),
        is_active: editForm.isActive,
        image_url: imageUrl
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
    } finally {
      setIsLoading(false);
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
              value={editForm.categoryId?.toString() || ""} 
              onValueChange={(value) => setEditForm({...editForm, categoryId: parseInt(value)})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories && categories.map(category => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name || "Unnamed Category"}
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
              onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})} 
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
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="image" className="col-span-1 pt-2">Image</Label>
            <div className="col-span-3 space-y-2">
              <Input 
                id="image" 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {(imagePreview || editForm.image) && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <img 
                    src={imagePreview || editForm.image} 
                    alt="Service preview" 
                    className="w-full max-w-[200px] h-auto rounded-md border"
                  />
                </div>
              )}
            </div>
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
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : selectedService ? 'Update' : 'Add'} Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
