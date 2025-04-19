
import React, { useState } from 'react';
import { PlusCircle, Pencil, Trash2, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

// Mock data - replace with actual data fetching when connected to Supabase
const categories = [
  { id: 1, name: 'Repair', isActive: true },
  { id: 2, name: 'Installation', isActive: true },
  { id: 3, name: 'Maintenance', isActive: true },
  { id: 4, name: 'Cleaning', isActive: true }
];

const services = [
  { 
    id: 1, 
    name: 'Basic AC Repair', 
    description: 'Diagnostic and basic repairs for your AC unit', 
    price: 1500, 
    categoryId: 1, 
    duration: '60', 
    isActive: true,
    image: '/placeholder.svg'
  },
  { 
    id: 2, 
    name: 'Advanced AC Repair', 
    description: 'Comprehensive repairs for complex AC problems', 
    price: 2500, 
    categoryId: 1, 
    duration: '120', 
    isActive: true,
    image: '/placeholder.svg'
  },
  { 
    id: 3, 
    name: 'AC Installation', 
    description: 'Professional installation of new AC units', 
    price: 3000, 
    categoryId: 2, 
    duration: '180', 
    isActive: true,
    image: '/placeholder.svg'
  },
  { 
    id: 4, 
    name: 'Regular Maintenance', 
    description: 'Routine check and maintenance of your AC', 
    price: 1200, 
    categoryId: 3, 
    duration: '90', 
    isActive: true,
    image: '/placeholder.svg'
  },
  { 
    id: 5, 
    name: 'Deep Cleaning', 
    description: 'Thorough cleaning of all AC components', 
    price: 1800, 
    categoryId: 4, 
    duration: '120', 
    isActive: true,
    image: '/placeholder.svg'
  },
  { 
    id: 6, 
    name: 'Emergency Repair', 
    description: 'Urgent repair service for AC breakdowns', 
    price: 3000, 
    categoryId: 1, 
    duration: '90', 
    isActive: false,
    image: '/placeholder.svg'
  }
];

const AdminServicesPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', isActive: true });
  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    duration: '',
    isActive: true,
    image: '/placeholder.svg'
  });
  
  // Filter services by category
  const filteredServices = services.filter(service => 
    activeTab === 'all' || 
    service.categoryId === parseInt(activeTab)
  );
  
  const handleAddService = () => {
    setIsAddingService(true);
    setEditForm({
      id: 0,
      name: '',
      description: '',
      price: 0,
      categoryId: 1,
      duration: '',
      isActive: true,
      image: '/placeholder.svg'
    });
  };
  
  const handleEditService = (service: any) => {
    setSelectedService(service);
    setEditForm({
      ...service
    });
  };
  
  const handleSaveService = () => {
    // This would save to Supabase in a real implementation
    console.log('Saving service:', editForm);
    
    // Close the dialog
    if (selectedService) {
      setSelectedService(null);
    } else {
      setIsAddingService(false);
    }
  };
  
  const handleSaveCategory = () => {
    // This would save to Supabase in a real implementation
    console.log('Saving category:', newCategory);
    
    // Close the dialog
    setIsAddingCategory(false);
  };
  
  const handleDeleteService = (serviceId: number) => {
    // This would delete from Supabase in a real implementation
    console.log('Deleting service ID:', serviceId);
    
    // For demo purposes, we'd update UI state here
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Services</h1>
        <p className="text-muted-foreground">Manage service offerings and categories</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <Tabs 
          onValueChange={setActiveTab} 
          value={activeTab} 
          className="w-full"
        >
          <div className="flex justify-between items-center">
            <TabsList className="grid grid-flow-col auto-cols-max gap-2">
              <TabsTrigger value="all">All Services</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id.toString()}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsAddingCategory(true)}
              >
                Add Category
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddService}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          </div>
          
          <TabsContent value={activeTab} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map(service => (
                <Card key={service.id} className={!service.isActive ? 'opacity-60' : ''}>
                  <CardContent className="p-0">
                    <div className="relative">
                      <img 
                        src={service.image} 
                        alt={service.name}
                        className="w-full h-48 object-cover"
                      />
                      {!service.isActive && (
                        <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded">
                          Inactive
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                        <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                        <p className="text-sm text-white/80">₹{service.price} • {service.duration} min</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm line-clamp-2">{service.description}</p>
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-xs bg-slate-100 px-2 py-1 rounded">
                          {categories.find(c => c.id === service.categoryId)?.name}
                        </span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEditService(service)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteService(service.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredServices.length === 0 && (
                <div className="col-span-full flex items-center justify-center h-40 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-slate-500 mb-4">No services found in this category</p>
                    <Button size="sm" onClick={handleAddService}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Service
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add/Edit Service Dialog */}
      <Dialog 
        open={isAddingService || !!selectedService} 
        onOpenChange={(open) => {
          if (!open) {
            setIsAddingService(false);
            setSelectedService(null);
          }
        }}
      >
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
            <Button variant="outline" onClick={() => {
              setIsAddingService(false);
              setSelectedService(null);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveService}>
              {selectedService ? 'Update' : 'Add'} Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Category Dialog */}
      <Dialog 
        open={isAddingCategory} 
        onOpenChange={(open) => {
          if (!open) setIsAddingCategory(false);
        }}
      >
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
            <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCategory}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminServicesPage;
