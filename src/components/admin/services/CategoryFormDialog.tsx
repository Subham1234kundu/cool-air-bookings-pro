
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tables } from "@/integrations/supabase/types";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  newCategory: {
    id?: number;
    name: string;
    description?: string;
    image_url?: string;
    isActive: boolean;
  };
  setNewCategory: React.Dispatch<React.SetStateAction<any>>;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  newCategory,
  setNewCategory,
}) => {
  const { toast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (newCategory?.image_url) {
      setImagePreview(newCategory.image_url);
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
  }, [newCategory?.image_url]);

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

  const handleSubmit = () => {
    const formData = {
      name: newCategory.name,
      description: newCategory.description || "",
      imageFile: imageFile,
      image_url: newCategory.image_url
    };
    
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{newCategory.id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryName" className="col-span-1">Name</Label>
            <Input 
              id="categoryName" 
              value={newCategory.name} 
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})} 
              className="col-span-3" 
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryDescription" className="col-span-1">Description</Label>
            <Input 
              id="categoryDescription" 
              value={newCategory.description || ''} 
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})} 
              className="col-span-3" 
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="categoryImage" className="col-span-1 pt-2">Image</Label>
            <div className="col-span-3 space-y-2">
              <Input 
                id="categoryImage" 
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <img 
                    src={imagePreview} 
                    alt="Category preview" 
                    className="w-full max-w-[200px] h-auto rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="categoryIsActive" className="col-span-1">Active</Label>
            <div className="col-span-3 flex items-center">
              <Switch 
                id="categoryIsActive" 
                checked={newCategory.isActive} 
                onCheckedChange={(checked) => setNewCategory({...newCategory, isActive: checked})} 
              />
              <span className="ml-2 text-sm text-muted-foreground">
                {newCategory.isActive ? 'Category is visible to customers' : 'Category is hidden'}
              </span>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {newCategory.id ? 'Update' : 'Add'} Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const useState = React.useState;
