
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  newCategory: {
    name: string;
    isActive: boolean;
  };
  setNewCategory: React.Dispatch<React.SetStateAction<{
    name: string;
    isActive: boolean;
  }>>;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  newCategory,
  setNewCategory,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
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
          <Button onClick={onSave}>
            Add Category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
