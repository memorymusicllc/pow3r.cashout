/**
 * Listing Management Component
 * Manage active listings across multiple marketplace platforms
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Features
 * @tags listing, management, marketplace, multi-platform, phase1
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardCard } from '@/components/ui/dashboard-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Sparkles,
  Copy,
  Download,
  RefreshCw,
  Facebook,
  Globe,
  Smartphone,
  Users,
  DollarSign,
  MapPin,
  Clock,
  Check,
  AlertCircle,
  Star,
  Battery,
  Zap,
  Trash2,
  Edit,
  Plus,
  X,
  PlayCircle,
  PauseCircle,
  Eye,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { getProductData, getListingTemplates, getCurrentProduct, setCurrentProduct, getAvailableProducts } from '@/lib/product-config';
import { useListingsStore } from '@/lib/stores/listings.store';
import { Listing } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Platform {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

interface GeneratedListing {
  title: string;
  description: string;
  price: number;
  platforms: string[];
  optimizedFor: string[];
  generatedAt: string;
}

const platformIcons: Record<string, any> = {
  facebook: Facebook,
  craigslist: Globe,
  offerup: Smartphone,
};

export function ListingManagement() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['facebook']);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('facebook');
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customPrice, setCustomPrice] = useState(getProductData().pricing.askingPrice.toString());
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'generator' | 'listings'>('generator');
  const [selectedProduct, setSelectedProduct] = useState(getCurrentProduct().id);
  
  const { listings, loading, createListing, updateListing, deleteListing, refresh } = useListingsStore();
  const { toast } = useToast();

  // Update price when product changes
  useEffect(() => {
    const productData = getProductData();
    setCustomPrice(productData.pricing.askingPrice.toString());
  }, [selectedProduct]);

  const platforms: Platform[] = [
    {
      id: 'facebook',
      name: 'facebook',
      displayName: 'Facebook Marketplace',
      description: 'Primary platform - best reach for AC units'
    },
    {
      id: 'offerup',
      name: 'offerup', 
      displayName: 'OfferUp',
      description: 'Mobile marketplace - younger demographics'
    },
    {
      id: 'craigslist',
      name: 'craigslist',
      displayName: 'Craigslist',
      description: 'Traditional classified - serious buyers'
    }
  ];

  const handleProductChange = (productId: string) => {
    setSelectedProduct(productId);
    setCurrentProduct(productId);
    // Reset generated listing when product changes
    setGeneratedListing(null);
    setCustomTitle('');
    setCustomDescription('');
  };

  const generateListing = async () => {
    if (selectedPlatforms.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select at least one platform',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Use template data or custom input
      const templates = getListingTemplates();
      const template = templates[selectedTemplate as keyof typeof templates];
      const productData = getProductData();
      
      const generated: GeneratedListing = {
        title: customTitle || template.title,
        description: customDescription || template.description,
        price: parseInt(customPrice) || productData.pricing.askingPrice,
        platforms: selectedPlatforms,
        optimizedFor: selectedPlatforms,
        generatedAt: new Date().toISOString(),
      };

      // Simulate AI optimization delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      setGeneratedListing(generated);
      toast({
        title: 'Listing Generated',
        description: 'Ready to post on selected platforms',
      });
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const postListing = async () => {
    if (!generatedListing) return;

    const success = await createListing({
      title: generatedListing.title,
      description: generatedListing.description,
      price: generatedListing.price,
      platforms: generatedListing.platforms,
      autoRefresh: true
    });

    if (success) {
      setGeneratedListing(null);
      setActiveTab('listings');
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    if (confirm('Are you sure you want to delete this listing? This action cannot be undone.')) {
      await deleteListing(listingId);
    }
  };

  const handleToggleListingStatus = async (listingId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateListing(listingId, { status: newStatus });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to Clipboard',
      description: 'Listing content copied to clipboard',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen p-3 sm:p-6 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Listing Management
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Create optimized listings and manage active posts
            </p>
          </div>
          
          {/* Tab Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <Button
              variant={activeTab === 'generator' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('generator')}
              className="flex-1 sm:flex-none"
            >
              <Plus className="w-4 h-4 mr-2" />
              Generate
            </Button>
            <Button
              variant={activeTab === 'listings' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('listings')}
              className="flex-1 sm:flex-none"
            >
              <FileText className="w-4 h-4 mr-2" />
              Manage ({listings.length})
            </Button>
          </div>
        </div>

        {/* Product Selector */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">Product:</label>
          <Select value={selectedProduct} onValueChange={handleProductChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select product" />
            </SelectTrigger>
            <SelectContent>
              {getAvailableProducts().map(productId => {
                const product = getCurrentProduct();
                return (
                  <SelectItem key={productId} value={productId}>
                    {productId === 'air-conditioner' ? 'Air Conditioner' : 
                     productId === 'car' ? 'Car' : productId}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Product Showcase */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6 items-center">
            <div className="relative aspect-square bg-white/10 rounded-lg overflow-hidden">
              <img
                src={getProductData().images.mainUnit}
                alt={getProductData().fullName}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="sm:col-span-2 space-y-3 sm:space-y-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold">{getProductData().model}</h2>
                <p className="text-blue-100 text-sm sm:text-base">{getProductData().brand}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {selectedProduct === 'air-conditioner' ? (
                  <>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{getProductData().specs.coolingCapacity}</div>
                      <div className="text-xs text-blue-200">Cooling</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{getProductData().specs.voltage}</div>
                      <div className="text-xs text-blue-200">Direct DC</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{getProductData().specs.currentDraw}</div>
                      <div className="text-xs text-blue-200">Current</div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{getProductData().specs.year}</div>
                      <div className="text-xs text-blue-200">Year</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Battery className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{getProductData().specs.mileage}</div>
                      <div className="text-xs text-blue-200">Mileage</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
                      </div>
                      <div className="text-xs sm:text-sm font-medium">{getProductData().specs.engine}</div>
                      <div className="text-xs text-blue-200">Engine</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="text-center sm:text-right">
              <div className="text-xs sm:text-sm text-blue-200 line-through">
                ${getProductData().pricing.retailPrice.toLocaleString()}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-green-400">
                ${getProductData().pricing.askingPrice.toLocaleString()}
              </div>
              <div className="text-xs sm:text-sm text-green-300">
                Save ${getProductData().pricing.savings}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {activeTab === 'generator' ? (
        // Listing Generator Tab
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Platform Selection & Controls */}
          <div className="space-y-4 sm:space-y-6">
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
              <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3">
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-sm sm:text-base">Platform Selection</span>
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Choose where to post your listing
                </CardDescription>
              </CardHeader>
              <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-4">
                <div className="space-y-3">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPlatforms([...selectedPlatforms, platform.id]);
                          } else {
                            setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                          }
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          {platformIcons[platform.id] && (() => {
                            const IconComponent = platformIcons[platform.id];
                            return <IconComponent className="w-4 h-4 text-blue-600 flex-shrink-0" />;
                          })()}
                          <span className="text-sm font-medium">{platform.displayName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {platform.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Template Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Template</label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="facebook">Facebook Optimized</SelectItem>
                      <SelectItem value="offerup">OfferUp Mobile</SelectItem>
                      <SelectItem value="craigslist">Craigslist Classic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium">Custom Title (Optional)</label>
                    <Input
                      placeholder="Override template title"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Custom Description (Optional)</label>
                    <Textarea
                      placeholder="Override template description"
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <Input
                      type="number"
                      placeholder="4200"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                </div>

                <Button 
                  onClick={generateListing} 
                  className="w-full" 
                  disabled={isGenerating || selectedPlatforms.length === 0}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Listing
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Generated Listing Preview */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {generatedListing ? (
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
                <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3">
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                    <span className="text-sm sm:text-base">Generated Listing</span>
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    AI-optimized for {generatedListing.platforms.join(', ')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6 space-y-4">
                  {/* Listing Preview */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border">
                    <h3 className="font-bold text-base sm:text-lg mb-2">{generatedListing.title}</h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium">${generatedListing.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">{getProductData().location.area}</span>
                      </div>
                    </div>

                    {/* Product Specs Preview */}
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg mb-4">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span>{selectedProduct === 'air-conditioner' ? getProductData().specs.coolingCapacity : getProductData().specs.year}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Battery className="w-3 h-3 text-green-500" />
                          <span>{selectedProduct === 'air-conditioner' ? getProductData().specs.voltage : getProductData().specs.mileage}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Zap className="w-3 h-3 text-orange-500" />
                          <span>{selectedProduct === 'air-conditioner' ? getProductData().specs.currentDraw : getProductData().specs.engine}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Check className="w-3 h-3 text-green-500" />
                          <span>{getProductData().condition}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-sm whitespace-pre-wrap line-clamp-4 sm:line-clamp-none">
                        {generatedListing.description}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <Button onClick={postListing} className="flex-1">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Post Now
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => copyToClipboard(`${generatedListing.title}\n\n${generatedListing.description}\n\nPrice: $${generatedListing.price}`)}
                      className="flex-1 sm:flex-none"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setGeneratedListing(null)}
                      className="flex-1 sm:flex-none"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
                <CardContent className="p-8 sm:p-12 text-center">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Generate Your Listing</h3>
                      <p className="text-sm text-muted-foreground">
                        Select platforms and customize your listing content
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        // Active Listings Management Tab
        <div className="space-y-4 sm:space-y-6">
          {/* Active Listings Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-semibold">Active Listings</h2>
            <Button onClick={refresh} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Listings Grid */}
          {listings.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-blue-600 opacity-50" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">No Active Listings</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your first listing using the generator
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('generator')} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Listing
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {listings.map((listing) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl hover:shadow-2xl transition-all">
                    <CardHeader className="px-3 sm:px-6 pt-3 sm:pt-6 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-sm sm:text-base truncate">{listing.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getStatusColor(listing.status)} variant="outline">
                              {listing.status}
                            </Badge>
                            {platformIcons[listing.platformId] && (() => {
                              const IconComponent = platformIcons[listing.platformId];
                              return <IconComponent className="w-4 h-4 text-blue-600" />;
                            })()}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleToggleListingStatus(listing.id, listing.status)}
                            >
                              {listing.status === 'active' ? (
                                <>
                                  <PauseCircle className="w-4 h-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => copyToClipboard(`${listing.title}\n\n${listing.description}\n\nPrice: $${listing.price}`)}
                            >
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Price:</span>
                          <span className="font-semibold text-green-600">${listing.price.toLocaleString()}</span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground line-clamp-3">
                          {listing.description}
                        </div>
                        
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Eye className="w-3 h-3" />
                              {listing.views}
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              {listing.inquiries}
                            </span>
                          </div>
                          <span>
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
