/**
 * Database Setup for Cloudflare D1
 * Initializes all required tables for the pow3r-cashout system
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

export async function initializeDatabase(env: any) {
  const db = env.DB; // Cloudflare D1 database
  
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    // Users table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Products table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS products (
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
      )
    `);

    // Listings table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS listings (
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
      )
    `);

    // Auto-response rules table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS auto_response_rules (
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
      )
    `);

    // Leads table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS leads (
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
      )
    `);

    // Analytics table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        listing_id TEXT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metadata TEXT, -- JSON object
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (listing_id) REFERENCES listings (id)
      )
    `);

    // AI Response Templates table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ai_response_templates (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        trigger_keywords TEXT NOT NULL, -- JSON array
        response_template TEXT NOT NULL,
        variables TEXT NOT NULL, -- JSON array
        tone TEXT NOT NULL,
        priority INTEGER DEFAULT 1,
        is_active BOOLEAN DEFAULT 1,
        usage_count INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // AI Response Rules table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ai_response_rules (
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
      )
    `);

    // AI Response Sessions table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS ai_response_sessions (
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
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Post Flow Projects table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS post_projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        item_name TEXT NOT NULL,
        platforms TEXT NOT NULL, -- JSON array
        content TEXT, -- JSON object
        images TEXT, -- JSON array
        status TEXT DEFAULT 'draft',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Garage Items table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS garage_items (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT,
        condition TEXT,
        price REAL,
        images TEXT, -- JSON array
        platforms TEXT, -- JSON array
        status TEXT DEFAULT 'draft',
        tags TEXT, -- JSON array
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function insertSampleData(env: any) {
  const db = env.DB;
  
  if (!db) {
    throw new Error('Database not available');
  }

  try {
    // Insert sample user
    await db.prepare(`
      INSERT OR IGNORE INTO users (id, email, name)
      VALUES ('user-001', 'demo@pow3r.cashout', 'Demo User')
    `).run();

    // Insert sample product
    await db.prepare(`
      INSERT OR IGNORE INTO products (id, user_id, name, description, base_price, condition, images)
      VALUES ('product-001', 'user-001', 'CNCUSA-HD-12L Air Conditioner', 'Professional-grade 12V DC air conditioning unit', 4200, 'new', '["/images/ac-main-unit.png", "/images/ac-system-overview.jpeg"]')
    `).run();

    // Insert sample auto-response rule
    await db.prepare(`
      INSERT OR IGNORE INTO auto_response_rules (id, user_id, name, triggers, response, conditions, platforms)
      VALUES ('rule-001', 'user-001', 'Availability Check', '["is this still available", "available", "still for sale"]', 'Hello! Yes, the item is still available. The price is firm at $4,200, and it is for local pickup only. Do you have any specific questions about the unit?', '{"timeWindow": 60, "maxResponses": 1}', '["facebook", "offerup", "craigslist"]')
    `).run();

    // Insert sample AI response template
    await db.prepare(`
      INSERT OR IGNORE INTO ai_response_templates (id, user_id, name, category, trigger_keywords, response_template, variables, tone)
      VALUES ('template-001', 'user-001', 'Greeting Template', 'greeting', '["hello", "hi", "interested"]', 'Hello! Thank you for your interest in our {{product_name}}. I''d be happy to help you with any questions.', '["product_name"]', 'friendly')
    `).run();

    console.log('Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('Failed to insert sample data:', error);
    throw error;
  }
}
