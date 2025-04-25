import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { PlusCircle, RefreshCw, Search } from "lucide-react";
import { ServiceCard } from "@/components/admin/services/ServiceCard";
import { ServiceFormDialog } from "@/components/admin/services/ServiceFormDialog";
import { CategoryFormDialog } from "@/components/admin/services/CategoryFormDialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchServices, createService, updateService, toggleServiceStatus } from "@/services/supabase/services";
import { fetchCategories, createCategory, updateCategory } from "@/services/supabase/categories";
import { uploadServiceImage } from "@/services/supabase/storage";
import { Tables } from "@/integrations/supabase/types";

const AdminServicesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Tables<'services'> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Tables<'categories'> | null>(null);
  const [editForm, setEditForm] = useState({
    id: 0,
    name: '',
    description: '',
    price: 0,
    categoryId: 1,
    duration: '30',
    isActive: true,
    image: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { 
    data: services = [], 
    isLoading: servicesLoading 
  } = useQuery({
    queryKey: ['admin-services'],
    queryFn: fetchServices
  });
  
  const { 
    data: categories = [], 
    isLoading: categoriesLoading 
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: fetchCategories
  });

  useEffect(() => {
    if (editingService) {
      setEditForm({
        id: editingService.id,
        name: editingService.name || '',
        description: editingService.description || '',
        price: editingService.price || 0,
        categoryId: editingService.category_id || 1,
        duration: editingService.duration_minutes?.toString() || '30',
        isActive: editingService.is_active ?? true,
        image: editingService.image_url || ''
      });
    } else {
      setEditForm({
        id: 0,
        name: '',
        description: '',
        price: 0,
        categoryId: categories[0]?.id || 1,
        duration: '30',
        isActive: true,
        image: ''
      });
    }
  }, [editingService, categories]);

  const createServiceMutation = useMutation({
    mutationFn: createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setIsServiceFormOpen(false);
      toast({
        title: "Service Created",
        description: "The service has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating service:', error);
      toast({
        title: "Error",
        description: "Failed to create service. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateServiceMutation = useMutation({
    mutationFn: (params: { id: number, serviceData: any }) => updateService(params.id, params.serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-services'] });
      setIsServiceFormOpen(false);
      setEditingService(null);
      toast({
        title: "Service Updated",
        description: "The service has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating service:', error);
      toast({
        title: "Error",
        description: "Failed to update service. Please try again.",
        variant: "destructive",
      });
    }
  });

  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsCategoryFormOpen(false);
      toast({
        title: "Category Created",
        description: "The category has been created successfully.",
      });
    },
    onError: (error) => {
      console.error('Error creating category:', error);
      toast({
        title: "Error",
        description: "Failed to create category. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (params: { id: number, categoryData: any }) => updateCategory(params.id, params.categoryData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      toast({
        title: "Category Updated",
        description: "The category has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error('Error updating category:', error);
      toast({
        title: "Error",
        description: "Failed to update category. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleServiceSubmit = async () => {
    queryClient.invalidateQueries({ queryKey: ['admin-services'] });
    setIsServiceFormOpen(false);
    setEditingService(null);
  };

  const handleCategorySubmit = async (data: any) => {
    try {
      if (data.imageFile) {
        const imageUrl = await uploadServiceImage(data.imageFile);
        data.image_url = imageUrl;
      }

      if (editingCategory) {
        updateCategoryMutation.mutate({
          id: editingCategory.id,
          categoryData: {
            name: data.name,
            description: data.description,
            image_url: data.image_url || editingCategory.image_url,
            is_active: true
          }
        });
      } else {
        createCategoryMutation.mutate({
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          is_active: true
        });
      }
    } catch (error) {
      console.error("Error processing category form:", error);
      toast({
        title: "Error",
        description: "There was an error processing your request.",
        variant: "destructive",
      });
    }
  };

  const handleEditService = (service: Tables<'services'>) => {
    setEditingService(service);
    setIsServiceFormOpen(true);
  };

  const handleEditCategory = (category: Tables<'categories'>) => {
    setEditingCategory(category);
    setIsCategoryFormOpen(true);
  };
  
  const handleDeleteService = (serviceId: number) => {
    console.log("Delete service:", serviceId);
  };

  const filteredServices = services.filter((service) => 
    service.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Services</h1>
        <p className="text-muted-foreground">
          Create and manage your service offerings
        </p>
      </div>

      <Tabs defaultValue="services">
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => {
              setEditingService(null);
              setIsServiceFormOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>

          {servicesLoading ? (
            <div className="text-center py-8">
              <RefreshCw className="animate-spin h-8 w-8 mx-auto text-muted-foreground" />
              <p className="mt-2">Loading services...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  categories={categories}
                  onEdit={() => handleEditService(service)}
                  onDelete={handleDeleteService}
                />
              ))}
              {filteredServices.length === 0 && (
                <div className="col-span-3 text-center py-8">
                  <p className="text-muted-foreground">No services found</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categories</h2>
            <Button onClick={() => {
              setEditingCategory(null);
              setIsCategoryFormOpen(true);
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Services</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoriesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      <RefreshCw className="animate-spin h-6 w-6 mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name || "Unnamed Category"}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>
                        {services.filter((s) => s.category_id === category.id).length}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <ServiceFormDialog
        isOpen={isServiceFormOpen}
        onClose={() => {
          setIsServiceFormOpen(false);
          setEditingService(null);
        }}
        onSave={handleServiceSubmit}
        categories={categories}
        selectedService={editingService}
        editForm={editForm}
        setEditForm={setEditForm}
      />

      <CategoryFormDialog
        isOpen={isCategoryFormOpen}
        onClose={() => {
          setIsCategoryFormOpen(false);
          setEditingCategory(null);
        }}
        onSave={handleCategorySubmit}
        newCategory={{
          id: editingCategory?.id,
          name: editingCategory?.name || '',
          description: editingCategory?.description || '',
          image_url: editingCategory?.image_url || '',
          isActive: true
        }}
        setNewCategory={setEditingCategory}
      />
    </div>
  );
};

export default AdminServicesPage;
