/**
 * New Post Flow Component
 * Step-by-step workflow for creating new posts with AI assistance
 * 
 * @version 1.0.0
 * @date 2025-01-08
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useNewPostFlowStore, type GarageFilters } from '@/lib/stores/new-post-flow.store';
import {
  Search,
  Plus,
  Sparkles,
  Image,
  FileText,
  Download,
  Share,
  Archive,
  Trash2,
  Edit,
  Check,
  ArrowRight,
  ArrowLeft,
  Filter,
  SortAsc,
  Eye,
  Heart,
  Star,
  Zap,
  Target,
  BarChart3,
  Camera,
  Upload,
  Save,
  RefreshCw,
  Settings,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  DollarSign,
  Users,
  Globe,
  Smartphone,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ShoppingBag,
  Store,
  Package,
  ShoppingCart,
  Truck,
  Home,
  MapPin,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

// Types
interface PostItem {
  id: string;
  name: string;
  description: string;
  category: string;
  condition: string;
  price: number;
  images: string[];
  platforms: string[];
  status: 'draft' | 'active' | 'sold' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  research?: {
    marketAnalysis: any;
    pricingStrategy: any;
    sellingStrategy: any;
  };
  content?: {
    title: string;
    description: string;
    hashtags: string[];
  };
}

interface Platform {
  id: string;
  name: string;
  displayName: string;
  icon: React.ReactNode;
  description: string;
  category: 'social' | 'marketplace' | 'classified';
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  price: number;
  platform: string;
  image: string;
  url: string;
  analysis: {
    demand: 'high' | 'medium' | 'low';
    competition: 'high' | 'medium' | 'low';
    pricing: 'above' | 'at' | 'below';
  };
}

// Available platforms
const platforms: Platform[] = [
  { id: 'facebook', name: 'Facebook', displayName: 'Facebook', icon: <Facebook className="h-4 w-4" />, description: 'Social media platform', category: 'social' },
  { id: 'instagram', name: 'Instagram', displayName: 'Instagram', icon: <Instagram className="h-4 w-4" />, description: 'Visual social platform', category: 'social' },
  { id: 'twitter', name: 'Twitter', displayName: 'Twitter', icon: <Twitter className="h-4 w-4" />, description: 'Micro-blogging platform', category: 'social' },
  { id: 'linkedin', name: 'LinkedIn', displayName: 'LinkedIn', icon: <Linkedin className="h-4 w-4" />, description: 'Professional network', category: 'social' },
  { id: 'youtube', name: 'YouTube', displayName: 'YouTube', icon: <Youtube className="h-4 w-4" />, description: 'Video platform', category: 'social' },
  { id: 'tiktok', name: 'TikTok', displayName: 'TikTok', icon: <ShoppingBag className="h-4 w-4" />, description: 'Short video platform', category: 'social' },
  { id: 'pinterest', name: 'Pinterest', displayName: 'Pinterest', icon: <Store className="h-4 w-4" />, description: 'Visual discovery platform', category: 'social' },
  { id: 'ebay', name: 'eBay', displayName: 'eBay', icon: <Package className="h-4 w-4" />, description: 'Online marketplace', category: 'marketplace' },
  { id: 'amazon', name: 'Amazon', displayName: 'Amazon', icon: <ShoppingCart className="h-4 w-4" />, description: 'E-commerce platform', category: 'marketplace' },
  { id: 'mercari', name: 'Mercari', displayName: 'Mercari', icon: <Truck className="h-4 w-4" />, description: 'Mobile marketplace', category: 'marketplace' },
  { id: 'poshmark', name: 'Poshmark', displayName: 'Poshmark', icon: <Store className="h-4 w-4" />, description: 'Fashion marketplace', category: 'marketplace' },
  { id: 'depop', name: 'Depop', displayName: 'Depop', icon: <ShoppingBag className="h-4 w-4" />, description: 'Fashion marketplace', category: 'marketplace' },
  { id: 'vinted', name: 'Vinted', displayName: 'Vinted', icon: <Package className="h-4 w-4" />, description: 'Second-hand marketplace', category: 'marketplace' },
  { id: 'offerup', name: 'OfferUp', displayName: 'OfferUp', icon: <Truck className="h-4 w-4" />, description: 'Local marketplace', category: 'marketplace' },
  { id: 'facebook-marketplace', name: 'Facebook Marketplace', displayName: 'Facebook Marketplace', icon: <Home className="h-4 w-4" />, description: 'Local marketplace', category: 'marketplace' },
  { id: 'craigslist', name: 'Craigslist', displayName: 'Craigslist', icon: <MapPin className="h-4 w-4" />, description: 'Classified ads', category: 'classified' },
  { id: 'nextdoor', name: 'Nextdoor', displayName: 'Nextdoor', icon: <Building className="h-4 w-4" />, description: 'Neighborhood platform', category: 'classified' }
];

// Step components
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i + 1 <= currentStep
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-12 h-0.5 mx-2 ${
                i + 1 < currentStep ? 'bg-primary' : 'bg-muted'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export function NewPostFlow() {
  const {
    // State
    currentStep,
    itemName,
    searchResults,
    selectedPlatforms,
    selectedImages,
    selectedContent,
    garageItems,
    garageFilters,
    loading,
    searching,
    generating,
    posting,
    error,
    
    // Actions
    setCurrentStep,
    setItemName,
    setSelectedPlatforms,
    setSelectedImages,
    setSelectedContent,
    searchItem,
    createProject,
    runDeepResearch,
    generateContent,
    processImages,
    customizeProject,
    confirmPost,
    fetchGarageItems,
    setGarageFilters,
    updateGarageItem,
    deleteGarageItem,
    clearError,
    resetWorkflow
  } = useNewPostFlowStore();
  
  const { toast } = useToast();
  const totalSteps = 5;

  // Load garage items on mount
  useEffect(() => {
    fetchGarageItems();
  }, [fetchGarageItems]);

  // Show error toasts
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Step 1: Enter Item
  const handleItemNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setItemName(e.target.value);
  }, [setItemName]);

  const handleSearch = useCallback(async () => {
    if (!itemName.trim()) return;
    
    try {
      await searchItem(itemName);
      toast({
        title: "Search Complete",
        description: `Found ${searchResults.length} similar items across platforms`,
      });
    } catch (error) {
      // Error is handled by the store and shown via toast
    }
  }, [itemName, searchItem, searchResults.length, toast]);

  const handleUseAsTemplate = useCallback((result: SearchResult) => {
    setItemName(result.title);
    setCurrentStep(2);
  }, [setItemName, setCurrentStep]);

  const handleCreateNewPost = useCallback(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const Step1EnterItem = useCallback(() => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Enter Item</h2>
          <p className="text-muted-foreground">Search for similar items or create a new post</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Item Search
            </CardTitle>
            <CardDescription>
              Get real analysis of items being sold across platforms using Abacus Deep Agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter item name (e.g., iPhone 13, Nike Air Max, etc.)"
                value={itemName}
                onChange={handleItemNameChange}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={searching || !itemName.trim()}>
                {searching ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Search Results</h3>
                {searchResults.map((result) => (
                  <Card key={result.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={result.image}
                        alt={result.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium">{result.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{result.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-medium">${result.price}</span>
                          <Badge variant="outline">{result.platform}</Badge>
                          <Badge variant={result.analysis.demand === 'high' ? 'default' : 'secondary'}>
                            {result.analysis.demand} demand
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUseAsTemplate(result)}
                      >
                        Use as Template
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <Separator />

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">Or create a new post from scratch</p>
              <Button
                onClick={handleCreateNewPost}
                disabled={!itemName.trim()}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Post
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }, [itemName, searchResults, searching, handleItemNameChange, handleSearch, handleUseAsTemplate, handleCreateNewPost]);

  // Step 2: Create Post
  const handlePlatformToggle = useCallback((platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter((id: string) => id !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  }, [selectedPlatforms, setSelectedPlatforms]);

  const handleDeepResearch = useCallback(async () => {
    try {
      await runDeepResearch({
        itemName,
        platforms: selectedPlatforms
      });
      
      toast({
        title: "Research Complete",
        description: "Deep research analysis generated for writing, pricing, and selling strategy",
      });
    } catch (error) {
      // Error is handled by the store
    }
  }, [itemName, selectedPlatforms, runDeepResearch, toast]);

  const handleGenerateContent = useCallback(async () => {
    try {
      await generateContent({
        itemName,
        platforms: selectedPlatforms
      });
      
      toast({
        title: "Content Generated",
        description: "Post content has been generated for selected platforms",
      });
    } catch (error) {
      // Error is handled by the store
    }
  }, [itemName, selectedPlatforms, generateContent, toast]);

  const handleGenerateImages = useCallback(async () => {
    try {
      await processImages({
        itemName,
        platforms: selectedPlatforms
      });
      
      toast({
        title: "Images Generated",
        description: "AI-generated images have been created for your post",
      });
    } catch (error) {
      // Error is handled by the store
    }
  }, [itemName, selectedPlatforms, processImages, toast]);

  const handleAllGeneration = useCallback(async () => {
    await handleDeepResearch();
    await handleGenerateContent();
    await handleGenerateImages();
  }, [handleDeepResearch, handleGenerateContent, handleGenerateImages]);

  const handleBackToStep1 = useCallback(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleContinueToStep3 = useCallback(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const Step2CreatePost = useCallback(() => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Create Post</h2>
          <p className="text-muted-foreground">Select platforms and generate content with AI assistance</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Select Platforms
            </CardTitle>
            <CardDescription>
              Choose which platforms to post your item on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {platforms.map((platform) => (
                <div
                  key={platform.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPlatforms.includes(platform.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handlePlatformToggle(platform.id)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {platform.icon}
                    <span className="text-sm font-medium">{platform.displayName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{platform.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Generation Options
            </CardTitle>
            <CardDescription>
              Use Abacus Deep Agent for comprehensive post creation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleDeepResearch}
                disabled={generating || selectedPlatforms.length === 0}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
                {generating ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <BarChart3 className="h-6 w-6" />
                )}
                <span>Run Deep Research</span>
                <span className="text-xs text-muted-foreground">Writing, pricing & strategy</span>
              </Button>

              <Button
                onClick={handleGenerateContent}
                disabled={generating || selectedPlatforms.length === 0}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
                {generating ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <FileText className="h-6 w-6" />
                )}
                <span>Create Post Writing</span>
                <span className="text-xs text-muted-foreground">Generate descriptions & titles</span>
              </Button>

              <Button
                onClick={handleGenerateImages}
                disabled={generating}
                className="h-20 flex-col gap-2"
                variant="outline"
              >
                {generating ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Image className="h-6 w-6" />
                )}
                <span>Get & Generate Images</span>
                <span className="text-xs text-muted-foreground">AI image generation</span>
              </Button>

              <Button
                onClick={handleAllGeneration}
                disabled={generating || selectedPlatforms.length === 0}
                className="h-20 flex-col gap-2"
              >
                {generating ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Zap className="h-6 w-6" />
                )}
                <span>All</span>
                <span className="text-xs">Complete generation</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {selectedContent && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={selectedContent.title} readOnly />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={selectedContent.description} readOnly rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Hashtags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedContent.hashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBackToStep1}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleContinueToStep3}
            disabled={selectedPlatforms.length === 0}
          >
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }, [selectedPlatforms, selectedContent, generating, handlePlatformToggle, handleDeepResearch, handleGenerateContent, handleGenerateImages, handleAllGeneration, handleBackToStep1, handleContinueToStep3]);

  // Step 3: Customize
  const handleBackToStep2 = useCallback(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleContinueToStep4 = useCallback(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const Step3Customize = useCallback(() => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Customize</h2>
          <p className="text-muted-foreground">Review and customize your post content and images</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Gallery Review
            </CardTitle>
            <CardDescription>
              Select images you like and customize your content
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {selectedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button size="sm" variant="secondary">
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="secondary">
                          <Star className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No images generated yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {selectedContent && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Content Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={selectedContent.title} />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea value={selectedContent.description} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium">Hashtags</label>
                <div className="flex flex-wrap gap-2">
                  {selectedContent.hashtags.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer">
                      {tag} <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Button variant="outline" className="flex-col gap-2 h-16">
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs">Rerun</span>
              </Button>
              <Button variant="outline" className="flex-col gap-2 h-16">
                <Edit className="h-4 w-4" />
                <span className="text-xs">Edit</span>
              </Button>
              <Button variant="outline" className="flex-col gap-2 h-16">
                <Download className="h-4 w-4" />
                <span className="text-xs">Download</span>
              </Button>
              <Button variant="outline" className="flex-col gap-2 h-16">
                <Share className="h-4 w-4" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBackToStep2}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleContinueToStep4}>
            Continue
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.div>
    );
  }, [selectedImages, selectedContent, handleBackToStep2, handleContinueToStep4]);


  // Step 4: Confirm
  const handleConfirmPost = useCallback(async () => {
    try {
      await confirmPost({
        itemName,
        platforms: selectedPlatforms,
        content: selectedContent,
        images: selectedImages
      });
      
      setCurrentStep(5);
      
      toast({
        title: "Post Published",
        description: `Successfully posted to ${selectedPlatforms.length} platform(s)`,
      });
    } catch (error) {
      // Error is handled by the store
    }
  }, [itemName, selectedPlatforms, selectedContent, selectedImages, confirmPost, setCurrentStep, toast]);

  const handleBackToStep3 = useCallback(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const Step4Confirm = useCallback(() => {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Confirm</h2>
          <p className="text-muted-foreground">Review your post before publishing</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Post Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">Item:</span>
              <span>{itemName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Platforms:</span>
              <div className="flex gap-1">
                {selectedPlatforms.map(platformId => {
                  const platform = platforms.find(p => p.id === platformId);
                  return platform ? (
                    <Badge key={platformId} variant="outline" className="flex items-center gap-1">
                      {platform.icon}
                      {platform.displayName}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Images:</span>
              <span>{selectedImages.length} generated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Content:</span>
              <span>{selectedContent ? 'Generated' : 'Not generated'}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleConfirmPost}
            disabled={posting}
            className="h-16 flex-col gap-2"
          >
            {posting ? (
              <RefreshCw className="h-6 w-6 animate-spin" />
            ) : (
              <CheckCircle className="h-6 w-6" />
            )}
            <span>Post</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleBackToStep3}
            className="h-16 flex-col gap-2"
          >
            <Edit className="h-6 w-6" />
            <span>Customize/Edit</span>
          </Button>
        </div>

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleBackToStep3}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </motion.div>
    );
  }, [itemName, selectedPlatforms, selectedContent, selectedImages, posting, handleConfirmPost, handleBackToStep3]);

  // Step 5: Garage
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { search: e.target.value };
    setGarageFilters(newFilters);
    fetchGarageItems({ ...garageFilters, ...newFilters });
  }, [garageFilters, setGarageFilters, fetchGarageItems]);

  const handlePlatformFilterChange = useCallback((value: string) => {
    const newFilters = { platform: value };
    setGarageFilters(newFilters);
    fetchGarageItems({ ...garageFilters, ...newFilters });
  }, [garageFilters, setGarageFilters, fetchGarageItems]);

  const handleStatusFilterChange = useCallback((value: string) => {
    const newFilters = { status: value };
    setGarageFilters(newFilters);
    fetchGarageItems({ ...garageFilters, ...newFilters });
  }, [garageFilters, setGarageFilters, fetchGarageItems]);

  const handleLoadItemForEdit = useCallback((item: PostItem) => {
    setItemName(item.name);
    setSelectedPlatforms(item.platforms);
    setSelectedImages(item.images);
    setSelectedContent(item.content);
    setCurrentStep(3);
  }, [setItemName, setSelectedPlatforms, setSelectedImages, setSelectedContent, setCurrentStep]);

  const handleCreateNewPostFromGarage = useCallback(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const Step5Garage = useCallback(() => {
    // Filter items based on current filters
    const filteredItems = garageItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(garageFilters.search.toLowerCase());
      const matchesPlatform = garageFilters.platform === 'all' || item.platforms.includes(garageFilters.platform);
      const matchesStatus = garageFilters.status === 'all' || item.status === garageFilters.status;
      return matchesSearch && matchesPlatform && matchesStatus;
    });

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Garage</h2>
          <p className="text-muted-foreground">Manage all your items, posts, and projects</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search items..."
                value={garageFilters.search}
                onChange={handleSearchChange}
                className="flex-1"
              />
              <Select
                value={garageFilters.platform}
                onValueChange={handlePlatformFilterChange}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {platforms.map(platform => (
                    <SelectItem key={platform.id} value={platform.id}>
                      {platform.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={garageFilters.status}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted">
                {item.images.length > 0 ? (
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 line-clamp-1">{item.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                    {item.status}
                  </Badge>
                  <span className="text-sm font-medium">${item.price}</span>
                </div>
                <div className="flex items-center gap-1 mb-3">
                  {item.platforms.slice(0, 3).map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return platform ? (
                      <div key={platformId} className="text-xs">
                        {platform.icon}
                      </div>
                    ) : null;
                  })}
                  {item.platforms.length > 3 && (
                    <span className="text-xs text-muted-foreground">+{item.platforms.length - 3}</span>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleLoadItemForEdit(item)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleLoadItemForEdit(item)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => deleteGarageItem(item.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Archive className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No items found</h3>
              <p className="text-muted-foreground mb-4">
                {garageItems.length === 0 
                  ? "Start by creating your first post"
                  : "Try adjusting your search or filters"
                }
              </p>
              {garageItems.length === 0 && (
                <Button onClick={handleCreateNewPostFromGarage}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Post
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center">
          <Button variant="outline" onClick={handleCreateNewPostFromGarage}>
            <Plus className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </div>
      </motion.div>
    );
  }, [garageItems, garageFilters, handleSearchChange, handlePlatformFilterChange, handleStatusFilterChange, handleLoadItemForEdit, handleCreateNewPostFromGarage, deleteGarageItem]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
        
        <AnimatePresence mode="wait">
          {currentStep === 1 && <Step1EnterItem />}
          {currentStep === 2 && <Step2CreatePost />}
          {currentStep === 3 && <Step3Customize />}
          {currentStep === 4 && <Step4Confirm />}
          {currentStep === 5 && <Step5Garage />}
        </AnimatePresence>
      </div>
    </div>
  );
}
