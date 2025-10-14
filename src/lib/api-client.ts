
import { ApiResponse, Product } from './types';

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(baseURL = '', timeout = 10000, retryAttempts = 3) {
    // Use Cloudflare Pages Functions API endpoints
    this.baseURL = baseURL || '/api';
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeoutMs = this.timeout
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await this.delay(backoffDelay);
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      try {
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`API GET ${endpoint} failed:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      try {
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
          method: 'POST',
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`API POST ${endpoint} failed:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      try {
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`API PUT ${endpoint} failed:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.retryRequest(async () => {
      try {
        const response = await this.fetchWithTimeout(`${this.baseURL}${endpoint}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return {
          success: true,
          data: data as T,
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`API DELETE ${endpoint} failed:`, error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        };
      }
    });
  }
}

// Singleton instance - pointing to real backend API
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
const apiBaseUrl = isProduction ? 'https://pow3r-cashout.pages.dev' : 'http://localhost:3001';
export const apiClient = new ApiClient(apiBaseUrl, 15000, 3);

// Specific API functions
export const api = {
  // Dashboard APIs
  async getDashboardData() {
    return apiClient.get<any>('/api/dashboard');
  },

  // Product APIs
  async getProduct(id: string) {
    return apiClient.get<Product>(`/api/products/${id}`);
  },

  async updateProduct(id: string, data: Partial<Product>) {
    return apiClient.put<Product>(`/api/products/${id}`, data);
  },

  // Listing APIs
  async getListings(userId: string) {
    return apiClient.get<any[]>(`/api/listings?userId=${userId}`);
  },

  async createListing(data: any) {
    return apiClient.post<any>('/api/listings', data);
  },

  async updateListing(id: string, data: any) {
    return apiClient.put<any>(`/api/listings/${id}`, data);
  },

  async deleteListing(id: string) {
    return apiClient.delete<any>(`/api/listings/${id}`);
  },

  // Auto-Responder APIs
  async getAutoResponseRules(sellerId: string) {
    return apiClient.get<any[]>(`/api/auto-responses?sellerId=${sellerId}`);
  },

  async createAutoResponseRule(data: any) {
    return apiClient.post<any>('/api/auto-responses', data);
  },

  async updateAutoResponseRule(id: string, data: any) {
    return apiClient.put<any>(`/api/auto-responses/${id}`, data);
  },

  async deleteAutoResponseRule(id: string) {
    return apiClient.delete<any>(`/api/auto-responses/${id}`);
  },

  // Lead APIs
  async getLeads(sellerId: string) {
    return apiClient.get<any[]>(`/api/leads?sellerId=${sellerId}`);
  },

  async updateLead(id: string, data: any) {
    return apiClient.put<any>(`/api/leads/${id}`, data);
  },

  // Analytics APIs
  async getPerformanceMetrics(sellerId: string, timeRange: string) {
    return apiClient.get<any>(`/api/analytics/performance?sellerId=${sellerId}&timeRange=${timeRange}`);
  },

  async getPlatformAnalytics(sellerId: string) {
    return apiClient.get<any[]>(`/api/analytics/platforms?sellerId=${sellerId}`);
  },

  // Settings APIs
  async getSellerSettings(sellerId: string) {
    return apiClient.get<any>(`/api/settings?sellerId=${sellerId}`);
  },

  async updateSellerSettings(sellerId: string, data: any) {
    return apiClient.put<any>(`/api/settings?sellerId=${sellerId}`, data);
  },

  // AI Response System APIs
  async getAIResponseTemplates() {
    return apiClient.get<any[]>('/api/ai-response/templates');
  },

  async createAIResponseTemplate(data: any) {
    return apiClient.post<any>('/api/ai-response/templates', data);
  },

  async updateAIResponseTemplate(id: string, data: any) {
    return apiClient.put<any>(`/api/ai-response/templates/${id}`, data);
  },

  async deleteAIResponseTemplate(id: string) {
    return apiClient.delete<any>(`/api/ai-response/templates/${id}`);
  },

  async getAIResponseRules() {
    return apiClient.get<any[]>('/api/ai-response/rules');
  },

  async createAIResponseRule(data: any) {
    return apiClient.post<any>('/api/ai-response/rules', data);
  },

  async updateAIResponseRule(id: string, data: any) {
    return apiClient.put<any>(`/api/ai-response/rules/${id}`, data);
  },

  async deleteAIResponseRule(id: string) {
    return apiClient.delete<any>(`/api/ai-response/rules/${id}`);
  },

  async generateAIResponse(data: any) {
    return apiClient.post<any>('/api/ai-response/generate', data);
  },

  async createAIResponseSession(data: any) {
    return apiClient.post<any>('/api/ai-response/sessions', data);
  },

  async endAIResponseSession(sessionId: string, reason: string) {
    return apiClient.put<any>(`/api/ai-response/sessions/${sessionId}/end`, { reason });
  },

  async escalateAIResponseSession(sessionId: string, reason: string) {
    return apiClient.put<any>(`/api/ai-response/sessions/${sessionId}/escalate`, { reason });
  },

  async getAIResponseMetrics() {
    return apiClient.get<any>('/api/ai-response/metrics');
  },

  async updateAIConfig(data: any) {
    return apiClient.put<any>('/api/ai-response/config', data);
  },

  // Analytics APIs
  async getAnalyticsMetrics() {
    return apiClient.get<any>('/api/analytics/metrics');
  },

  async getOptimizationInsights() {
    return apiClient.get<any[]>('/api/analytics/insights');
  },

  async createOptimizationInsight(data: any) {
    return apiClient.post<any>('/api/analytics/insights', data);
  },

  async updateOptimizationInsight(id: string, data: any) {
    return apiClient.put<any>(`/api/analytics/insights/${id}`, data);
  },

  async implementOptimizationInsight(id: string) {
    return apiClient.put<any>(`/api/analytics/insights/${id}/implement`, {});
  },

  async dismissOptimizationInsight(id: string) {
    return apiClient.delete<any>(`/api/analytics/insights/${id}`);
  },

  async getReportTemplates() {
    return apiClient.get<any[]>('/api/analytics/report-templates');
  },

  async generateReport(templateId: string, timeRange?: string) {
    return apiClient.post<any>(`/api/analytics/reports/generate`, { templateId, timeRange });
  },

  async generateCustomReport(data: any) {
    return apiClient.post<any>('/api/analytics/reports/custom', data);
  },

  async scheduleReport(templateId: string, schedule: any) {
    return apiClient.post<any>(`/api/analytics/reports/schedule`, { templateId, schedule });
  },

  async getCustomDashboards() {
    return apiClient.get<any[]>('/api/analytics/dashboards');
  },

  async createCustomDashboard(data: any) {
    return apiClient.post<any>('/api/analytics/dashboards', data);
  },

  async updateCustomDashboard(id: string, data: any) {
    return apiClient.put<any>(`/api/analytics/dashboards/${id}`, data);
  },

  async deleteCustomDashboard(id: string) {
    return apiClient.delete<any>(`/api/analytics/dashboards/${id}`);
  },

  async shareCustomDashboard(id: string, isPublic: boolean) {
    return apiClient.put<any>(`/api/analytics/dashboards/${id}/share`, { isPublic });
  },

  async exportAnalyticsData(data: any) {
    return apiClient.post<any>('/api/analytics/export', data);
  },

  async exportOptimizationInsights(format: string) {
    return apiClient.post<any>('/api/analytics/export/insights', { format });
  },

  async exportTransactionData(data: any) {
    return apiClient.post<any>('/api/analytics/export/transactions', data);
  },

  async updateAnalyticsConfig(data: any) {
    return apiClient.put<any>('/api/analytics/config', data);
  },

  // Lead Monitoring APIs
  async createLead(data: any) {
    return apiClient.post<any>('/api/leads', data);
  },

  async deleteLead(id: string) {
    return apiClient.delete<any>(`/api/leads/${id}`);
  },

  async updateLeadScoring(data: any) {
    return apiClient.put<any>('/api/leads/scoring', data);
  },

  async getNotificationRules() {
    return apiClient.get<any[]>('/api/leads/notification-rules');
  },

  async createNotificationRule(data: any) {
    return apiClient.post<any>('/api/leads/notification-rules', data);
  },

  async updateNotificationRule(id: string, data: any) {
    return apiClient.put<any>(`/api/leads/notification-rules/${id}`, data);
  },

  async deleteNotificationRule(id: string) {
    return apiClient.delete<any>(`/api/leads/notification-rules/${id}`);
  },

  async getLeadMetrics() {
    return apiClient.get<any>('/api/leads/metrics');
  },

  // Negotiation APIs
  async getNegotiations() {
    return apiClient.get<any[]>('/api/negotiations');
  },

  async createNegotiation(data: any) {
    return apiClient.post<any>('/api/negotiations', data);
  },

  async makeNegotiationOffer(negotiationId: string, data: any) {
    return apiClient.post<any>(`/api/negotiations/${negotiationId}/offers`, data);
  },

  async acceptNegotiationOffer(negotiationId: string, offerId: string) {
    return apiClient.put<any>(`/api/negotiations/${negotiationId}/offers/${offerId}/accept`, {});
  },

  async rejectNegotiationOffer(negotiationId: string, offerId: string, reason?: string) {
    return apiClient.put<any>(`/api/negotiations/${negotiationId}/offers/${offerId}/reject`, { reason });
  },

  async scheduleNegotiationMeetup(negotiationId: string, data: any) {
    return apiClient.post<any>(`/api/negotiations/${negotiationId}/meetup`, data);
  },

  async confirmNegotiationMeetup(negotiationId: string) {
    return apiClient.put<any>(`/api/negotiations/${negotiationId}/meetup/confirm`, {});
  },

  async cancelNegotiationMeetup(negotiationId: string, reason: string) {
    return apiClient.put<any>(`/api/negotiations/${negotiationId}/meetup/cancel`, { reason });
  },

  async getNegotiationStrategies() {
    return apiClient.get<any[]>('/api/negotiations/strategies');
  },

  async createNegotiationStrategy(data: any) {
    return apiClient.post<any>('/api/negotiations/strategies', data);
  },

  async updateNegotiationStrategy(id: string, data: any) {
    return apiClient.put<any>(`/api/negotiations/strategies/${id}`, data);
  },

  async deleteNegotiationStrategy(id: string) {
    return apiClient.delete<any>(`/api/negotiations/strategies/${id}`);
  },

  async getSaleTransactions() {
    return apiClient.get<any[]>('/api/transactions');
  },

  async createSaleTransaction(data: any) {
    return apiClient.post<any>('/api/transactions', data);
  },

  async updateTransactionPaymentStatus(transactionId: string, status: string) {
    return apiClient.put<any>(`/api/transactions/${transactionId}/payment`, { status });
  },

  async scheduleTransactionDelivery(transactionId: string, data: any) {
    return apiClient.put<any>(`/api/transactions/${transactionId}/delivery`, data);
  },

  async completeSaleTransaction(transactionId: string) {
    return apiClient.put<any>(`/api/transactions/${transactionId}/complete`, {});
  },

  async generateTransactionReceipt(transactionId: string) {
    return apiClient.post<any>(`/api/transactions/${transactionId}/receipt`, {});
  },

  async generateTransactionContract(transactionId: string) {
    return apiClient.post<any>(`/api/transactions/${transactionId}/contract`, {});
  },

  async generateTransactionInvoice(transactionId: string) {
    return apiClient.post<any>(`/api/transactions/${transactionId}/invoice`, {});
  },

  async getNegotiationMetrics() {
    return apiClient.get<any>('/api/negotiations/metrics');
  },

  // New Post Flow APIs
  async searchItem(data: any) {
    return apiClient.post<any>('/api/post-flow/search-item', data);
  },

  async createPostProject(data: any) {
    return apiClient.post<any>('/api/post-flow/create-project', data);
  },

  async runDeepResearch(data: any) {
    return apiClient.post<any>('/api/post-flow/deep-research', data);
  },

  async generateContent(data: any) {
    return apiClient.post<any>('/api/post-flow/generate-content', data);
  },

  async processImages(data: any) {
    return apiClient.post<any>('/api/post-flow/process-images', data);
  },

  async customizeProject(projectId: string, data: any) {
    return apiClient.put<any>(`/api/post-flow/customize/${projectId}`, data);
  },

  async confirmPost(data: any) {
    return apiClient.post<any>('/api/post-flow/confirm-post', data);
  },

  // Garage Management APIs
  async getGarageItems(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get<any[]>(`/api/garage?${queryString}`);
  },

  async getImageGallery(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get<any[]>(`/api/gallery?${queryString}`);
  },

  async getPostHistory(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return apiClient.get<any[]>(`/api/post-history?${queryString}`);
  },

  // Project Management APIs
  async getPostProjects(userId: string) {
    return apiClient.get<any[]>(`/api/post-projects?userId=${userId}`);
  },

  async getPostProject(projectId: string) {
    return apiClient.get<any>(`/api/post-projects/${projectId}`);
  },

  async updatePostProject(projectId: string, data: any) {
    return apiClient.put<any>(`/api/post-projects/${projectId}`, data);
  },

  async deletePostProject(projectId: string) {
    return apiClient.delete<any>(`/api/post-projects/${projectId}`);
  },

  // Abacus Research APIs
  async getAbacusResearch(researchId: string) {
    return apiClient.get<any>(`/api/abacus-research/${researchId}`);
  },

  async getAbacusResearchByProject(projectId: string) {
    return apiClient.get<any[]>(`/api/abacus-research?projectId=${projectId}`);
  },

  // CloudFlare Integration APIs
  async uploadImageToCloudFlare(data: any) {
    return apiClient.post<any>('/api/cloudflare/upload', data);
  },

  async optimizeImage(imageId: string, options: any) {
    return apiClient.post<any>(`/api/cloudflare/optimize/${imageId}`, options);
  },

  async generateImageVariants(imageId: string, variants: any) {
    return apiClient.post<any>(`/api/cloudflare/variants/${imageId}`, variants);
  }
};
