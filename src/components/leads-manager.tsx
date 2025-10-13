/**
 * Leads Manager Component
 * Comprehensive lead management and tracking interface with CRM features
 * 
 * @version 1.0.0
 * @date 2025-10-12
 * @category Features
 * @tags leads, management, tracking, crm, phase2, sales
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Users,
  Plus,
  Edit,
  MessageSquare,
  Phone,
  Mail,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  Filter,
  Search,
  Calendar,
  User,
  TrendingUp,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  message: string | null;
  source: string | null;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  interactions: Interaction[];
}

interface Interaction {
  id: string;
  type: string;
  message: string | null;
  response: string | null;
  isAuto: boolean;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  CONTACTED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  QUALIFIED: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  NEGOTIATING: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  SCHEDULED: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  CONVERTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  LOST: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

const priorityColors: Record<string, string> = {
  LOW: 'bg-slate-100 text-slate-800 dark:bg-slate-900/20 dark:text-slate-400',
  MEDIUM: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  URGENT: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
};

export function LeadsManager() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadLeads();
  }, []);

  useEffect(() => {
    filterLeads();
  }, [leads, searchTerm, statusFilter, priorityFilter]);

  const loadLeads = async () => {
    try {
      // Mock data for demonstration
      const mockLeads: Lead[] = [
        {
          id: '1',
          name: 'Mike Johnson',
          email: 'mike.johnson@email.com',
          phone: '(323) 555-0147',
          message: 'Is this still available? I have a van conversion project.',
          source: 'Facebook Marketplace',
          status: 'NEW',
          priority: 'HIGH',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          interactions: []
        },
        {
          id: '2', 
          name: 'Sarah Martinez',
          email: 'sarah.m.vanlife@gmail.com',
          phone: null,
          message: 'What are the power requirements? I have 400Ah lithium setup.',
          source: 'Facebook Marketplace',
          status: 'CONTACTED',
          priority: 'MEDIUM',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          interactions: [
            {
              id: '1',
              type: 'INQUIRY',
              message: 'What are the power requirements? I have 400Ah lithium setup.',
              response: 'Hi Sarah! The unit draws 38-55 AMPS, so your 400Ah setup should handle it well. Are you able to pick up in Mid-Wilshire, LA?',
              isAuto: true,
              createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            }
          ]
        },
        {
          id: '3',
          name: 'David Chen',
          email: null,
          phone: '(818) 555-0299',
          message: 'Price negotiable?',
          source: 'Craigslist',
          status: 'QUALIFIED',
          priority: 'MEDIUM',
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          interactions: []
        },
        {
          id: '4',
          name: 'Lisa Thompson',
          email: 'lisa.thompson.rv@yahoo.com',
          phone: '(310) 555-0188',
          message: 'Perfect! When can I pick this up? I have cash ready.',
          source: 'OfferUp',
          status: 'SCHEDULED',
          priority: 'URGENT',
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          interactions: []
        }
      ];

      setLeads(mockLeads);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterLeads = () => {
    let filtered = leads;

    if (searchTerm) {
      filtered = filtered.filter(lead =>
        lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.message?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === priorityFilter);
    }

    setFilteredLeads(filtered);
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    try {
      // In a real app, this would be an API call
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === leadId
            ? { ...lead, status, updatedAt: new Date().toISOString() }
            : lead
        )
      );
      
      toast({
        title: 'Success',
        description: 'Lead status updated successfully',
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      toast({
        title: 'Error',
        description: 'Failed to update lead status',
        variant: 'destructive',
      });
    }
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'NEW').length,
    qualified: leads.filter(l => l.status === 'QUALIFIED' || l.status === 'NEGOTIATING' || l.status === 'SCHEDULED').length,
    converted: leads.filter(l => l.status === 'CONVERTED').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-8 h-8 animate-pulse mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lead Management
          </h1>
          <p className="text-muted-foreground">
            Track and manage potential buyers for your AC unit
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-xl">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.new}</p>
                <p className="text-sm text-muted-foreground">New Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-xl">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.qualified}</p>
                <p className="text-sm text-muted-foreground">Qualified</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.converted}</p>
                <p className="text-sm text-muted-foreground">Converted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="CONTACTED">Contacted</SelectItem>
                <SelectItem value="QUALIFIED">Qualified</SelectItem>
                <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="CONVERTED">Converted</SelectItem>
                <SelectItem value="LOST">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredLeads.map((lead, index) => (
          <motion.div
            key={lead.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-0 shadow-xl hover:shadow-2xl transition-all duration-300 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lead.name || 'Anonymous'}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge className={statusColors[lead.status]} variant="secondary">
                          {lead.status.toLowerCase()}
                        </Badge>
                        <Badge className={priorityColors[lead.priority]} variant="outline">
                          {lead.priority.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {getTimeAgo(lead.updatedAt)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Contact Info */}
                <div className="space-y-2">
                  {lead.email && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">{lead.email}</span>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{lead.phone}</span>
                    </div>
                  )}
                  {lead.source && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{lead.source}</span>
                    </div>
                  )}
                </div>

                {/* Message */}
                {lead.message && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3">
                      "{lead.message}"
                    </p>
                  </div>
                )}

                {/* Interactions */}
                {lead.interactions.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <MessageSquare className="w-3 h-3" />
                    <span>{lead.interactions.length} interaction{lead.interactions.length !== 1 ? 's' : ''}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {getTimeAgo(lead.createdAt)}
                  </div>
                  
                  <div className="flex space-x-1">
                    <Select value={lead.status} onValueChange={(status) => updateLeadStatus(lead.id, status)}>
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NEW">New</SelectItem>
                        <SelectItem value="CONTACTED">Contacted</SelectItem>
                        <SelectItem value="QUALIFIED">Qualified</SelectItem>
                        <SelectItem value="NEGOTIATING">Negotiating</SelectItem>
                        <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                        <SelectItem value="CONVERTED">Converted</SelectItem>
                        <SelectItem value="LOST">Lost</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedLead(lead);
                        setIsDialogOpen(true);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-dashed border-2 border-slate-300 dark:border-slate-600">
          <CardContent className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">
              No Leads Found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Leads will appear here as people inquire about your AC unit'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Lead Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              View and manage lead information and interactions
            </DialogDescription>
          </DialogHeader>
          
          {selectedLead && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input value={selectedLead.name || ''} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Source</label>
                  <Input value={selectedLead.source || ''} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input value={selectedLead.email || ''} readOnly />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input value={selectedLead.phone || ''} readOnly />
                </div>
              </div>

              {selectedLead.message && (
                <div>
                  <label className="text-sm font-medium">Initial Message</label>
                  <Textarea value={selectedLead.message} readOnly rows={3} />
                </div>
              )}

              {selectedLead.interactions.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-3 block">Interactions</label>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedLead.interactions.map((interaction) => (
                      <div key={interaction.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={interaction.isAuto ? 'secondary' : 'outline'}>
                            {interaction.isAuto ? 'Auto' : 'Manual'} {interaction.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {getTimeAgo(interaction.createdAt)}
                          </span>
                        </div>
                        {interaction.message && (
                          <p className="text-sm mb-2">
                            <strong>Message:</strong> {interaction.message}
                          </p>
                        )}
                        {interaction.response && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            <strong>Response:</strong> {interaction.response}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
