
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  newCategory: {
    id?: number;
    name: string;
    description?: string;
    image_url?: string;
  };
  setNewCategory: React.Dispatch<React.SetStateAction<any>>;
}

export const CategoryFormDialog: React.FC<CategoryFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  newCategory,
  setNewCategory
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Reset state when dialog opens/closes or category changes
  useEffect(() => {
    setImagePreview(newCategory.image_url || null);
    setImageFile(null);
  }, [isOpen, newCategory.image_url]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      const name = formData.get('name') as string;
      const description = formData.get('description') as string;

      const data = {
        name: name,
        description: description,
        imageFile: imageFile,
      };

      onSave(data);
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error("Error submitting category form:", error);
      toast({
        title: "Error",
        description: "There was an error saving the category.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{newCategory.id ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="col-span-1">Name</Label>
            <Input
              id="name"
              name="name"
              defaultValue={newCategory.name}
              className="col-span-3"
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="col-span-1 pt-2">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={newCategory.description}
              className="col-span-3"
              rows={3}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
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
              {(imagePreview || newCategory.image_url) && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <img
                    src={imagePreview || newCategory.image_url}
                    alt="Category preview"
                    className="w-full max-w-[200px] h-auto rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : newCategory.id ? 'Update' : 'Add'} Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
