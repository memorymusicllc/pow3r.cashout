/**
 * Listing Generator Component
 * AI-powered listing generation for marketplace posts with multi-platform support
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Features
 * @tags listing, generation, ai, marketplace, phase1, automation
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { productData, listingTemplates } from '@/lib/product-data';
import { useListingsStore } from '@/lib/stores/listings.store';
import { storage } from '@/lib/storage';
import { Listing } from '@/lib/types';

interface Platform {
  id: string;
  name: string;
  displayName: string;
  description: string;
}

interface ListingTemplate {
  id: string;
  platformId: string;
  title: string;
  description: string;
  price: number;
  tags: string[];
}

interface GeneratedListing {
  title: string;
  description: string;
  platform: string;
  optimized: boolean;
}

const platformIcons: Record<string, any> = {
  facebook: Facebook,
  craigslist: Globe,
  offerup: Smartphone,
  rvforums: Users,
};

export function ListingGenerator() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [templates, setTemplates] = useState<ListingTemplate[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadPlatformsAndTemplates();
  }, []);

  const loadPlatformsAndTemplates = async () => {
    try {
      // Load platforms from static data
      const platformsData: Platform[] = [
        {
          id: 'facebook',
          name: 'facebook',
          displayName: 'Facebook Marketplace',
          description: 'Largest local marketplace with advanced automation support. Best for reaching van life and RV communities.'
        },
        {
          id: 'offerup',
          name: 'offerup', 
          displayName: 'OfferUp',
          description: 'Mobile-first marketplace popular with younger buyers. Good for quick sales and immediate responses.'
        },
        {
          id: 'craigslist',
          name: 'craigslist',
          displayName: 'Craigslist',
          description: 'Classic classified platform. Still effective for high-value items and serious buyers.'
        }
      ];

      // Load templates from product data
      const templatesData: ListingTemplate[] = Object.entries(listingTemplates).map(([key, template]) => ({
        id: key,
        platformId: key,
        title: template.title,
        description: template.description,
        price: productData.pricing.askingPrice,
        tags: template.tags
      }));
      
      setPlatforms(platformsData);
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load platforms and templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateListing = async () => {
    if (!selectedPlatform) {
      toast({
        title: 'Platform Required',
        description: 'Please select a platform first',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate-listing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platform: selectedPlatform,
          customPrompt: customPrompt?.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate listing');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let partialRead = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          partialRead += decoder.decode(value, { stream: true });
          let lines = partialRead.split('\n');
          partialRead = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.status === 'completed') {
                  setGeneratedListing({
                    title: parsed.result.title,
                    description: parsed.result.description,
                    platform: selectedPlatform,
                    optimized: true,
                  });
                  toast({
                    title: 'Success',
                    description: 'Listing generated successfully!',
                  });
                  return;
                } else if (parsed.status === 'error') {
                  throw new Error(parsed.message || 'Generation failed');
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error generating listing:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate listing. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Listing content copied to clipboard',
    });
  };

  const selectedTemplate = templates.find(t => t.platformId === selectedPlatform);
  const selectedPlatformData = platforms.find(p => p.id === selectedPlatform);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Listing Generator
        </h1>
        <p className="text-muted-foreground">
          Create optimized listings for different platforms with AI assistance
        </p>
      </div>

      {/* Product Showcase */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="relative aspect-square bg-white/10 rounded-lg overflow-hidden">
              <img
                src={productData.images.mainUnit}
                alt="AC Main Unit"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{productData.model}</h2>
                <p className="text-blue-100">{productData.brand}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                  </div>
                  <div className="text-sm font-medium">{productData.specs.coolingCapacity}</div>
                  <div className="text-xs text-blue-200">Cooling</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Battery className="w-4 h-4 text-green-400" />
                  </div>
                  <div className="text-sm font-medium">{productData.specs.voltage}</div>
                  <div className="text-xs text-blue-200">Direct DC</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Zap className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-sm font-medium">{productData.specs.currentDraw}</div>
                  <div className="text-xs text-blue-200">Current</div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-blue-200 line-through">
                ${productData.pricing.totalRetailCost.toLocaleString()}
              </div>
              <div className="text-3xl font-bold text-green-400">
                ${productData.pricing.askingPrice.toLocaleString()}
              </div>
              <div className="text-sm text-green-300">
                Save ${productData.pricing.savings}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Platform Selection & Controls */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Platform Selection</span>
              </CardTitle>
              <CardDescription>
                Choose your target marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => {
                    const Icon = platformIcons[platform.name] || Globe;
                    return (
                      <SelectItem key={platform.id} value={platform.id}>
                        <div className="flex items-center space-x-2">
                          <Icon className="w-4 h-4" />
                          <span>{platform.displayName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              {selectedPlatformData && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    {selectedPlatformData.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>AI Customization</span>
              </CardTitle>
              <CardDescription>
                Optional modifications or focus areas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g., 'Emphasize energy efficiency for van life audience' or 'Focus on professional installation requirements'"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
                className="resize-none"
              />
              
              <Button 
                onClick={generateListing}
                disabled={isGenerating || !selectedPlatform}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Listing
                  </>
                )}
              </Button>

              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <AlertCircle className="w-3 h-3" />
                <span>Leave blank to use optimized template</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Preview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {(() => {
                      const Icon = platformIcons[selectedPlatformData?.name || ''] || Globe;
                      return <Icon className="w-5 h-5 text-green-600" />;
                    })()}
                    <span>Base Template</span>
                  </div>
                  <Badge variant="secondary">Ready to use</Badge>
                </CardTitle>
                <CardDescription>
                  Optimized template for {selectedPlatformData?.displayName}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-sm font-medium">{selectedTemplate.title}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg max-h-60 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">
                      {selectedTemplate.description}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">${selectedTemplate.price.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-blue-500" />
                    <span className="text-sm">{productData.location.area}</span>
                  </div>
                </div>

                {/* Product Specs */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{productData.specs.coolingCapacity}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Battery className="w-3 h-3 text-green-500" />
                      <span>{productData.specs.voltage}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3 text-orange-500" />
                      <span>{productData.specs.currentDraw}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Check className="w-3 h-3 text-green-500" />
                      <span>{productData.condition}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(`${selectedTemplate.title}\n\n${selectedTemplate.description}`)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Template
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-dashed border-2 border-slate-300 dark:border-slate-600">
              <CardContent className="p-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
                  Select a Platform
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose a platform to view its optimized template
                </p>
              </CardContent>
            </Card>
          )}

          {/* Generated Listing */}
          {generatedListing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      <span>AI-Generated Listing</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Check className="w-3 h-3 mr-1" />
                      Optimized
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Customized for {platforms.find(p => p.id === generatedListing.platform)?.displayName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Generated Title</label>
                    <div className="mt-1 p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium">{generatedListing.title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Generated Description</label>
                    <div className="mt-1 p-3 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-800 max-h-60 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {generatedListing.description}
                      </pre>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(`${generatedListing.title}\n\n${generatedListing.description}`)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Generated
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={generateListing}
                      disabled={isGenerating}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
