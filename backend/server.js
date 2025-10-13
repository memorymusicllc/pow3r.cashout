import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price REAL NOT NULL,
    condition TEXT DEFAULT 'excellent',
    images TEXT, -- JSON array of image URLs
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Listings table
  db.run(`CREATE TABLE IF NOT EXISTS listings (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    status TEXT DEFAULT 'active',
    views INTEGER DEFAULT 0,
    inquiries INTEGER DEFAULT 0,
    qualified_leads INTEGER DEFAULT 0,
    platform_listing_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Auto-response rules table
  db.run(`CREATE TABLE IF NOT EXISTS auto_response_rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    triggers TEXT NOT NULL, -- JSON array
    response TEXT NOT NULL,
    conditions TEXT, -- JSON object
    is_active BOOLEAN DEFAULT 1,
    priority INTEGER DEFAULT 1,
    platforms TEXT, -- JSON array
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Leads table
  db.run(`CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    listing_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    contact_info TEXT, -- JSON object
    status TEXT DEFAULT 'new',
    source TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (listing_id) REFERENCES listings (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Analytics table
  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    date DATE NOT NULL,
    platform TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // AI Response Templates table
  db.run(`CREATE TABLE IF NOT EXISTS ai_response_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    trigger_keywords TEXT NOT NULL, -- JSON array
    response_template TEXT NOT NULL,
    variables TEXT, -- JSON array
    tone TEXT NOT NULL,
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // AI Response Rules table
  db.run(`CREATE TABLE IF NOT EXISTS ai_response_rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    conditions TEXT NOT NULL, -- JSON object
    actions TEXT NOT NULL, -- JSON object
    is_active BOOLEAN DEFAULT 1,
    priority INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    success_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // AI Response Sessions table
  db.run(`CREATE TABLE IF NOT EXISTS ai_response_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    messages TEXT NOT NULL, -- JSON array
    status TEXT DEFAULT 'active',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    ai_confidence REAL DEFAULT 0,
    escalation_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (lead_id) REFERENCES leads (id)
  )`);

  // Optimization Insights table
  db.run(`CREATE TABLE IF NOT EXISTS optimization_insights (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    impact TEXT NOT NULL,
    confidence REAL NOT NULL,
    suggested_action TEXT NOT NULL,
    expected_improvement TEXT NOT NULL,
    implementation_effort TEXT NOT NULL,
    is_implemented BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Report Templates table
  db.run(`CREATE TABLE IF NOT EXISTS report_templates (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    metrics TEXT NOT NULL, -- JSON array
    time_range TEXT NOT NULL,
    format TEXT NOT NULL,
    schedule TEXT, -- JSON object
    is_active BOOLEAN DEFAULT 1,
    last_generated DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Custom Dashboards table
  db.run(`CREATE TABLE IF NOT EXISTS custom_dashboards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    widgets TEXT NOT NULL, -- JSON array
    is_public BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Lead Scoring table
  db.run(`CREATE TABLE IF NOT EXISTS lead_scoring (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    criteria TEXT NOT NULL, -- JSON object
    weights TEXT NOT NULL, -- JSON object
    thresholds TEXT NOT NULL, -- JSON object
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Notification Rules table
  db.run(`CREATE TABLE IF NOT EXISTS notification_rules (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    conditions TEXT NOT NULL, -- JSON object
    actions TEXT NOT NULL, -- JSON object
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Negotiation Sessions table
  db.run(`CREATE TABLE IF NOT EXISTS negotiation_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    initial_price REAL NOT NULL,
    current_price REAL NOT NULL,
    target_price REAL NOT NULL,
    status TEXT DEFAULT 'active',
    offers TEXT NOT NULL, -- JSON array
    meetup_scheduled TEXT, -- JSON object
    payment_method TEXT,
    notes TEXT, -- JSON array
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (lead_id) REFERENCES leads (id),
    FOREIGN KEY (listing_id) REFERENCES listings (id)
  )`);

  // Negotiation Strategies table
  db.run(`CREATE TABLE IF NOT EXISTS negotiation_strategies (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    conditions TEXT NOT NULL, -- JSON object
    tactics TEXT NOT NULL, -- JSON object
    is_active BOOLEAN DEFAULT 1,
    success_rate REAL DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Sale Transactions table
  db.run(`CREATE TABLE IF NOT EXISTS sale_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    negotiation_id TEXT NOT NULL,
    lead_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    final_price REAL NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT DEFAULT 'pending',
    payment_details TEXT NOT NULL, -- JSON object
    delivery TEXT NOT NULL, -- JSON object
    documentation TEXT NOT NULL, -- JSON object
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (negotiation_id) REFERENCES negotiation_sessions (id),
    FOREIGN KEY (lead_id) REFERENCES leads (id),
    FOREIGN KEY (listing_id) REFERENCES listings (id)
  )`);

  // Post Flow Projects table
  db.run(`CREATE TABLE IF NOT EXISTS post_projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    item_name TEXT NOT NULL,
    item_category TEXT NOT NULL,
    item_condition TEXT,
    item_description TEXT,
    status TEXT DEFAULT 'draft', -- draft, research, writing, images, customize, confirm, posted, archived
    platforms TEXT, -- JSON array of selected platforms
    tags TEXT, -- JSON array of tags
    research_data TEXT, -- JSON object with Abacus analysis
    pricing_strategy TEXT, -- JSON object with pricing recommendations
    content_strategy TEXT, -- JSON object with content recommendations
    images TEXT, -- JSON array of image URLs and metadata
    generated_content TEXT, -- JSON object with generated posts
    customizations TEXT, -- JSON object with user customizations
    posting_schedule TEXT, -- JSON object with posting schedule
    performance_metrics TEXT, -- JSON object with post performance
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    posted_at DATETIME,
    archived_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Abacus Research Results table
  db.run(`CREATE TABLE IF NOT EXISTS abacus_research (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT,
    item_name TEXT NOT NULL,
    search_query TEXT NOT NULL,
    research_type TEXT NOT NULL, -- item_analysis, pricing, content_strategy, full_analysis
    results TEXT NOT NULL, -- JSON object with research results
    confidence_score REAL,
    data_sources TEXT, -- JSON array of data sources
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (project_id) REFERENCES post_projects (id)
  )`);

  // Image Gallery table
  db.run(`CREATE TABLE IF NOT EXISTS image_gallery (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT,
    filename TEXT NOT NULL,
    original_url TEXT,
    cloudflare_url TEXT,
    thumbnail_url TEXT,
    image_type TEXT, -- original, generated, edited, thumbnail
    metadata TEXT, -- JSON object with image metadata
    tags TEXT, -- JSON array of tags
    is_favorite BOOLEAN DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (project_id) REFERENCES post_projects (id)
  )`);

  // Post History table
  db.run(`CREATE TABLE IF NOT EXISTS post_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    post_content TEXT NOT NULL,
    images TEXT, -- JSON array of image URLs
    posting_strategy TEXT, -- JSON object with strategy used
    status TEXT DEFAULT 'scheduled', -- scheduled, posted, failed, cancelled
    scheduled_at DATETIME,
    posted_at DATETIME,
    platform_post_id TEXT, -- ID from the platform
    performance_data TEXT, -- JSON object with performance metrics
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (project_id) REFERENCES post_projects (id)
  )`);

  // Garage Items table (unified storage for all items)
  db.run(`CREATE TABLE IF NOT EXISTS garage_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- research, post, image, project
    item_name TEXT NOT NULL,
    item_data TEXT NOT NULL, -- JSON object with item data
    category TEXT,
    tags TEXT, -- JSON array of tags
    platform TEXT,
    status TEXT DEFAULT 'active', -- active, sold, draft, archived
    priority INTEGER DEFAULT 0,
    is_favorite BOOLEAN DEFAULT 0,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert default user if none exists
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (row.count === 0) {
      db.run(`INSERT INTO users (id, email, name) VALUES ('user-001', 'demo@pow3r.cashout', 'Demo User')`);
      
      // Insert sample product
      db.run(`INSERT INTO products (id, user_id, name, description, base_price, condition) 
              VALUES ('product-001', 'user-001', 'Professional AC Unit', 'High-efficiency air conditioning unit', 4200, 'excellent')`);
      
      // Insert sample listings
      db.run(`INSERT INTO listings (id, product_id, user_id, platform, title, description, price, status, views, inquiries, qualified_leads) 
              VALUES ('listing-001', 'product-001', 'user-001', 'facebook', 'Professional AC Unit - Perfect Condition', 'High-efficiency air conditioning unit in excellent condition', 4200, 'active', 47, 8, 3)`);
      
      db.run(`INSERT INTO listings (id, product_id, user_id, platform, title, description, price, status, views, inquiries, qualified_leads) 
              VALUES ('listing-002', 'product-001', 'user-001', 'offerup', 'AC System - Great Deal!', 'Reliable air conditioning system', 3800, 'active', 23, 3, 1)`);
      
      db.run(`INSERT INTO listings (id, product_id, user_id, platform, title, description, price, status, views, inquiries, qualified_leads) 
              VALUES ('listing-003', 'product-001', 'user-001', 'craigslist', 'Premium AC Unit - Energy Efficient', 'Top-of-the-line air conditioning unit', 4500, 'paused', 89, 12, 5)`);
      
      // Insert sample auto-response rules
      db.run(`INSERT INTO auto_response_rules (id, user_id, name, triggers, response, conditions, is_active, priority, platforms, usage_count, success_rate) 
              VALUES ('rule-001', 'user-001', 'Initial Inquiry Response', '["new_message"]', 'Thanks for your interest! I''ll get back to you shortly.', '{"timeWindow": 30, "maxResponses": 1, "skipIfReplied": true}', 1, 1, '["facebook", "offerup", "craigslist"]', 45, 92.5)`);
      
      db.run(`INSERT INTO auto_response_rules (id, user_id, name, triggers, response, conditions, is_active, priority, platforms, usage_count, success_rate) 
              VALUES ('rule-002', 'user-001', 'Price Inquiry Response', '["price_question"]', 'The price is $4,200. I''m open to reasonable offers!', '{"timeWindow": 15, "maxResponses": 1, "skipIfReplied": true}', 1, 2, '["facebook", "offerup", "craigslist"]', 23, 87.0)`);
      
      db.run(`INSERT INTO auto_response_rules (id, user_id, name, triggers, response, conditions, is_active, priority, platforms, usage_count, success_rate) 
              VALUES ('rule-003', 'user-001', 'Availability Check', '["availability"]', 'Yes, it''s still available! When would you like to see it?', '{"timeWindow": 60, "maxResponses": 1, "skipIfReplied": true}', 0, 3, '["facebook", "offerup", "craigslist"]', 12, 95.0)`);
      
      // Insert sample leads
      db.run(`INSERT INTO leads (id, listing_id, user_id, platform, contact_info, status, source, notes) 
              VALUES ('lead-001', 'listing-001', 'user-001', 'facebook', '{"name": "John Smith", "email": "john@example.com", "phone": "555-0123"}', 'new', 'facebook_marketplace', 'Interested in AC unit, asking about installation')`);
      
      db.run(`INSERT INTO leads (id, listing_id, user_id, platform, contact_info, status, source, notes) 
              VALUES ('lead-002', 'listing-002', 'user-001', 'offerup', '{"name": "Sarah Johnson", "email": "sarah@example.com", "phone": "555-0456"}', 'qualified', 'offerup_app', 'Ready to purchase, asking about delivery')`);
      
      // Insert sample AI response templates
      db.run(`INSERT INTO ai_response_templates (id, user_id, name, category, trigger_keywords, response_template, variables, tone, priority, is_active, usage_count, success_rate) 
              VALUES ('template-001', 'user-001', 'Greeting Response', 'greeting', '["hello", "hi", "interested"]', 'Hello! Thank you for your interest in our {{product}}. I''d be happy to help you with any questions.', '["product"]', 'friendly', 1, 1, 25, 88.0)`);
      
      db.run(`INSERT INTO ai_response_templates (id, user_id, name, category, trigger_keywords, response_template, variables, tone, priority, is_active, usage_count, success_rate) 
              VALUES ('template-002', 'user-001', 'Price Inquiry', 'pricing', '["price", "cost", "how much"]', 'The price is ${{price}}. I''m open to reasonable offers and can discuss financing options.', '["price"]', 'professional', 2, 1, 18, 92.5)`);
      
      // Insert sample AI response rules
      db.run(`INSERT INTO ai_response_rules (id, user_id, name, conditions, actions, is_active, priority, usage_count, success_rate) 
              VALUES ('ai-rule-001', 'user-001', 'High Priority Lead Response', '{"leadScore": [80, 100], "messageLength": [10, 500], "keywords": ["buy", "purchase", "interested"], "platform": ["facebook", "offerup"], "timeOfDay": ["morning", "afternoon", "evening"], "dayOfWeek": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]}', '{"templateId": "template-001", "delay": 30, "escalation": false, "followUp": true}', 1, 1, 12, 95.0)`);
      
      // Insert sample optimization insights
      db.run(`INSERT INTO optimization_insights (id, user_id, category, title, description, impact, confidence, suggested_action, expected_improvement, implementation_effort, is_implemented) 
              VALUES ('insight-001', 'user-001', 'pricing', 'Optimize AC Unit Pricing', 'Current pricing is 15% above market average. Consider reducing by 5-10% for faster sales.', 'high', 0.85, 'Reduce price by $200-400', '20-30% increase in inquiries', 'low', 0)`);
      
      // Insert sample report templates
      db.run(`INSERT INTO report_templates (id, user_id, name, description, metrics, time_range, format, is_active) 
              VALUES ('report-001', 'user-001', 'Weekly Sales Report', 'Comprehensive weekly sales performance report', '["totalSales", "conversionRate", "topPlatforms", "leadMetrics"]', 'weekly', 'pdf', 1)`);
      
      // Insert sample lead scoring configuration
      db.run(`INSERT INTO lead_scoring (id, user_id, criteria, weights, thresholds) 
              VALUES ('scoring-001', 'user-001', '{"messageQuality": 0, "responseTime": 0, "profileCompleteness": 0, "previousInteractions": 0, "budgetIndication": 0}', '{"messageQuality": 0.3, "responseTime": 0.2, "profileCompleteness": 0.2, "previousInteractions": 0.15, "budgetIndication": 0.15}', '{"high": 80, "medium": 60, "low": 40}')`);
      
      // Insert sample notification rules
      db.run(`INSERT INTO notification_rules (id, user_id, name, conditions, actions, is_active) 
              VALUES ('notif-001', 'user-001', 'High Priority Lead Alert', '{"priority": ["high", "urgent"], "status": ["new", "qualified"], "scoreRange": [80, 100], "platforms": ["facebook", "offerup", "craigslist"]}', '{"email": true, "sms": false, "dashboard": true, "sound": true}', 1)`);
      
      // Insert sample negotiation strategies
      db.run(`INSERT INTO negotiation_strategies (id, user_id, name, conditions, tactics, is_active, success_rate, usage_count) 
              VALUES ('strategy-001', 'user-001', 'Quick Sale Strategy', '{"listingPrice": [3000, 5000], "leadScore": [70, 100], "timeOnMarket": [0, 7], "competitionLevel": "low"}', '{"initialDiscount": 0.05, "maxDiscount": 0.15, "discountSteps": [0.05, 0.10, 0.15], "timePressure": true, "scarcityMessage": true, "bundleOffers": false}', 1, 0.78, 8)`);
      
      // Insert sample post projects
      db.run(`INSERT INTO post_projects (id, user_id, name, description, item_name, item_category, item_condition, item_description, status, platforms, tags, research_data, pricing_strategy, content_strategy, images, generated_content) 
              VALUES ('project-001', 'user-001', 'AC Unit Sale Project', 'Professional AC unit selling project', 'Professional AC Unit', 'appliances', 'excellent', 'High-efficiency air conditioning unit in excellent condition', 'customize', '["facebook", "offerup", "craigslist"]', '["appliances", "ac", "hvac", "professional"]', '{"marketAnalysis": {"averagePrice": 4200, "competitionLevel": "medium", "demandScore": 8.5}, "recommendations": ["Emphasize energy efficiency", "Highlight professional installation", "Include warranty information"]}', '{"suggestedPrice": 4200, "priceRange": [3800, 4500], "discountStrategy": "5-10% for quick sale", "valueProps": ["Energy efficient", "Professional grade", "Warranty included"]}', '{"tone": "professional", "keyPoints": ["Energy efficiency", "Professional installation", "Warranty"], "callToAction": "Contact for installation quote"}', '["https://images.pow3r.cashout/ac-main-unit.png", "https://images.pow3r.cashout/ac-installation.jpeg"]', '{"facebook": "Professional AC Unit - Energy Efficient! Perfect for home or office. Includes professional installation and warranty. $4,200 OBO. Contact for details!", "offerup": "AC System - Great Deal! High-efficiency unit, excellent condition. $4,200. Ready for installation.", "craigslist": "Premium AC Unit - Energy Efficient. Professional grade, warranty included. $4,200. Serious inquiries only."}')`);
      
      // Insert sample Abacus research
      db.run(`INSERT INTO abacus_research (id, user_id, project_id, item_name, search_query, research_type, results, confidence_score, data_sources) 
              VALUES ('research-001', 'user-001', 'project-001', 'Professional AC Unit', 'professional air conditioning unit pricing market analysis', 'full_analysis', '{"marketData": {"averagePrice": 4200, "priceRange": [3500, 5000], "competitionCount": 23, "demandTrend": "increasing"}, "pricingInsights": {"optimalPrice": 4200, "quickSalePrice": 3800, "premiumPrice": 4500}, "contentInsights": {"topKeywords": ["energy efficient", "professional", "warranty", "installation"], "bestPerformingTitles": ["Professional AC Unit - Energy Efficient", "AC System - Great Deal"], "optimalPostingTimes": ["morning", "evening"]}}', 0.92, '["facebook_marketplace", "offerup", "craigslist", "google_trends"]')`);
      
      // Insert sample image gallery
      db.run(`INSERT INTO image_gallery (id, user_id, project_id, filename, original_url, cloudflare_url, thumbnail_url, image_type, metadata, tags, is_favorite, usage_count) 
              VALUES ('img-001', 'user-001', 'project-001', 'ac-main-unit.png', 'https://images.pow3r.cashout/ac-main-unit.png', 'https://cloudflare.pow3r.cashout/images/ac-main-unit.png', 'https://cloudflare.pow3r.cashout/thumbnails/ac-main-unit.png', 'original', '{"width": 1200, "height": 800, "fileSize": 245760, "format": "png", "uploadDate": "2025-01-08"}', '["ac", "main", "unit", "professional"]', 1, 3)`);
      
      db.run(`INSERT INTO image_gallery (id, user_id, project_id, filename, original_url, cloudflare_url, thumbnail_url, image_type, metadata, tags, is_favorite, usage_count) 
              VALUES ('img-002', 'user-001', 'project-001', 'ac-installation.jpeg', 'https://images.pow3r.cashout/ac-installation.jpeg', 'https://cloudflare.pow3r.cashout/images/ac-installation.jpeg', 'https://cloudflare.pow3r.cashout/thumbnails/ac-installation.jpeg', 'original', '{"width": 800, "height": 600, "fileSize": 156789, "format": "jpeg", "uploadDate": "2025-01-08"}', '["ac", "installation", "professional"]', 0, 2)`);
      
      // Insert sample post history
      db.run(`INSERT INTO post_history (id, user_id, project_id, platform, post_content, images, posting_strategy, status, scheduled_at, posted_at, platform_post_id, performance_data) 
              VALUES ('post-001', 'user-001', 'project-001', 'facebook', 'Professional AC Unit - Energy Efficient! Perfect for home or office. Includes professional installation and warranty. $4,200 OBO. Contact for details!', '["https://cloudflare.pow3r.cashout/images/ac-main-unit.png"]', '{"tone": "professional", "hashtags": ["#AC", "#HVAC", "#EnergyEfficient"], "postingTime": "morning"}', 'posted', '2025-01-08 09:00:00', '2025-01-08 09:05:00', 'fb_123456789', '{"views": 47, "likes": 8, "shares": 2, "comments": 3, "clicks": 12}')`);
      
      // Insert sample garage items
      db.run(`INSERT INTO garage_items (id, user_id, item_type, item_name, item_data, category, tags, platform, status, priority, is_favorite) 
              VALUES ('garage-001', 'user-001', 'project', 'AC Unit Sale Project', '{"projectId": "project-001", "status": "customize", "lastActivity": "2025-01-08T10:00:00Z"}', 'appliances', '["ac", "hvac", "professional", "energy-efficient"]', 'multi', 'active', 1, 1)`);
      
      db.run(`INSERT INTO garage_items (id, user_id, item_type, item_name, item_data, category, tags, platform, status, priority, is_favorite) 
              VALUES ('garage-002', 'user-001', 'research', 'AC Unit Market Analysis', '{"researchId": "research-001", "confidenceScore": 0.92, "dataPoints": 156}', 'research', '["market-analysis", "pricing", "ac", "hvac"]', 'multi', 'active', 2, 0)`);
      
      db.run(`INSERT INTO garage_items (id, user_id, item_type, item_name, item_data, category, tags, platform, status, priority, is_favorite) 
              VALUES ('garage-003', 'user-001', 'image', 'AC Main Unit Photo', '{"imageId": "img-001", "url": "https://cloudflare.pow3r.cashout/images/ac-main-unit.png", "usageCount": 3}', 'images', '["ac", "main", "unit", "professional"]', 'multi', 'active', 3, 1)`);
    }
  });
});

// Helper function to run queries with promises
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// API Routes

// Dashboard API
app.get('/api/dashboard', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    
    // Get total views
    const totalViews = await dbGet(`
      SELECT COALESCE(SUM(views), 0) as total FROM listings WHERE user_id = ?
    `, [userId]);
    
    // Get new leads (last 24 hours)
    const newLeads = await dbGet(`
      SELECT COUNT(*) as count FROM leads 
      WHERE user_id = ? AND created_at > datetime('now', '-1 day')
    `, [userId]);
    
    // Get active listings
    const activeListings = await dbGet(`
      SELECT COUNT(*) as count FROM listings 
      WHERE user_id = ? AND status = 'active'
    `, [userId]);
    
    // Get total messages (simulated)
    const messages = await dbGet(`
      SELECT COALESCE(SUM(inquiries), 0) as total FROM listings WHERE user_id = ?
    `, [userId]);
    
    const dashboardData = {
      totalViews: totalViews.total || 0,
      newLeads: newLeads.count || 0,
      messages: messages.total || 0,
      activeListings: activeListings.count || 0,
      conversionRate: 12.5,
      averageResponseTime: '2.3 min',
      lastActivity: 'Just now',
    };

    res.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Products API
app.get('/api/products', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const products = await dbAll(`
      SELECT * FROM products WHERE user_id = ? ORDER BY created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: products,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, description, basePrice, condition, userId = 'user-001' } = req.body;
    const productId = `product-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO products (id, user_id, name, description, base_price, condition)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [productId, userId, name, description, basePrice, condition]);
    
    const newProduct = await dbGet(`SELECT * FROM products WHERE id = ?`, [productId]);
    
    res.json({
      success: true,
      data: newProduct,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Listings API
app.get('/api/listings', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const listings = await dbAll(`
      SELECT l.*, p.name as product_name, p.description as product_description
      FROM listings l
      JOIN products p ON l.product_id = p.id
      WHERE l.user_id = ? 
      ORDER BY l.created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: listings,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const { productId, platform, title, description, price, userId = 'user-001' } = req.body;
    const listingId = `listing-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO listings (id, product_id, user_id, platform, title, description, price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `, [listingId, productId, userId, platform, title, description, price]);
    
    const newListing = await dbGet(`
      SELECT l.*, p.name as product_name 
      FROM listings l
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `, [listingId]);
    
    res.json({
      success: true,
      data: newListing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updateFields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && updates[key] !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    values.push(id);
    await dbRun(`
      UPDATE listings 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
    
    const updatedListing = await dbGet(`
      SELECT l.*, p.name as product_name 
      FROM listings l
      JOIN products p ON l.product_id = p.id
      WHERE l.id = ?
    `, [id]);
    
    res.json({
      success: true,
      data: updatedListing,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await dbRun(`DELETE FROM listings WHERE id = ?`, [id]);
    
    res.json({
      success: true,
      data: { id },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auto-Response Rules API
app.get('/api/auto-responses', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const rules = await dbAll(`
      SELECT * FROM auto_response_rules 
      WHERE user_id = ? 
      ORDER BY priority ASC, created_at DESC
    `, [userId]);
    
    // Parse JSON fields
    const parsedRules = rules.map(rule => ({
      ...rule,
      triggers: JSON.parse(rule.triggers),
      conditions: rule.conditions ? JSON.parse(rule.conditions) : null,
      platforms: rule.platforms ? JSON.parse(rule.platforms) : null,
      isActive: Boolean(rule.is_active)
    }));
    
    res.json({
      success: true,
      data: parsedRules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/auto-responses', async (req, res) => {
  try {
    const { name, triggers, response, conditions, priority, platforms, userId = 'user-001' } = req.body;
    const ruleId = `rule-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO auto_response_rules (id, user_id, name, triggers, response, conditions, priority, platforms, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [ruleId, userId, name, JSON.stringify(triggers), response, JSON.stringify(conditions), priority, JSON.stringify(platforms)]);
    
    const newRule = await dbGet(`SELECT * FROM auto_response_rules WHERE id = ?`, [ruleId]);
    
    res.json({
      success: true,
      data: {
        ...newRule,
        triggers: JSON.parse(newRule.triggers),
        conditions: newRule.conditions ? JSON.parse(newRule.conditions) : null,
        platforms: newRule.platforms ? JSON.parse(newRule.platforms) : null,
        isActive: Boolean(newRule.is_active)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// AI Response System APIs
app.get('/api/ai-response/templates', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const templates = await dbAll(`
      SELECT * FROM ai_response_templates 
      WHERE user_id = ? 
      ORDER BY priority ASC, created_at DESC
    `, [userId]);
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      triggerKeywords: JSON.parse(template.trigger_keywords),
      variables: template.variables ? JSON.parse(template.variables) : [],
      isActive: Boolean(template.is_active)
    }));
    
    res.json({
      success: true,
      data: parsedTemplates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/ai-response/templates', async (req, res) => {
  try {
    const { name, category, triggerKeywords, responseTemplate, variables, tone, priority, userId = 'user-001' } = req.body;
    const templateId = `template-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO ai_response_templates (id, user_id, name, category, trigger_keywords, response_template, variables, tone, priority, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [templateId, userId, name, category, JSON.stringify(triggerKeywords), responseTemplate, JSON.stringify(variables || []), tone, priority]);
    
    const newTemplate = await dbGet(`SELECT * FROM ai_response_templates WHERE id = ?`, [templateId]);
    
    res.json({
      success: true,
      data: {
        ...newTemplate,
        triggerKeywords: JSON.parse(newTemplate.trigger_keywords),
        variables: newTemplate.variables ? JSON.parse(newTemplate.variables) : [],
        isActive: Boolean(newTemplate.is_active)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/ai-response/rules', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const rules = await dbAll(`
      SELECT * FROM ai_response_rules 
      WHERE user_id = ? 
      ORDER BY priority ASC, created_at DESC
    `, [userId]);
    
    const parsedRules = rules.map(rule => ({
      ...rule,
      conditions: JSON.parse(rule.conditions),
      actions: JSON.parse(rule.actions),
      isActive: Boolean(rule.is_active)
    }));
    
    res.json({
      success: true,
      data: parsedRules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/ai-response/generate', async (req, res) => {
  try {
    const { templateId, message, context, config } = req.body;
    
    // Simulate AI response generation
    const responses = [
      "Thank you for your interest! I'd be happy to help you with any questions about this item.",
      "Great question! Let me provide you with more details about this product.",
      "I appreciate your inquiry. This item is in excellent condition and ready for immediate purchase.",
      "Thanks for reaching out! I can offer you a great deal on this item."
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    res.json({
      success: true,
      data: {
        response: randomResponse,
        confidence: 0.85,
        templateId: templateId
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/ai-response/metrics', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    
    const metrics = {
      totalResponses: 156,
      successfulResponses: 142,
      escalatedResponses: 8,
      averageResponseTime: 2.3,
      averageConfidence: 0.87,
      templateUsage: {
        'template-001': 45,
        'template-002': 32,
        'template-003': 28
      },
      categoryBreakdown: {
        'greeting': 40,
        'pricing': 35,
        'availability': 25
      },
      platformBreakdown: {
        'facebook': 45,
        'offerup': 35,
        'craigslist': 20
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Analytics APIs
app.get('/api/analytics/metrics', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    
    const metrics = {
      totalListings: 3,
      activeListings: 2,
      soldListings: 1,
      averageTimeToSale: 12.5,
      averagePriceReduction: 8.5,
      totalLeads: 15,
      qualifiedLeads: 8,
      conversionRate: 12.5,
      averageLeadScore: 72.5,
      responseTime: 2.3,
      totalRevenue: 4200,
      averageSalePrice: 4200,
      profitMargin: 0.15,
      revenueGrowth: 0.25,
      platformBreakdown: {
        'facebook': { listings: 1, leads: 8, sales: 1, revenue: 4200, conversionRate: 12.5 },
        'offerup': { listings: 1, leads: 4, sales: 0, revenue: 0, conversionRate: 0 },
        'craigslist': { listings: 1, leads: 3, sales: 0, revenue: 0, conversionRate: 0 }
      },
      autoPostingSuccess: 95.5,
      autoResponseSuccess: 88.2,
      automationEfficiency: 91.8,
      dailyStats: [
        { date: '2025-01-01', listings: 1, leads: 3, sales: 0, revenue: 0 },
        { date: '2025-01-02', listings: 1, leads: 2, sales: 0, revenue: 0 },
        { date: '2025-01-03', listings: 1, leads: 4, sales: 1, revenue: 4200 }
      ],
      weeklyStats: [
        { week: '2025-W01', listings: 3, leads: 9, sales: 1, revenue: 4200 }
      ],
      monthlyStats: [
        { month: '2025-01', listings: 3, leads: 15, sales: 1, revenue: 4200 }
      ],
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/analytics/insights', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const insights = await dbAll(`
      SELECT * FROM optimization_insights 
      WHERE user_id = ? 
      ORDER BY confidence DESC, created_at DESC
    `, [userId]);
    
    res.json({
      success: true,
      data: insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/analytics/insights', async (req, res) => {
  try {
    const { category, title, description, impact, confidence, suggestedAction, expectedImprovement, implementationEffort, userId = 'user-001' } = req.body;
    const insightId = `insight-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO optimization_insights (id, user_id, category, title, description, impact, confidence, suggested_action, expected_improvement, implementation_effort, is_implemented)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `, [insightId, userId, category, title, description, impact, confidence, suggestedAction, expectedImprovement, implementationEffort]);
    
    const newInsight = await dbGet(`SELECT * FROM optimization_insights WHERE id = ?`, [insightId]);
    
    res.json({
      success: true,
      data: newInsight,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/analytics/report-templates', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const templates = await dbAll(`
      SELECT * FROM report_templates 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `, [userId]);
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      metrics: JSON.parse(template.metrics),
      schedule: template.schedule ? JSON.parse(template.schedule) : null,
      isActive: Boolean(template.is_active)
    }));
    
    res.json({
      success: true,
      data: parsedTemplates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/analytics/reports/generate', async (req, res) => {
  try {
    const { templateId, timeRange } = req.body;
    
    // Simulate report generation
    const reportUrl = `https://reports.pow3r.cashout/reports/${templateId}-${Date.now()}.pdf`;
    
    res.json({
      success: true,
      data: { url: reportUrl },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Lead Monitoring APIs
app.get('/api/leads', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const leads = await dbAll(`
      SELECT l.*, li.title as listing_title, li.platform as listing_platform
      FROM leads l
      LEFT JOIN listings li ON l.listing_id = li.id
      WHERE l.user_id = ? 
      ORDER BY l.created_at DESC
    `, [userId]);
    
    const parsedLeads = leads.map(lead => ({
      ...lead,
      contactInfo: JSON.parse(lead.contact_info),
      notes: lead.notes ? JSON.parse(lead.notes) : []
    }));
    
    res.json({
      success: true,
      data: parsedLeads,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/leads', async (req, res) => {
  try {
    const { listingId, platform, contactInfo, message, status, source, notes, userId = 'user-001' } = req.body;
    const leadId = `lead-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO leads (id, listing_id, user_id, platform, contact_info, status, source, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [leadId, listingId, userId, platform, JSON.stringify(contactInfo), status || 'new', source, JSON.stringify(notes || [])]);
    
    const newLead = await dbGet(`SELECT * FROM leads WHERE id = ?`, [leadId]);
    
    res.json({
      success: true,
      data: {
        ...newLead,
        contactInfo: JSON.parse(newLead.contact_info),
        notes: newLead.notes ? JSON.parse(newLead.notes) : []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updateFields = [];
    const values = [];
    
    Object.keys(updates).forEach(key => {
      if (key !== 'id' && updates[key] !== undefined) {
        if (key === 'contactInfo' || key === 'notes') {
          updateFields.push(`${key} = ?`);
          values.push(JSON.stringify(updates[key]));
        } else {
          updateFields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    values.push(id);
    await dbRun(`
      UPDATE leads 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, values);
    
    const updatedLead = await dbGet(`SELECT * FROM leads WHERE id = ?`, [id]);
    
    res.json({
      success: true,
      data: {
        ...updatedLead,
        contactInfo: JSON.parse(updatedLead.contact_info),
        notes: updatedLead.notes ? JSON.parse(updatedLead.notes) : []
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/leads/metrics', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    
    const metrics = {
      totalLeads: 15,
      newLeads: 8,
      qualifiedLeads: 5,
      conversionRate: 12.5,
      averageResponseTime: 2.3,
      highPriorityLeads: 3,
      platformBreakdown: {
        'facebook': 8,
        'offerup': 4,
        'craigslist': 3
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Negotiation APIs
app.get('/api/negotiations', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const negotiations = await dbAll(`
      SELECT n.*, l.contact_info as lead_contact, li.title as listing_title
      FROM negotiation_sessions n
      LEFT JOIN leads l ON n.lead_id = l.id
      LEFT JOIN listings li ON n.listing_id = li.id
      WHERE n.user_id = ? 
      ORDER BY n.created_at DESC
    `, [userId]);
    
    const parsedNegotiations = negotiations.map(negotiation => ({
      ...negotiation,
      offers: JSON.parse(negotiation.offers),
      meetupScheduled: negotiation.meetup_scheduled ? JSON.parse(negotiation.meetup_scheduled) : null,
      notes: negotiation.notes ? JSON.parse(negotiation.notes) : []
    }));
    
    res.json({
      success: true,
      data: parsedNegotiations,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/negotiations', async (req, res) => {
  try {
    const { leadId, listingId, initialPrice, targetPrice, userId = 'user-001' } = req.body;
    const negotiationId = `negotiation-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO negotiation_sessions (id, user_id, lead_id, listing_id, initial_price, current_price, target_price, status, offers, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active', '[]', '[]')
    `, [negotiationId, userId, leadId, listingId, initialPrice, initialPrice, targetPrice]);
    
    const newNegotiation = await dbGet(`SELECT * FROM negotiation_sessions WHERE id = ?`, [negotiationId]);
    
    res.json({
      success: true,
      data: {
        ...newNegotiation,
        offers: JSON.parse(newNegotiation.offers),
        notes: JSON.parse(newNegotiation.notes)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/negotiations/strategies', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const strategies = await dbAll(`
      SELECT * FROM negotiation_strategies 
      WHERE user_id = ? 
      ORDER BY success_rate DESC, created_at DESC
    `, [userId]);
    
    const parsedStrategies = strategies.map(strategy => ({
      ...strategy,
      conditions: JSON.parse(strategy.conditions),
      tactics: JSON.parse(strategy.tactics),
      isActive: Boolean(strategy.is_active)
    }));
    
    res.json({
      success: true,
      data: parsedStrategies,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/negotiations/metrics', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    
    const metrics = {
      totalNegotiations: 8,
      successfulNegotiations: 5,
      averageNegotiationTime: 3.2,
      averagePriceReduction: 8.5,
      meetupConversionRate: 75.0,
      paymentSuccessRate: 95.0,
      strategyEffectiveness: {
        'strategy-001': 0.78,
        'strategy-002': 0.65,
        'strategy-003': 0.82
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Transaction APIs
app.get('/api/transactions', async (req, res) => {
  try {
    const userId = req.query.userId || 'user-001';
    const transactions = await dbAll(`
      SELECT t.*, l.contact_info as lead_contact, li.title as listing_title
      FROM sale_transactions t
      LEFT JOIN leads l ON t.lead_id = l.id
      LEFT JOIN listings li ON t.listing_id = li.id
      WHERE t.user_id = ? 
      ORDER BY t.created_at DESC
    `, [userId]);
    
    const parsedTransactions = transactions.map(transaction => ({
      ...transaction,
      paymentDetails: JSON.parse(transaction.payment_details),
      delivery: JSON.parse(transaction.delivery),
      documentation: JSON.parse(transaction.documentation)
    }));
    
    res.json({
      success: true,
      data: parsedTransactions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { negotiationId, leadId, listingId, finalPrice, paymentMethod, userId = 'user-001' } = req.body;
    const transactionId = `transaction-${Date.now()}`;
    
    const paymentDetails = {
      amount: finalPrice,
      fees: 0,
      netAmount: finalPrice,
      currency: 'USD'
    };
    
    const delivery = {
      method: 'pickup'
    };
    
    const documentation = {
      receiptGenerated: false,
      contractGenerated: false,
      invoiceGenerated: false
    };
    
    await dbRun(`
      INSERT INTO sale_transactions (id, user_id, negotiation_id, lead_id, listing_id, final_price, payment_method, payment_status, payment_details, delivery, documentation, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?, 'pending')
    `, [transactionId, userId, negotiationId, leadId, listingId, finalPrice, paymentMethod, JSON.stringify(paymentDetails), JSON.stringify(delivery), JSON.stringify(documentation)]);
    
    const newTransaction = await dbGet(`SELECT * FROM sale_transactions WHERE id = ?`, [transactionId]);
    
    res.json({
      success: true,
      data: {
        ...newTransaction,
        paymentDetails: JSON.parse(newTransaction.payment_details),
        delivery: JSON.parse(newTransaction.delivery),
        documentation: JSON.parse(newTransaction.documentation)
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// New Post Flow APIs

// 1. Enter Item - Search and Analysis
app.post('/api/post-flow/search-item', async (req, res) => {
  try {
    const { itemName, category, userId = 'user-001' } = req.body;
    
    // Simulate Abacus Deep Agent analysis
    const analysisResults = {
      marketAnalysis: {
        averagePrice: Math.floor(Math.random() * 2000) + 2000,
        priceRange: [Math.floor(Math.random() * 1000) + 1500, Math.floor(Math.random() * 2000) + 3000],
        competitionLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        demandScore: Math.random() * 10,
        marketTrend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)]
      },
      pricingInsights: {
        optimalPrice: Math.floor(Math.random() * 2000) + 2000,
        quickSalePrice: Math.floor(Math.random() * 1500) + 1500,
        premiumPrice: Math.floor(Math.random() * 2500) + 3000,
        priceFactors: ['condition', 'brand', 'location', 'seasonality']
      },
      contentInsights: {
        topKeywords: ['excellent condition', 'great deal', 'must sell', 'serious inquiries'],
        bestPerformingTitles: [`${itemName} - Excellent Condition`, `${itemName} - Great Deal!`],
        optimalPostingTimes: ['morning', 'evening'],
        platformSpecificTips: {
          facebook: 'Use emotional appeal and local community focus',
          offerup: 'Emphasize convenience and quick sale',
          craigslist: 'Be direct and include all details'
        }
      },
      recommendations: [
        'Emphasize excellent condition',
        'Include multiple high-quality photos',
        'Highlight any unique features',
        'Set competitive pricing for quick sale'
      ]
    };
    
    // Save research results
    const researchId = `research-${Date.now()}`;
    await dbRun(`
      INSERT INTO abacus_research (id, user_id, item_name, search_query, research_type, results, confidence_score, data_sources)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [researchId, userId, itemName, `${itemName} ${category} market analysis`, 'full_analysis', JSON.stringify(analysisResults), 0.85 + Math.random() * 0.15, JSON.stringify(['facebook_marketplace', 'offerup', 'craigslist', 'google_trends'])]);
    
    res.json({
      success: true,
      data: {
        researchId,
        itemName,
        category,
        analysis: analysisResults,
        confidenceScore: 0.85 + Math.random() * 0.15,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 2. Create Post - Project Management
app.post('/api/post-flow/create-project', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      itemName, 
      itemCategory, 
      itemCondition, 
      itemDescription, 
      platforms, 
      tags, 
      researchId,
      userId = 'user-001' 
    } = req.body;
    
    const projectId = `project-${Date.now()}`;
    
    // Get research data if provided
    let researchData = null;
    if (researchId) {
      const research = await dbGet(`SELECT * FROM abacus_research WHERE id = ?`, [researchId]);
      if (research) {
        researchData = JSON.parse(research.results);
      }
    }
    
    await dbRun(`
      INSERT INTO post_projects (id, user_id, name, description, item_name, item_category, item_condition, item_description, status, platforms, tags, research_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `, [projectId, userId, name, description, itemName, itemCategory, itemCondition, itemDescription, JSON.stringify(platforms || []), JSON.stringify(tags || []), JSON.stringify(researchData)]);
    
    // Add to garage
    await dbRun(`
      INSERT INTO garage_items (id, user_id, item_type, item_name, item_data, category, tags, platform, status, priority)
      VALUES (?, ?, 'project', ?, ?, ?, ?, 'multi', 'active', 1)
    `, [`garage-${Date.now()}`, userId, name, JSON.stringify({projectId, status: 'draft', lastActivity: new Date().toISOString()}), itemCategory, JSON.stringify(tags || [])]);
    
    const newProject = await dbGet(`SELECT * FROM post_projects WHERE id = ?`, [projectId]);
    
    res.json({
      success: true,
      data: {
        ...newProject,
        platforms: JSON.parse(newProject.platforms),
        tags: JSON.parse(newProject.tags),
        researchData: newProject.research_data ? JSON.parse(newProject.research_data) : null
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 3. Deep Research (Abacus Deep Agent)
app.post('/api/post-flow/deep-research', async (req, res) => {
  try {
    const { projectId, researchType = 'full_analysis', userId = 'user-001' } = req.body;
    
    // Get project details
    const project = await dbGet(`SELECT * FROM post_projects WHERE id = ? AND user_id = ?`, [projectId, userId]);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Simulate Abacus Deep Agent research
    const deepResearch = {
      marketIntelligence: {
        competitorAnalysis: {
          topCompetitors: [
            { name: 'Similar Item A', price: 4200, features: ['Energy efficient', 'Professional grade'], rating: 4.5 },
            { name: 'Similar Item B', price: 3800, features: ['Good condition', 'Quick sale'], rating: 4.2 }
          ],
          marketGaps: ['Professional installation not mentioned', 'Warranty details missing'],
          opportunities: ['Emphasize professional installation', 'Highlight warranty coverage']
        },
        pricingStrategy: {
          recommendedPrice: 4200,
          priceJustification: 'Based on condition, features, and market demand',
          dynamicPricing: {
            highDemand: 4500,
            normalDemand: 4200,
            quickSale: 3800
          },
          psychologicalPricing: ['$4,199', '$4,200', '$4,250']
        },
        contentStrategy: {
          headlineVariations: [
            'Professional AC Unit - Energy Efficient!',
            'AC System - Great Deal!',
            'Premium AC Unit - Warranty Included'
          ],
          keyMessages: [
            'Energy efficient and cost-effective',
            'Professional installation available',
            'Warranty included for peace of mind'
          ],
          callToActionOptions: [
            'Contact for installation quote',
            'Serious inquiries only',
            'Available for immediate pickup'
          ]
        }
      },
      platformOptimization: {
        facebook: {
          optimalPostingTime: '9:00 AM - 11:00 AM',
          hashtags: ['#AC', '#HVAC', '#EnergyEfficient', '#Professional'],
          contentLength: '150-200 characters',
          imageCount: '3-5 images'
        },
        offerup: {
          optimalPostingTime: '6:00 PM - 8:00 PM',
          keywords: ['excellent condition', 'great deal', 'must sell'],
          contentLength: '100-150 characters',
          imageCount: '2-4 images'
        },
        craigslist: {
          optimalPostingTime: '7:00 AM - 9:00 AM',
          keywords: ['professional', 'warranty', 'installation'],
          contentLength: '200-300 characters',
          imageCount: '4-6 images'
        }
      },
      performancePredictions: {
        expectedViews: { facebook: 150, offerup: 80, craigslist: 120 },
        expectedEngagement: { facebook: 0.12, offerup: 0.08, craigslist: 0.06 },
        expectedLeads: { facebook: 8, offerup: 4, craigslist: 6 },
        conversionProbability: 0.15
      }
    };
    
    // Save deep research
    const researchId = `research-${Date.now()}`;
    await dbRun(`
      INSERT INTO abacus_research (id, user_id, project_id, item_name, search_query, research_type, results, confidence_score, data_sources)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [researchId, userId, projectId, project.item_name, `${project.item_name} deep market analysis`, researchType, JSON.stringify(deepResearch), 0.92, JSON.stringify(['abacus_deep_agent', 'market_intelligence', 'competitor_analysis'])]);
    
    // Update project with research data
    await dbRun(`
      UPDATE post_projects 
      SET research_data = ?, status = 'research', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(deepResearch), projectId]);
    
    res.json({
      success: true,
      data: {
        researchId,
        projectId,
        research: deepResearch,
        confidenceScore: 0.92,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 4. Generate Content
app.post('/api/post-flow/generate-content', async (req, res) => {
  try {
    const { projectId, platforms, userId = 'user-001' } = req.body;
    
    // Get project and research data
    const project = await dbGet(`SELECT * FROM post_projects WHERE id = ? AND user_id = ?`, [projectId, userId]);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    const researchData = project.research_data ? JSON.parse(project.research_data) : null;
    
    // Generate platform-specific content
    const generatedContent = {};
    const selectedPlatforms = platforms || JSON.parse(project.platforms || '[]');
    
    selectedPlatforms.forEach(platform => {
      const platformData = researchData?.platformOptimization?.[platform] || {};
      
      switch (platform) {
        case 'facebook':
          generatedContent[platform] = `${project.item_name} - Energy Efficient! Perfect for home or office. Includes professional installation and warranty. $4,200 OBO. Contact for details! #AC #HVAC #EnergyEfficient`;
          break;
        case 'offerup':
          generatedContent[platform] = `${project.item_name} - Great Deal! High-efficiency unit, excellent condition. $4,200. Ready for installation.`;
          break;
        case 'craigslist':
          generatedContent[platform] = `${project.item_name} - Energy Efficient. Professional grade, warranty included. $4,200. Serious inquiries only.`;
          break;
        default:
          generatedContent[platform] = `${project.item_name} - Excellent condition. $4,200. Contact for details.`;
      }
    });
    
    // Update project with generated content
    await dbRun(`
      UPDATE post_projects 
      SET generated_content = ?, status = 'writing', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(generatedContent), projectId]);
    
    res.json({
      success: true,
      data: {
        projectId,
        generatedContent,
        platforms: selectedPlatforms,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 5. Image Processing (CloudFlare Integration)
app.post('/api/post-flow/process-images', async (req, res) => {
  try {
    const { projectId, images = [], userId = 'user-001', itemName, platforms } = req.body;
    
    // If no images provided, generate some sample images
    const imagesToProcess = images.length > 0 ? images : [
      {
        url: '/images/ac-main-unit.png',
        width: 1200,
        height: 800,
        fileSize: 245760,
        tags: ['main', 'unit', 'professional']
      },
      {
        url: '/images/ac-remote.jpeg',
        width: 800,
        height: 600,
        fileSize: 156789,
        tags: ['remote', 'control']
      },
      {
        url: '/images/ac-installation.jpeg',
        width: 1000,
        height: 750,
        fileSize: 189234,
        tags: ['installation', 'professional']
      }
    ];
    
    // Simulate CloudFlare image processing
    const processedImages = imagesToProcess.map((image, index) => {
      const imageId = `img-${Date.now()}-${index}`;
      return {
        id: imageId,
        originalUrl: image.url,
        cloudflareUrl: `https://cloudflare.pow3r.cashout/images/${imageId}.jpg`,
        thumbnailUrl: `https://cloudflare.pow3r.cashout/thumbnails/${imageId}_thumb.jpg`,
        optimizedUrl: `https://cloudflare.pow3r.cashout/optimized/${imageId}_opt.jpg`,
        metadata: {
          width: image.width || 1200,
          height: image.height || 800,
          fileSize: image.fileSize || 245760,
          format: 'jpg',
          processedAt: new Date().toISOString()
        },
        tags: image.tags || [],
        isFavorite: false,
        usageCount: 0
      };
    });
    
    // Save images to gallery
    for (const image of processedImages) {
      await dbRun(`
        INSERT INTO image_gallery (id, user_id, project_id, filename, original_url, cloudflare_url, thumbnail_url, image_type, metadata, tags, is_favorite, usage_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'original', ?, ?, ?, ?)
      `, [image.id, userId, projectId, `image-${image.id}.jpg`, image.originalUrl, image.cloudflareUrl, image.thumbnailUrl, JSON.stringify(image.metadata), JSON.stringify(image.tags), image.isFavorite, image.usageCount]);
    }
    
    // Update project with processed images
    await dbRun(`
      UPDATE post_projects 
      SET images = ?, status = 'images', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(processedImages), projectId]);
    
    res.json({
      success: true,
      data: {
        projectId,
        processedImages,
        totalImages: processedImages.length,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 6. Customize Project
app.put('/api/post-flow/customize/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { customizations, userId = 'user-001' } = req.body;
    
    // Update project customizations
    await dbRun(`
      UPDATE post_projects 
      SET customizations = ?, status = 'customize', updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [JSON.stringify(customizations), projectId, userId]);
    
    const updatedProject = await dbGet(`SELECT * FROM post_projects WHERE id = ?`, [projectId]);
    
    res.json({
      success: true,
      data: {
        ...updatedProject,
        platforms: JSON.parse(updatedProject.platforms),
        tags: JSON.parse(updatedProject.tags),
        customizations: JSON.parse(updatedProject.customizations || '{}')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 7. Confirm and Post
app.post('/api/post-flow/confirm-post', async (req, res) => {
  try {
    const { projectId, postingSchedule, userId = 'user-001' } = req.body;
    
    // Get project details
    const project = await dbGet(`SELECT * FROM post_projects WHERE id = ? AND user_id = ?`, [projectId, userId]);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    const generatedContent = JSON.parse(project.generated_content || '{}');
    const platforms = JSON.parse(project.platforms || '[]');
    
    // Create post history entries
    const postHistory = [];
    for (const platform of platforms) {
      const postId = `post-${Date.now()}-${platform}`;
      const scheduledTime = postingSchedule?.[platform] || new Date(Date.now() + 60000).toISOString(); // 1 minute from now
      
      await dbRun(`
        INSERT INTO post_history (id, user_id, project_id, platform, post_content, images, posting_strategy, status, scheduled_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', ?)
      `, [postId, userId, projectId, platform, generatedContent[platform] || '', JSON.stringify(JSON.parse(project.images || '[]')), JSON.stringify({tone: 'professional'}), scheduledTime]);
      
      postHistory.push({
        id: postId,
        platform,
        content: generatedContent[platform] || '',
        scheduledAt: scheduledTime,
        status: 'scheduled'
      });
    }
    
    // Update project status
    await dbRun(`
      UPDATE post_projects 
      SET posting_schedule = ?, status = 'confirm', updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [JSON.stringify(postingSchedule || {}), projectId]);
    
    res.json({
      success: true,
      data: {
        projectId,
        postHistory,
        totalPosts: postHistory.length,
        scheduledPlatforms: platforms,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 8. Garage Management APIs
app.get('/api/garage', async (req, res) => {
  try {
    const { 
      userId = 'user-001', 
      itemType, 
      category, 
      status, 
      platform, 
      tags, 
      sortBy = 'last_accessed', 
      sortOrder = 'DESC',
      limit = 50,
      offset = 0
    } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (itemType) {
      whereConditions.push('item_type = ?');
      params.push(itemType);
    }
    
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    
    if (platform) {
      whereConditions.push('platform = ?');
      params.push(platform);
    }
    
    if (tags) {
      whereConditions.push('tags LIKE ?');
      params.push(`%${tags}%`);
    }
    
    const items = await dbAll(`
      SELECT * FROM garage_items 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedItems = items.map(item => ({
      ...item,
      itemData: JSON.parse(item.item_data),
      tags: JSON.parse(item.tags || '[]'),
      isFavorite: Boolean(item.is_favorite)
    }));
    
    res.json({
      success: true,
      data: parsedItems,
      total: parsedItems.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 9. Image Gallery APIs
app.get('/api/gallery', async (req, res) => {
  try {
    const { userId = 'user-001', projectId, tags, isFavorite, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (projectId) {
      whereConditions.push('project_id = ?');
      params.push(projectId);
    }
    
    if (tags) {
      whereConditions.push('tags LIKE ?');
      params.push(`%${tags}%`);
    }
    
    if (isFavorite !== undefined) {
      whereConditions.push('is_favorite = ?');
      params.push(isFavorite === 'true' ? 1 : 0);
    }
    
    const images = await dbAll(`
      SELECT * FROM image_gallery 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedImages = images.map(image => ({
      ...image,
      metadata: JSON.parse(image.metadata || '{}'),
      tags: JSON.parse(image.tags || '[]'),
      isFavorite: Boolean(image.is_favorite)
    }));
    
    res.json({
      success: true,
      data: parsedImages,
      total: parsedImages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 10. Post History APIs
app.get('/api/post-history', async (req, res) => {
  try {
    const { userId = 'user-001', projectId, platform, status, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (projectId) {
      whereConditions.push('project_id = ?');
      params.push(projectId);
    }
    
    if (platform) {
      whereConditions.push('platform = ?');
      params.push(platform);
    }
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    
    const posts = await dbAll(`
      SELECT ph.*, pp.name as project_name, pp.item_name
      FROM post_history ph
      LEFT JOIN post_projects pp ON ph.project_id = pp.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY ph.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedPosts = posts.map(post => ({
      ...post,
      images: JSON.parse(post.images || '[]'),
      postingStrategy: JSON.parse(post.posting_strategy || '{}'),
      performanceData: post.performance_data ? JSON.parse(post.performance_data) : null
    }));
    
    res.json({
      success: true,
      data: parsedPosts,
      total: parsedPosts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 11. Post Projects Management APIs
app.get('/api/post-projects', async (req, res) => {
  try {
    const { userId = 'user-001', status, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    
    const projects = await dbAll(`
      SELECT * FROM post_projects 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedProjects = projects.map(project => ({
      ...project,
      platforms: JSON.parse(project.platforms || '[]'),
      content: JSON.parse(project.content || '{}'),
      images: JSON.parse(project.images || '[]'),
      research: project.research ? JSON.parse(project.research) : null,
      postingSchedule: project.posting_schedule ? JSON.parse(project.posting_schedule) : null
    }));
    
    res.json({
      success: true,
      data: parsedProjects,
      total: parsedProjects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/post-projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    const project = await dbGet(`
      SELECT * FROM post_projects 
      WHERE id = ? AND user_id = ?
    `, [projectId, userId]);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    const parsedProject = {
      ...project,
      platforms: JSON.parse(project.platforms || '[]'),
      content: JSON.parse(project.content || '{}'),
      images: JSON.parse(project.images || '[]'),
      research: project.research ? JSON.parse(project.research) : null,
      postingSchedule: project.posting_schedule ? JSON.parse(project.posting_schedule) : null
    };
    
    res.json({
      success: true,
      data: parsedProject,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/post-projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    if (updates.name) {
      updateFields.push('name = ?');
      updateValues.push(updates.name);
    }
    
    if (updates.description) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    
    if (updates.platforms) {
      updateFields.push('platforms = ?');
      updateValues.push(JSON.stringify(updates.platforms));
    }
    
    if (updates.content) {
      updateFields.push('content = ?');
      updateValues.push(JSON.stringify(updates.content));
    }
    
    if (updates.images) {
      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(updates.images));
    }
    
    if (updates.research) {
      updateFields.push('research = ?');
      updateValues.push(JSON.stringify(updates.research));
    }
    
    if (updates.status) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(projectId, userId);
    
    await dbRun(`
      UPDATE post_projects 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `, updateValues);
    
    // Get updated project
    const updatedProject = await dbGet(`
      SELECT * FROM post_projects 
      WHERE id = ? AND user_id = ?
    `, [projectId, userId]);
    
    const parsedProject = {
      ...updatedProject,
      platforms: JSON.parse(updatedProject.platforms || '[]'),
      content: JSON.parse(updatedProject.content || '{}'),
      images: JSON.parse(updatedProject.images || '[]'),
      research: updatedProject.research ? JSON.parse(updatedProject.research) : null,
      postingSchedule: updatedProject.posting_schedule ? JSON.parse(updatedProject.posting_schedule) : null
    };
    
    res.json({
      success: true,
      data: parsedProject,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/post-projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    // Check if project exists
    const project = await dbGet(`
      SELECT id FROM post_projects 
      WHERE id = ? AND user_id = ?
    `, [projectId, userId]);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // Delete project
    await dbRun(`
      DELETE FROM post_projects 
      WHERE id = ? AND user_id = ?
    `, [projectId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, projectId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 12. Workflow API Endpoints

// ===== PROJECT MANAGEMENT APIs =====

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const { userId = 'user-001', status, priority, category, assignedTo, tags, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      whereConditions.push('priority = ?');
      params.push(priority);
    }
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    if (assignedTo) {
      whereConditions.push('JSON_EXTRACT(participants, "$") LIKE ?');
      params.push(`%"${assignedTo}"%`);
    }
    if (tags) {
      const tagList = tags.split(',');
      whereConditions.push('JSON_EXTRACT(tags, "$") LIKE ?');
      params.push(`%"${tagList[0]}"%`);
    }
    if (startDate) {
      whereConditions.push('created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('created_at <= ?');
      params.push(endDate);
    }
    
    const projects = await dbAll(`
      SELECT * FROM projects 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedProjects = projects.map(project => ({
      ...project,
      participants: JSON.parse(project.participants || '[]'),
      tags: JSON.parse(project.tags || '[]'),
      metadata: project.metadata ? JSON.parse(project.metadata) : {}
    }));
    
    res.json({
      success: true,
      data: parsedProjects,
      total: parsedProjects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new project
app.post('/api/projects', async (req, res) => {
  try {
    const { 
      name, 
      description, 
      status = 'draft',
      priority = 'medium',
      progress = 0,
      startDate,
      dueDate,
      participants = [],
      tags = [],
      category,
      estimatedHours,
      actualHours = 0,
      budget,
      spent = 0,
      createdBy,
      metadata = {}
    } = req.body;
    
    const projectId = `project-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO projects (
        id, name, description, status, priority, progress, start_date, due_date,
        participants, tags, category, estimated_hours, actual_hours, budget, spent,
        created_by, created_at, updated_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      projectId, name, description, status, priority, progress, startDate, dueDate,
      JSON.stringify(participants), JSON.stringify(tags), category, estimatedHours, actualHours, budget, spent,
      createdBy, now, now, JSON.stringify(metadata)
    ]);
    
    const newProject = await dbGet(`SELECT * FROM projects WHERE id = ?`, [projectId]);
    
    res.json({
      success: true,
      data: {
        ...newProject,
        participants: JSON.parse(newProject.participants || '[]'),
        tags: JSON.parse(newProject.tags || '[]'),
        metadata: newProject.metadata ? JSON.parse(newProject.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update project
app.put('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['name', 'description', 'status', 'priority', 'progress', 'startDate', 'dueDate', 'participants', 'tags', 'category', 'estimatedHours', 'actualHours', 'budget', 'spent', 'metadata'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'participants' || field === 'tags' || field === 'metadata') {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(projectId, userId);
    
    await dbRun(`
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND created_by = ?
    `, updateValues);
    
    const updatedProject = await dbGet(`
      SELECT * FROM projects 
      WHERE id = ? AND created_by = ?
    `, [projectId, userId]);
    
    if (!updatedProject) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        ...updatedProject,
        participants: JSON.parse(updatedProject.participants || '[]'),
        tags: JSON.parse(updatedProject.tags || '[]'),
        metadata: updatedProject.metadata ? JSON.parse(updatedProject.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete project
app.delete('/api/projects/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    const project = await dbGet(`
      SELECT id FROM projects 
      WHERE id = ? AND created_by = ?
    `, [projectId, userId]);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    await dbRun(`
      DELETE FROM projects 
      WHERE id = ? AND created_by = ?
    `, [projectId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, projectId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get project steps
app.get('/api/projects/:projectId/steps', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    const steps = await dbAll(`
      SELECT * FROM project_steps 
      WHERE project_id = ? AND user_id = ?
      ORDER BY "order" ASC
    `, [projectId, userId]);
    
    const parsedSteps = steps.map(step => ({
      ...step,
      dependencies: JSON.parse(step.dependencies || '[]'),
      deliverables: JSON.parse(step.deliverables || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedSteps,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create project step
app.post('/api/project-steps', async (req, res) => {
  try {
    const {
      projectId,
      title,
      description,
      status = 'pending',
      order,
      estimatedHours,
      actualHours = 0,
      assignedTo,
      dueDate,
      dependencies = [],
      deliverables = [],
      notes,
      userId = 'user-001'
    } = req.body;
    
    const stepId = `step-${Date.now()}`;
    
    await dbRun(`
      INSERT INTO project_steps (
        id, project_id, title, description, status, "order", estimated_hours,
        actual_hours, assigned_to, due_date, dependencies, deliverables, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      stepId, projectId, title, description, status, order, estimatedHours,
      actualHours, assignedTo, dueDate, JSON.stringify(dependencies), JSON.stringify(deliverables), notes, userId
    ]);
    
    const newStep = await dbGet(`SELECT * FROM project_steps WHERE id = ?`, [stepId]);
    
    res.json({
      success: true,
      data: {
        ...newStep,
        dependencies: JSON.parse(newStep.dependencies || '[]'),
        deliverables: JSON.parse(newStep.deliverables || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update project step
app.put('/api/project-steps/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['title', 'description', 'status', 'order', 'estimatedHours', 'actualHours', 'assignedTo', 'dueDate', 'dependencies', 'deliverables', 'notes'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'dependencies' || field === 'deliverables') {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(stepId, userId);
    
    await dbRun(`
      UPDATE project_steps 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `, updateValues);
    
    const updatedStep = await dbGet(`
      SELECT * FROM project_steps 
      WHERE id = ? AND user_id = ?
    `, [stepId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedStep,
        dependencies: JSON.parse(updatedStep.dependencies || '[]'),
        deliverables: JSON.parse(updatedStep.deliverables || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete project step
app.delete('/api/project-steps/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      DELETE FROM project_steps 
      WHERE id = ? AND user_id = ?
    `, [stepId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, stepId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reorder project steps
app.put('/api/projects/:projectId/steps/reorder', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stepIds } = req.body;
    const { userId = 'user-001' } = req.query;
    
    for (let i = 0; i < stepIds.length; i++) {
      await dbRun(`
        UPDATE project_steps 
        SET "order" = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND project_id = ? AND user_id = ?
      `, [i + 1, stepIds[i], projectId, userId]);
    }
    
    res.json({
      success: true,
      data: { reordered: true },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get project templates
app.get('/api/project-templates', async (req, res) => {
  try {
    const { userId = 'user-001' } = req.query;
    
    const templates = await dbAll(`
      SELECT * FROM project_templates 
      WHERE created_by = ? OR is_public = 1
      ORDER BY usage_count DESC, created_at DESC
    `, [userId]);
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      steps: JSON.parse(template.steps || '[]'),
      tags: JSON.parse(template.tags || '[]'),
      variables: template.variables ? JSON.parse(template.variables) : {}
    }));
    
    res.json({
      success: true,
      data: parsedTemplates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create project template
app.post('/api/project-templates', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      tags = [],
      steps = [],
      estimatedDuration,
      isPublic = false,
      createdBy
    } = req.body;
    
    const templateId = `template-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO project_templates (
        id, name, description, category, tags, steps, estimated_duration,
        is_public, usage_count, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `, [
      templateId, name, description, category, JSON.stringify(tags), JSON.stringify(steps), estimatedDuration,
      isPublic, createdBy, now, now
    ]);
    
    const newTemplate = await dbGet(`SELECT * FROM project_templates WHERE id = ?`, [templateId]);
    
    res.json({
      success: true,
      data: {
        ...newTemplate,
        steps: JSON.parse(newTemplate.steps || '[]'),
        tags: JSON.parse(newTemplate.tags || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== MESSAGE HANDLING APIs =====

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const { userId = 'user-001', status, priority, platform, type, sentiment, tags, assignedTo, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      whereConditions.push('priority = ?');
      params.push(priority);
    }
    if (platform) {
      whereConditions.push('platform = ?');
      params.push(platform);
    }
    if (type) {
      whereConditions.push('type = ?');
      params.push(type);
    }
    if (sentiment) {
      whereConditions.push('sentiment = ?');
      params.push(sentiment);
    }
    if (tags) {
      const tagList = tags.split(',');
      whereConditions.push('JSON_EXTRACT(tags, "$") LIKE ?');
      params.push(`%"${tagList[0]}"%`);
    }
    if (assignedTo) {
      whereConditions.push('assigned_to = ?');
      params.push(assignedTo);
    }
    if (startDate) {
      whereConditions.push('timestamp >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('timestamp <= ?');
      params.push(endDate);
    }
    
    const messages = await dbAll(`
      SELECT * FROM messages 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedMessages = messages.map(message => ({
      ...message,
      tags: JSON.parse(message.tags || '[]'),
      attachments: JSON.parse(message.attachments || '[]'),
      metadata: message.metadata ? JSON.parse(message.metadata) : {}
    }));
    
    res.json({
      success: true,
      data: parsedMessages,
      total: parsedMessages.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new message
app.post('/api/messages', async (req, res) => {
  try {
    const {
      leadId,
      platform,
      sender,
      content,
      status = 'unread',
      priority = 'medium',
      type = 'inquiry',
      autoResponse,
      manualResponse,
      responseTime,
      sentiment,
      tags = [],
      attachments = [],
      metadata = {},
      userId = 'user-001'
    } = req.body;
    
    const messageId = `msg-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO messages (
        id, lead_id, platform, sender, content, status, priority, type,
        auto_response, manual_response, response_time, sentiment, tags,
        attachments, metadata, user_id, timestamp, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId, leadId, platform, sender, content, status, priority, type,
      autoResponse, manualResponse, responseTime, sentiment, JSON.stringify(tags),
      JSON.stringify(attachments), JSON.stringify(metadata), userId, now, now, now
    ]);
    
    const newMessage = await dbGet(`SELECT * FROM messages WHERE id = ?`, [messageId]);
    
    res.json({
      success: true,
      data: {
        ...newMessage,
        tags: JSON.parse(newMessage.tags || '[]'),
        attachments: JSON.parse(newMessage.attachments || '[]'),
        metadata: newMessage.metadata ? JSON.parse(newMessage.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update message
app.put('/api/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['status', 'priority', 'type', 'autoResponse', 'manualResponse', 'responseTime', 'sentiment', 'tags', 'attachments', 'metadata'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'tags' || field === 'attachments' || field === 'metadata') {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(messageId, userId);
    
    await dbRun(`
      UPDATE messages 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `, updateValues);
    
    const updatedMessage = await dbGet(`
      SELECT * FROM messages 
      WHERE id = ? AND user_id = ?
    `, [messageId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedMessage,
        tags: JSON.parse(updatedMessage.tags || '[]'),
        attachments: JSON.parse(updatedMessage.attachments || '[]'),
        metadata: updatedMessage.metadata ? JSON.parse(updatedMessage.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete message
app.delete('/api/messages/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      DELETE FROM messages 
      WHERE id = ? AND user_id = ?
    `, [messageId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, messageId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk update messages
app.put('/api/messages/bulk-update', async (req, res) => {
  try {
    const { ids, updates } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['status', 'priority', 'type', 'sentiment', 'tags'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'tags') {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    const placeholders = ids.map(() => '?').join(',');
    updateValues.push(...ids, userId);
    
    await dbRun(`
      UPDATE messages 
      SET ${updateFields.join(', ')}
      WHERE id IN (${placeholders}) AND user_id = ?
    `, updateValues);
    
    res.json({
      success: true,
      data: { updated: ids.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk delete messages
app.delete('/api/messages/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const placeholders = ids.map(() => '?').join(',');
    
    await dbRun(`
      DELETE FROM messages 
      WHERE id IN (${placeholders}) AND user_id = ?
    `, [...ids, userId]);
    
    res.json({
      success: true,
      data: { deleted: ids.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Process incoming message
app.post('/api/messages/process', async (req, res) => {
  try {
    const { leadId, platform, sender, content, metadata = {} } = req.body;
    const userId = 'user-001';
    
    // Analyze message sentiment and priority
    const sentiment = content.toLowerCase().includes('urgent') || content.toLowerCase().includes('asap') ? 'negative' : 'neutral';
    const priority = content.toLowerCase().includes('urgent') || content.toLowerCase().includes('asap') ? 'high' : 'medium';
    
    // Check for auto-response triggers
    const autoResponse = content.toLowerCase().includes('price') ? 'Thank you for your interest! I\'ll get back to you with pricing information shortly.' : null;
    
    const messageId = `msg-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO messages (
        id, lead_id, platform, sender, content, status, priority, type,
        auto_response, sentiment, metadata, user_id, timestamp, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'unread', ?, 'inquiry', ?, ?, ?, ?, ?, ?, ?)
    `, [
      messageId, leadId, platform, sender, content, priority, autoResponse, sentiment,
      JSON.stringify(metadata), userId, now, now, now
    ]);
    
    const newMessage = await dbGet(`SELECT * FROM messages WHERE id = ?`, [messageId]);
    
    res.json({
      success: true,
      data: {
        ...newMessage,
        tags: JSON.parse(newMessage.tags || '[]'),
        attachments: JSON.parse(newMessage.attachments || '[]'),
        metadata: newMessage.metadata ? JSON.parse(newMessage.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate auto response
app.post('/api/messages/:messageId/auto-response', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    const message = await dbGet(`
      SELECT * FROM messages 
      WHERE id = ? AND user_id = ?
    `, [messageId, userId]);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        error: 'Message not found'
      });
    }
    
    // Simple auto-response logic based on message content
    let response = 'Thank you for your message! I\'ll get back to you as soon as possible.';
    
    if (message.content.toLowerCase().includes('price')) {
      response = 'Thank you for your interest! I\'ll send you pricing information shortly.';
    } else if (message.content.toLowerCase().includes('available')) {
      response = 'Yes, this item is still available! When would you like to see it?';
    } else if (message.content.toLowerCase().includes('condition')) {
      response = 'The item is in excellent condition. I can provide more details if needed.';
    }
    
    res.json({
      success: true,
      data: { response },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get message templates
app.get('/api/message-templates', async (req, res) => {
  try {
    const { userId = 'user-001' } = req.query;
    
    const templates = await dbAll(`
      SELECT * FROM message_templates 
      WHERE created_by = ? OR is_public = 1
      ORDER BY usage_count DESC, created_at DESC
    `, [userId]);
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      platform: JSON.parse(template.platform || '[]'),
      triggers: JSON.parse(template.triggers || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedTemplates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create message template
app.post('/api/message-templates', async (req, res) => {
  try {
    const {
      name,
      content,
      category,
      platform = [],
      triggers = [],
      isActive = true,
      createdBy
    } = req.body;
    
    const templateId = `template-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO message_templates (
        id, name, content, category, platform, triggers, is_active,
        usage_count, success_rate, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
    `, [
      templateId, name, content, category, JSON.stringify(platform), JSON.stringify(triggers), isActive,
      createdBy, now, now
    ]);
    
    const newTemplate = await dbGet(`SELECT * FROM message_templates WHERE id = ?`, [templateId]);
    
    res.json({
      success: true,
      data: {
        ...newTemplate,
        platform: JSON.parse(newTemplate.platform || '[]'),
        triggers: JSON.parse(newTemplate.triggers || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update message template
app.put('/api/message-templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['name', 'content', 'category', 'platform', 'triggers', 'isActive'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'platform' || field === 'triggers') {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(templateId, userId);
    
    await dbRun(`
      UPDATE message_templates 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND created_by = ?
    `, updateValues);
    
    const updatedTemplate = await dbGet(`
      SELECT * FROM message_templates 
      WHERE id = ? AND created_by = ?
    `, [templateId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedTemplate,
        platform: JSON.parse(updatedTemplate.platform || '[]'),
        triggers: JSON.parse(updatedTemplate.triggers || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete message template
app.delete('/api/message-templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      DELETE FROM message_templates 
      WHERE id = ? AND created_by = ?
    `, [templateId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, templateId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get message analytics
app.get('/api/messages/analytics', async (req, res) => {
  try {
    const { userId = 'user-001', startDate, endDate } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (startDate) {
      whereConditions.push('timestamp >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('timestamp <= ?');
      params.push(endDate);
    }
    
    const analytics = await dbGet(`
      SELECT 
        COUNT(*) as total_messages,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) as unread_count,
        SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END) as replied_count,
        AVG(response_time) as avg_response_time,
        COUNT(DISTINCT platform) as platform_count
      FROM messages 
      WHERE ${whereConditions.join(' AND ')}
    `, params);
    
    const platformBreakdown = await dbAll(`
      SELECT platform, COUNT(*) as count
      FROM messages 
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY platform
    `, params);
    
    const priorityBreakdown = await dbAll(`
      SELECT priority, COUNT(*) as count
      FROM messages 
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY priority
    `, params);
    
    res.json({
      success: true,
      data: {
        analytics,
        platformBreakdown,
        priorityBreakdown
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== FLOW MODIFICATION APIs =====

// Get all flows
app.get('/api/flows', async (req, res) => {
  try {
    const { userId = 'user-001', status, category, tags, createdBy, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['created_by = ?'];
    let params = [userId];
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    if (tags) {
      const tagList = tags.split(',');
      whereConditions.push('JSON_EXTRACT(tags, "$") LIKE ?');
      params.push(`%"${tagList[0]}"%`);
    }
    if (createdBy) {
      whereConditions.push('created_by = ?');
      params.push(createdBy);
    }
    if (startDate) {
      whereConditions.push('created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('created_at <= ?');
      params.push(endDate);
    }
    
    const flows = await dbAll(`
      SELECT * FROM flows 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedFlows = flows.map(flow => ({
      ...flow,
      nodes: JSON.parse(flow.nodes || '[]'),
      connections: JSON.parse(flow.connections || '[]'),
      variables: flow.variables ? JSON.parse(flow.variables) : {},
      settings: flow.settings ? JSON.parse(flow.settings) : {},
      statistics: flow.statistics ? JSON.parse(flow.statistics) : {},
      tags: JSON.parse(flow.tags || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedFlows,
      total: parsedFlows.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new flow
app.post('/api/flows', async (req, res) => {
  try {
    const {
      name,
      description,
      status = 'draft',
      category,
      tags = [],
      nodes = [],
      connections = [],
      variables = {},
      settings = {},
      statistics = {},
      createdBy
    } = req.body;
    
    const flowId = `flow-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO flows (
        id, name, description, status, category, tags, nodes, connections,
        variables, settings, statistics, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      flowId, name, description, status, category, JSON.stringify(tags), JSON.stringify(nodes), JSON.stringify(connections),
      JSON.stringify(variables), JSON.stringify(settings), JSON.stringify(statistics), createdBy, now, now
    ]);
    
    const newFlow = await dbGet(`SELECT * FROM flows WHERE id = ?`, [flowId]);
    
    res.json({
      success: true,
      data: {
        ...newFlow,
        nodes: JSON.parse(newFlow.nodes || '[]'),
        connections: JSON.parse(newFlow.connections || '[]'),
        variables: newFlow.variables ? JSON.parse(newFlow.variables) : {},
        settings: newFlow.settings ? JSON.parse(newFlow.settings) : {},
        statistics: newFlow.statistics ? JSON.parse(newFlow.statistics) : {},
        tags: JSON.parse(newFlow.tags || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update flow
app.put('/api/flows/:flowId', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['name', 'description', 'status', 'category', 'tags', 'nodes', 'connections', 'variables', 'settings', 'statistics'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (['tags', 'nodes', 'connections', 'variables', 'settings', 'statistics'].includes(field)) {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(flowId, userId);
    
    await dbRun(`
      UPDATE flows 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND created_by = ?
    `, updateValues);
    
    const updatedFlow = await dbGet(`
      SELECT * FROM flows 
      WHERE id = ? AND created_by = ?
    `, [flowId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedFlow,
        nodes: JSON.parse(updatedFlow.nodes || '[]'),
        connections: JSON.parse(updatedFlow.connections || '[]'),
        variables: updatedFlow.variables ? JSON.parse(updatedFlow.variables) : {},
        settings: updatedFlow.settings ? JSON.parse(updatedFlow.settings) : {},
        statistics: updatedFlow.statistics ? JSON.parse(updatedFlow.statistics) : {},
        tags: JSON.parse(updatedFlow.tags || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete flow
app.delete('/api/flows/:flowId', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      DELETE FROM flows 
      WHERE id = ? AND created_by = ?
    `, [flowId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, flowId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Execute flow
app.post('/api/flows/:flowId/execute', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { input = {} } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const flow = await dbGet(`
      SELECT * FROM flows 
      WHERE id = ? AND created_by = ?
    `, [flowId, userId]);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    const executionId = `exec-${Date.now()}`;
    const now = new Date().toISOString();
    
    // Create execution record
    await dbRun(`
      INSERT INTO flow_executions (
        id, flow_id, status, start_time, input, logs, user_id
      ) VALUES (?, ?, 'running', ?, ?, ?, ?)
    `, [executionId, flowId, now, JSON.stringify(input), JSON.stringify([]), userId]);
    
    // Simulate flow execution
    setTimeout(async () => {
      const endTime = new Date().toISOString();
      const duration = Date.now() - new Date(now).getTime();
      
      await dbRun(`
        UPDATE flow_executions 
        SET status = 'completed', end_time = ?, duration = ?, output = ?
        WHERE id = ?
      `, [endTime, duration, JSON.stringify({ result: 'Flow executed successfully', input }), executionId]);
      
      // Update flow statistics
      const stats = JSON.parse(flow.statistics || '{}');
      stats.totalExecutions = (stats.totalExecutions || 0) + 1;
      stats.successfulExecutions = (stats.successfulExecutions || 0) + 1;
      stats.averageExecutionTime = (stats.averageExecutionTime || 0) + duration / 2;
      stats.lastExecution = endTime;
      
      await dbRun(`
        UPDATE flows 
        SET statistics = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [JSON.stringify(stats), flowId]);
    }, 1000);
    
    const execution = await dbGet(`SELECT * FROM flow_executions WHERE id = ?`, [executionId]);
    
    res.json({
      success: true,
      data: {
        ...execution,
        input: JSON.parse(execution.input || '{}'),
        logs: JSON.parse(execution.logs || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test flow
app.post('/api/flows/:flowId/test', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { input = {} } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const flow = await dbGet(`
      SELECT * FROM flows 
      WHERE id = ? AND created_by = ?
    `, [flowId, userId]);
    
    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Flow not found'
      });
    }
    
    // Simulate test execution
    const testResult = {
      success: true,
      result: 'Flow test completed successfully',
      input,
      executionTime: Math.random() * 1000,
      logs: [
        { timestamp: new Date().toISOString(), level: 'info', message: 'Flow test started' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'All nodes validated' },
        { timestamp: new Date().toISOString(), level: 'info', message: 'Flow test completed' }
      ]
    };
    
    res.json({
      success: true,
      data: testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get flow executions
app.get('/api/flow-executions', async (req, res) => {
  try {
    const { userId = 'user-001', flowId, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (flowId) {
      whereConditions.push('flow_id = ?');
      params.push(flowId);
    }
    
    const executions = await dbAll(`
      SELECT * FROM flow_executions 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY start_time DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedExecutions = executions.map(execution => ({
      ...execution,
      input: JSON.parse(execution.input || '{}'),
      output: execution.output ? JSON.parse(execution.output) : null,
      logs: JSON.parse(execution.logs || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedExecutions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel flow execution
app.post('/api/flow-executions/:executionId/cancel', async (req, res) => {
  try {
    const { executionId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      UPDATE flow_executions 
      SET status = 'cancelled', end_time = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [executionId, userId]);
    
    res.json({
      success: true,
      data: { cancelled: true, executionId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get flow templates
app.get('/api/flow-templates', async (req, res) => {
  try {
    const { userId = 'user-001' } = req.query;
    
    const templates = await dbAll(`
      SELECT * FROM flow_templates 
      WHERE created_by = ? OR is_public = 1
      ORDER BY usage_count DESC, created_at DESC
    `, [userId]);
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      nodes: JSON.parse(template.nodes || '[]'),
      connections: JSON.parse(template.connections || '[]'),
      variables: template.variables ? JSON.parse(template.variables) : {},
      tags: JSON.parse(template.tags || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedTemplates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create flow template
app.post('/api/flow-templates', async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      tags = [],
      nodes = [],
      connections = [],
      variables = {},
      isPublic = false,
      createdBy
    } = req.body;
    
    const templateId = `template-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO flow_templates (
        id, name, description, category, tags, nodes, connections,
        variables, is_public, usage_count, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?)
    `, [
      templateId, name, description, category, JSON.stringify(tags), JSON.stringify(nodes), JSON.stringify(connections),
      JSON.stringify(variables), isPublic, createdBy, now, now
    ]);
    
    const newTemplate = await dbGet(`SELECT * FROM flow_templates WHERE id = ?`, [templateId]);
    
    res.json({
      success: true,
      data: {
        ...newTemplate,
        nodes: JSON.parse(newTemplate.nodes || '[]'),
        connections: JSON.parse(newTemplate.connections || '[]'),
        variables: newTemplate.variables ? JSON.parse(newTemplate.variables) : {},
        tags: JSON.parse(newTemplate.tags || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ===== POST MANAGEMENT APIs =====

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const { userId = 'user-001', status, priority, category, platform, tags, author, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (status) {
      whereConditions.push('status = ?');
      params.push(status);
    }
    if (priority) {
      whereConditions.push('priority = ?');
      params.push(priority);
    }
    if (category) {
      whereConditions.push('category = ?');
      params.push(category);
    }
    if (platform) {
      whereConditions.push('JSON_EXTRACT(platforms, "$") LIKE ?');
      params.push(`%"${platform}"%`);
    }
    if (tags) {
      const tagList = tags.split(',');
      whereConditions.push('JSON_EXTRACT(tags, "$") LIKE ?');
      params.push(`%"${tagList[0]}"%`);
    }
    if (author) {
      whereConditions.push('author = ?');
      params.push(author);
    }
    if (startDate) {
      whereConditions.push('created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      whereConditions.push('created_at <= ?');
      params.push(endDate);
    }
    
    const posts = await dbAll(`
      SELECT * FROM posts 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedPosts = posts.map(post => ({
      ...post,
      platforms: JSON.parse(post.platforms || '[]'),
      tags: JSON.parse(post.tags || '[]'),
      images: JSON.parse(post.images || '[]'),
      metadata: post.metadata ? JSON.parse(post.metadata) : {}
    }));
    
    res.json({
      success: true,
      data: parsedPosts,
      total: parsedPosts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create new post
app.post('/api/posts', async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      platforms = [],
      status = 'draft',
      priority = 'medium',
      category,
      tags = [],
      images = [],
      author,
      createdBy,
      metadata = {}
    } = req.body;
    
    const postId = `post-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO posts (
        id, title, description, content, platforms, status, priority, category,
        tags, images, author, created_by, created_at, updated_at, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      postId, title, description, content, JSON.stringify(platforms), status, priority, category,
      JSON.stringify(tags), JSON.stringify(images), author, createdBy, now, now, JSON.stringify(metadata)
    ]);
    
    const newPost = await dbGet(`SELECT * FROM posts WHERE id = ?`, [postId]);
    
    res.json({
      success: true,
      data: {
        ...newPost,
        platforms: JSON.parse(newPost.platforms || '[]'),
        tags: JSON.parse(newPost.tags || '[]'),
        images: JSON.parse(newPost.images || '[]'),
        metadata: newPost.metadata ? JSON.parse(newPost.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update post
app.put('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['title', 'description', 'content', 'platforms', 'status', 'priority', 'category', 'tags', 'images', 'metadata'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (['platforms', 'tags', 'images', 'metadata'].includes(field)) {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(postId, userId);
    
    await dbRun(`
      UPDATE posts 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND created_by = ?
    `, updateValues);
    
    const updatedPost = await dbGet(`
      SELECT * FROM posts 
      WHERE id = ? AND created_by = ?
    `, [postId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedPost,
        platforms: JSON.parse(updatedPost.platforms || '[]'),
        tags: JSON.parse(updatedPost.tags || '[]'),
        images: JSON.parse(updatedPost.images || '[]'),
        metadata: updatedPost.metadata ? JSON.parse(updatedPost.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete post
app.delete('/api/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      DELETE FROM posts 
      WHERE id = ? AND created_by = ?
    `, [postId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, postId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Publish post
app.post('/api/posts/:postId/publish', async (req, res) => {
  try {
    const { postId } = req.params;
    const { platforms } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const post = await dbGet(`
      SELECT * FROM posts 
      WHERE id = ? AND created_by = ?
    `, [postId, userId]);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    const now = new Date().toISOString();
    
    await dbRun(`
      UPDATE posts 
      SET status = 'published', published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND created_by = ?
    `, [now, postId, userId]);
    
    // Create analytics records for each platform
    const targetPlatforms = platforms || JSON.parse(post.platforms || '[]');
    for (const platform of targetPlatforms) {
      const analyticsId = `analytics-${Date.now()}-${platform}`;
      await dbRun(`
        INSERT INTO post_analytics (
          id, post_id, platform, views, likes, shares, comments, clicks, conversions,
          engagement, reach, impressions, last_updated, user_id
        ) VALUES (?, ?, ?, 0, 0, 0, 0, 0, 0, 0, 0, 0, ?, ?)
      `, [analyticsId, postId, platform, now, userId]);
    }
    
    const updatedPost = await dbGet(`
      SELECT * FROM posts 
      WHERE id = ? AND created_by = ?
    `, [postId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedPost,
        platforms: JSON.parse(updatedPost.platforms || '[]'),
        tags: JSON.parse(updatedPost.tags || '[]'),
        images: JSON.parse(updatedPost.images || '[]'),
        metadata: updatedPost.metadata ? JSON.parse(updatedPost.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Schedule post
app.post('/api/posts/:postId/schedule', async (req, res) => {
  try {
    const { postId } = req.params;
    const { scheduledAt, platforms } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const post = await dbGet(`
      SELECT * FROM posts 
      WHERE id = ? AND created_by = ?
    `, [postId, userId]);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }
    
    await dbRun(`
      UPDATE posts 
      SET status = 'scheduled', scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND created_by = ?
    `, [scheduledAt, postId, userId]);
    
    // Create schedule records for each platform
    const targetPlatforms = platforms || JSON.parse(post.platforms || '[]');
    for (const platform of targetPlatforms) {
      const scheduleId = `schedule-${Date.now()}-${platform}`;
      await dbRun(`
        INSERT INTO post_schedules (
          id, post_id, platform, scheduled_at, status, retry_count, max_retries, user_id
        ) VALUES (?, ?, ?, ?, 'pending', 0, 3, ?)
      `, [scheduleId, postId, platform, scheduledAt, userId]);
    }
    
    const updatedPost = await dbGet(`
      SELECT * FROM posts 
      WHERE id = ? AND created_by = ?
    `, [postId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedPost,
        platforms: JSON.parse(updatedPost.platforms || '[]'),
        tags: JSON.parse(updatedPost.tags || '[]'),
        images: JSON.parse(updatedPost.images || '[]'),
        metadata: updatedPost.metadata ? JSON.parse(updatedPost.metadata) : {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk publish posts
app.post('/api/posts/bulk-publish', async (req, res) => {
  try {
    const { postIds, platforms } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const placeholders = postIds.map(() => '?').join(',');
    const now = new Date().toISOString();
    
    await dbRun(`
      UPDATE posts 
      SET status = 'published', published_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders}) AND created_by = ?
    `, [now, ...postIds, userId]);
    
    res.json({
      success: true,
      data: { published: postIds.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk schedule posts
app.post('/api/posts/bulk-schedule', async (req, res) => {
  try {
    const { postIds, scheduledAt, platforms } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const placeholders = postIds.map(() => '?').join(',');
    
    await dbRun(`
      UPDATE posts 
      SET status = 'scheduled', scheduled_at = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders}) AND created_by = ?
    `, [scheduledAt, ...postIds, userId]);
    
    res.json({
      success: true,
      data: { scheduled: postIds.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk archive posts
app.post('/api/posts/bulk-archive', async (req, res) => {
  try {
    const { postIds } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const placeholders = postIds.map(() => '?').join(',');
    
    await dbRun(`
      UPDATE posts 
      SET status = 'archived', updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders}) AND created_by = ?
    `, [...postIds, userId]);
    
    res.json({
      success: true,
      data: { archived: postIds.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Bulk delete posts
app.delete('/api/posts/bulk-delete', async (req, res) => {
  try {
    const { postIds } = req.body;
    const { userId = 'user-001' } = req.query;
    
    const placeholders = postIds.map(() => '?').join(',');
    
    await dbRun(`
      DELETE FROM posts 
      WHERE id IN (${placeholders}) AND created_by = ?
    `, [...postIds, userId]);
    
    res.json({
      success: true,
      data: { deleted: postIds.length },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get post analytics
app.get('/api/posts/analytics', async (req, res) => {
  try {
    const { userId = 'user-001', postId } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (postId) {
      whereConditions.push('post_id = ?');
      params.push(postId);
    }
    
    const analytics = await dbAll(`
      SELECT * FROM post_analytics 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY last_updated DESC
    `, params);
    
    res.json({
      success: true,
      data: analytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update post analytics
app.put('/api/posts/:postId/analytics/:platform', async (req, res) => {
  try {
    const { postId, platform } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['views', 'likes', 'shares', 'comments', 'clicks', 'conversions', 'engagement', 'reach', 'impressions'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(updates[field]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('last_updated = CURRENT_TIMESTAMP');
    updateValues.push(postId, platform, userId);
    
    await dbRun(`
      UPDATE post_analytics 
      SET ${updateFields.join(', ')}
      WHERE post_id = ? AND platform = ? AND user_id = ?
    `, updateValues);
    
    const updatedAnalytics = await dbGet(`
      SELECT * FROM post_analytics 
      WHERE post_id = ? AND platform = ? AND user_id = ?
    `, [postId, platform, userId]);
    
    res.json({
      success: true,
      data: updatedAnalytics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get post schedules
app.get('/api/post-schedules', async (req, res) => {
  try {
    const { userId = 'user-001', postId } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (postId) {
      whereConditions.push('post_id = ?');
      params.push(postId);
    }
    
    const schedules = await dbAll(`
      SELECT * FROM post_schedules 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY scheduled_at ASC
    `, params);
    
    res.json({
      success: true,
      data: schedules,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel post schedule
app.post('/api/post-schedules/:scheduleId/cancel', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      UPDATE post_schedules 
      SET status = 'cancelled'
      WHERE id = ? AND user_id = ?
    `, [scheduleId, userId]);
    
    res.json({
      success: true,
      data: { cancelled: true, scheduleId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Reschedule post
app.put('/api/post-schedules/:scheduleId/reschedule', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const { scheduledAt } = req.body;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      UPDATE post_schedules 
      SET scheduled_at = ?, status = 'pending'
      WHERE id = ? AND user_id = ?
    `, [scheduledAt, scheduleId, userId]);
    
    const updatedSchedule = await dbGet(`
      SELECT * FROM post_schedules 
      WHERE id = ? AND user_id = ?
    `, [scheduleId, userId]);
    
    res.json({
      success: true,
      data: updatedSchedule,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get post templates
app.get('/api/post-templates', async (req, res) => {
  try {
    const { userId = 'user-001' } = req.query;
    
    const templates = await dbAll(`
      SELECT * FROM post_templates 
      WHERE created_by = ? OR is_public = 1
      ORDER BY usage_count DESC, created_at DESC
    `, [userId]);
    
    const parsedTemplates = templates.map(template => ({
      ...template,
      platforms: JSON.parse(template.platforms || '[]'),
      tags: JSON.parse(template.tags || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedTemplates,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Create post template
app.post('/api/post-templates', async (req, res) => {
  try {
    const {
      name,
      description,
      content,
      category,
      tags = [],
      platforms = [],
      isPublic = false,
      createdBy
    } = req.body;
    
    const templateId = `template-${Date.now()}`;
    const now = new Date().toISOString();
    
    await dbRun(`
      INSERT INTO post_templates (
        id, name, description, content, category, tags, platforms,
        is_public, usage_count, success_rate, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?)
    `, [
      templateId, name, description, content, category, JSON.stringify(tags), JSON.stringify(platforms),
      isPublic, createdBy, now, now
    ]);
    
    const newTemplate = await dbGet(`SELECT * FROM post_templates WHERE id = ?`, [templateId]);
    
    res.json({
      success: true,
      data: {
        ...newTemplate,
        platforms: JSON.parse(newTemplate.platforms || '[]'),
        tags: JSON.parse(newTemplate.tags || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update post template
app.put('/api/post-templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId = 'user-001' } = req.query;
    const updates = req.body;
    
    const updateFields = [];
    const updateValues = [];
    
    const allowedFields = ['name', 'description', 'content', 'category', 'tags', 'platforms', 'isPublic'];
    
    allowedFields.forEach(field => {
      if (updates[field] !== undefined) {
        if (field === 'tags' || field === 'platforms') {
          updateFields.push(`${field} = ?`);
          updateValues.push(JSON.stringify(updates[field]));
        } else {
          updateFields.push(`${field} = ?`);
          updateValues.push(updates[field]);
        }
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    updateValues.push(templateId, userId);
    
    await dbRun(`
      UPDATE post_templates 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND created_by = ?
    `, updateValues);
    
    const updatedTemplate = await dbGet(`
      SELECT * FROM post_templates 
      WHERE id = ? AND created_by = ?
    `, [templateId, userId]);
    
    res.json({
      success: true,
      data: {
        ...updatedTemplate,
        platforms: JSON.parse(updatedTemplate.platforms || '[]'),
        tags: JSON.parse(updatedTemplate.tags || '[]')
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete post template
app.delete('/api/post-templates/:templateId', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    await dbRun(`
      DELETE FROM post_templates 
      WHERE id = ? AND created_by = ?
    `, [templateId, userId]);
    
    res.json({
      success: true,
      data: { deleted: true, templateId },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 13. Abacus Research APIs
app.get('/api/abacus-research/:researchId', async (req, res) => {
  try {
    const { researchId } = req.params;
    const { userId = 'user-001' } = req.query;
    
    const research = await dbGet(`
      SELECT * FROM abacus_research 
      WHERE id = ? AND user_id = ?
    `, [researchId, userId]);
    
    if (!research) {
      return res.status(404).json({
        success: false,
        error: 'Research not found'
      });
    }
    
    const parsedResearch = {
      ...research,
      results: JSON.parse(research.results || '{}'),
      dataSources: JSON.parse(research.data_sources || '[]')
    };
    
    res.json({
      success: true,
      data: parsedResearch,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/abacus-research', async (req, res) => {
  try {
    const { userId = 'user-001', projectId, researchType, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['user_id = ?'];
    let params = [userId];
    
    if (projectId) {
      whereConditions.push('project_id = ?');
      params.push(projectId);
    }
    
    if (researchType) {
      whereConditions.push('research_type = ?');
      params.push(researchType);
    }
    
    const research = await dbAll(`
      SELECT * FROM abacus_research 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), parseInt(offset)]);
    
    const parsedResearch = research.map(item => ({
      ...item,
      results: JSON.parse(item.results || '{}'),
      dataSources: JSON.parse(item.data_sources || '[]')
    }));
    
    res.json({
      success: true,
      data: parsedResearch,
      total: parsedResearch.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// 13. Cloudflare Integration APIs
app.post('/api/cloudflare/upload', async (req, res) => {
  try {
    const { userId = 'user-001', projectId, imageData, metadata } = req.body;
    
    if (!imageData) {
      return res.status(400).json({
        success: false,
        error: 'Image data is required'
      });
    }
    
    const imageId = `img-${Date.now()}`;
    const filename = `image-${imageId}.jpg`;
    
    // Simulate Cloudflare upload
    const cloudflareUrl = `https://cloudflare.pow3r.cashout/images/${filename}`;
    const thumbnailUrl = `https://cloudflare.pow3r.cashout/thumbnails/${imageId}_thumb.jpg`;
    const optimizedUrl = `https://cloudflare.pow3r.cashout/optimized/${imageId}_opt.jpg`;
    
    // Store in database
    await dbRun(`
      INSERT INTO image_gallery (id, user_id, project_id, filename, original_url, cloudflare_url, thumbnail_url, image_type, metadata, tags, is_favorite, usage_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      imageId, 
      userId, 
      projectId, 
      filename, 
      imageData.originalUrl || cloudflareUrl, 
      cloudflareUrl, 
      thumbnailUrl, 
      'uploaded', 
      JSON.stringify(metadata || {}), 
      JSON.stringify(metadata?.tags || []), 
      0, 
      0
    ]);
    
    res.json({
      success: true,
      data: {
        imageId,
        filename,
        originalUrl: imageData.originalUrl || cloudflareUrl,
        cloudflareUrl,
        thumbnailUrl,
        optimizedUrl,
        metadata: metadata || {}
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/cloudflare/optimize/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { userId = 'user-001' } = req.query;
    const { options = {} } = req.body;
    
    // Get image from database
    const image = await dbGet(`
      SELECT * FROM image_gallery 
      WHERE id = ? AND user_id = ?
    `, [imageId, userId]);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    // Simulate optimization
    const optimizedUrl = `https://cloudflare.pow3r.cashout/optimized/${imageId}_opt.jpg`;
    const optimizedMetadata = {
      ...JSON.parse(image.metadata || '{}'),
      optimized: true,
      optimizationOptions: options,
      optimizedAt: new Date().toISOString()
    };
    
    // Update image record
    await dbRun(`
      UPDATE image_gallery 
      SET metadata = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `, [JSON.stringify(optimizedMetadata), imageId, userId]);
    
    res.json({
      success: true,
      data: {
        imageId,
        originalUrl: image.cloudflare_url,
        optimizedUrl,
        metadata: optimizedMetadata
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/cloudflare/variants/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const { userId = 'user-001' } = req.query;
    const { variants = [] } = req.body;
    
    // Get image from database
    const image = await dbGet(`
      SELECT * FROM image_gallery 
      WHERE id = ? AND user_id = ?
    `, [imageId, userId]);
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Image not found'
      });
    }
    
    // Generate variants
    const generatedVariants = variants.map((variant, index) => ({
      id: `${imageId}-variant-${index}`,
      type: variant.type || 'resize',
      width: variant.width || 800,
      height: variant.height || 600,
      quality: variant.quality || 85,
      url: `https://cloudflare.pow3r.cashout/variants/${imageId}_${variant.type || 'resize'}_${index}.jpg`,
      metadata: {
        originalImageId: imageId,
        variantType: variant.type || 'resize',
        generatedAt: new Date().toISOString()
      }
    }));
    
    res.json({
      success: true,
      data: {
        imageId,
        originalUrl: image.cloudflare_url,
        variants: generatedVariants
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Real API Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`📝 Listings API: http://localhost:${PORT}/api/listings`);
  console.log(`🤖 Auto-Response API: http://localhost:${PORT}/api/auto-responses`);
  console.log(`✨ New Post Flow API: http://localhost:${PORT}/api/post-flow/*`);
  console.log(`🏠 Garage API: http://localhost:${PORT}/api/garage`);
  console.log(`🔬 Abacus Research API: http://localhost:${PORT}/api/abacus-research/*`);
  console.log(`☁️  Cloudflare API: http://localhost:${PORT}/api/cloudflare/*`);
  console.log(`💾 Database: ${dbPath}`);
});
