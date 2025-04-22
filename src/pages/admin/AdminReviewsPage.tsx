
import React, { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, Eye, EyeOff, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const fetchReviews = async () => {
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      services (name)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return reviews;
};

const AdminReviewsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [adminResponse, setAdminResponse] = useState('');
  const { toast } = useToast();

  const { data: reviews = [], isLoading, error } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: fetchReviews,
    refetchInterval: 5000 // Real-time update every 5 seconds
  });

  const toggleApprovalMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('is_approved')
        .eq('id', reviewId)
        .single();

      const { error } = await supabase
        .from('reviews')
        .update({ is_approved: !existingReview.is_approved })
        .eq('id', reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: "Review Status Updated" });
    },
    onError: (error) => {
      toast({ 
        title: "Update Failed", 
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const saveResponseMutation = useMutation({
    mutationFn: async ({ reviewId, response }: { reviewId: number, response: string }) => {
      const { error } = await supabase
        .from('reviews')
        .update({ admin_response: response })
        .eq('id', reviewId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
      toast({ title: "Response Saved" });
      setSelectedReview(null);
    },
    onError: (error) => {
      toast({ 
        title: "Save Failed", 
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive" 
      });
    }
  });

  const handleToggleApproval = (reviewId: number) => {
    toggleApprovalMutation.mutate(reviewId);
  };

  const handleViewReview = (review: any) => {
    setSelectedReview(review);
    setAdminResponse(review.admin_response || '');
  };
  
  const handleSaveResponse = () => {
    if (selectedReview) {
      saveResponseMutation.mutate({ 
        reviewId: selectedReview.id, 
        response: adminResponse 
      });
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  // Filter reviews based on search and filter criteria
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.services?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'approved' && review.is_approved) ||
      (statusFilter === 'pending' && !review.is_approved);
    
    const matchesRating = 
      ratingFilter === 'all' || 
      review.rating === parseInt(ratingFilter);
    
    return matchesSearch && matchesStatus && matchesRating;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reviews</h1>
        <p className="text-muted-foreground">Manage and moderate customer reviews</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center flex-wrap">
        <Input 
          placeholder="Search reviews..." 
          className="max-w-xs" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map(review => (
          <Card key={review.id} className={!review.is_approved ? 'border-dashed border-gray-300' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <div>
                  <div className="flex gap-1 mb-1">
                    {renderStars(review.rating)}
                  </div>
                  <CardTitle className="text-lg">{review.services?.name}</CardTitle>
                </div>
                {!review.is_approved && (
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded h-fit">
                    Pending Approval
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex flex-col gap-1">
                {/* <div className="flex justify-between items-center mb-1">
                  <span className="font-medium">{review.userName}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div> */}
                <p className="text-sm line-clamp-3">{review.comment}</p>
                
                {review.admin_response && (
                  <div className="mt-3 bg-slate-50 p-2 rounded-md">
                    <p className="text-xs font-medium">Response:</p>
                    <p className="text-xs line-clamp-2">{review.admin_response}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex justify-between w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleViewReview(review)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {review.admin_response ? 'Edit Response' : 'Respond'}
                </Button>
                
                <Button 
                  variant={review.is_approved ? 'ghost' : 'outline'} 
                  size="sm" 
                  onClick={() => handleToggleApproval(review.id)}
                >
                  {review.is_approved ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1 text-red-500" />
                      <span className="text-red-500">Hide</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1 text-green-600" />
                      <span className="text-green-600">Approve</span>
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {filteredReviews.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-40 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-500">No reviews match your search criteria</p>
          </div>
        )}
      </div>
      
      {/* Review Response Dialog */}
      {selectedReview && (
        <Dialog open={!!selectedReview} onOpenChange={(open) => !open && setSelectedReview(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Review Response</DialogTitle>
              <DialogDescription>
                Respond to customer review for {selectedReview.services?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <div className="bg-slate-50 p-3 rounded-md">
                <div className="flex gap-1 mb-2">
                  {renderStars(selectedReview.rating)}
                </div>
                {/* <p className="text-sm font-medium mb-1">{selectedReview.userName}</p> */}
                <p className="text-sm">{selectedReview.comment}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(selectedReview.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium">Your Response:</label>
                <Textarea 
                  value={adminResponse} 
                  onChange={(e) => setAdminResponse(e.target.value)} 
                  placeholder="Type your response to this review..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedReview(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveResponse}>
                Save Response
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AdminReviewsPage;
