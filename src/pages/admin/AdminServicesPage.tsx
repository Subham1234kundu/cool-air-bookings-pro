
import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ServiceCard } from "@/components/admin/services/ServiceCard";
import { ServiceFormDialog } from "@/components/admin/services/ServiceFormDialog";
import { CategoryFormDialog } from "@/components/admin/services/CategoryFormDialog";
import { Tables } from "@/integrations/supabase/types";

const fetchServicesAndCategories = async () => {
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('*');

  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('*');

  if (servicesError || categoriesError) {
    throw new Error(servicesError?.message || categoriesError?.message);
  }

  return { services, categories };
};

const AdminServicesPage = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedService, setSelectedService] = useState<Tables<'services'> | null>(null);
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
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['services-and-categories'],
    queryFn: fetchServicesAndCategories,
    refetchInterval: 5000
  });

  const services = data?.services || [];
  const categories = data?.categories || [];
  
  const deleteServiceMutation = useMutation({
    mutationFn: async (serviceId: number) => {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services-and-categories'] });
      toast({
        title: "Service Deleted",
        description: "Service removed successfully"
      });
    },
    onError: (error) => {
      toast({ 
        title: "Delete Failed", 
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const filteredServices = services.filter(service => 
    activeTab === 'all' || 
    service.category_id === parseInt(activeTab)
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
  
  const handleEditService = (service: Tables<'services'>) => {
    setSelectedService(service);
    setEditForm({
      ...service,
      categoryId: service.category_id || 1,
      isActive: service.is_active || true,
      duration: service.duration_minutes?.toString() || ''
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
    deleteServiceMutation.mutate(serviceId);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading services...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading services: {error instanceof Error ? error.message : "Unknown error"}</div>;
  }

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
                <ServiceCard
                  key={service.id}
                  service={service}
                  categories={categories}
                  onEdit={handleEditService}
                  onDelete={handleDeleteService}
                />
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
      
      <ServiceFormDialog
        isOpen={isAddingService || !!selectedService}
        onClose={() => {
          setIsAddingService(false);
          setSelectedService(null);
        }}
        onSave={handleSaveService}
        editForm={editForm}
        setEditForm={setEditForm}
        categories={categories}
        selectedService={selectedService}
      />
      
      <CategoryFormDialog
        isOpen={isAddingCategory}
        onClose={() => setIsAddingCategory(false)}
        onSave={handleSaveCategory}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
      />
    </div>
  );
};

export default AdminServicesPage;
