/**
 * Dashboard API Endpoint
 * Returns dashboard metrics and analytics data
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

import { initializeDatabase } from './database/setup';

export async function onRequest(context: any) {
  const { request, env } = context;

  try {
    // Initialize database if needed
    await initializeDatabase(env);

    const db = env.DB;
    const userId = 'user-001'; // Default user for demo

    // Get dashboard metrics
    const metrics = await getDashboardMetrics(db, userId);

    const response = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

async function getDashboardMetrics(db: any, userId: string) {
  try {
    // Get total views across all listings
    const viewsResult = await db.prepare(`
      SELECT COALESCE(SUM(views), 0) as total_views
      FROM listings 
      WHERE user_id = ?
    `).bind(userId).first();

    // Get total inquiries
    const inquiriesResult = await db.prepare(`
      SELECT COALESCE(SUM(inquiries), 0) as total_inquiries
      FROM listings 
      WHERE user_id = ?
    `).bind(userId).first();

    // Get active listings count
    const activeListingsResult = await db.prepare(`
      SELECT COUNT(*) as active_listings
      FROM listings 
      WHERE user_id = ? AND status = 'active'
    `).bind(userId).first();

    // Get qualified leads count
    const qualifiedLeadsResult = await db.prepare(`
      SELECT COALESCE(SUM(qualified_leads), 0) as qualified_leads
      FROM listings 
      WHERE user_id = ?
    `).bind(userId).first();

    // Get new leads from today
    const newLeadsResult = await db.prepare(`
      SELECT COUNT(*) as new_leads
      FROM leads 
      WHERE user_id = ? AND DATE(created_at) = DATE('now')
    `).bind(userId).first();

    // Calculate conversion rate
    const totalViews = viewsResult?.total_views || 0;
    const totalInquiries = inquiriesResult?.total_inquiries || 0;
    const conversionRate = totalViews > 0 ? (totalInquiries / totalViews) * 100 : 0;

    // Get last activity
    const lastActivityResult = await db.prepare(`
      SELECT MAX(updated_at) as last_activity
      FROM listings 
      WHERE user_id = ?
    `).bind(userId).first();

    return {
      totalViews: totalViews,
      totalInquiries: totalInquiries,
      activeListings: activeListingsResult?.active_listings || 0,
      qualifiedLeads: qualifiedLeadsResult?.qualified_leads || 0,
      newLeads: newLeadsResult?.new_leads || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
      lastActivity: lastActivityResult?.last_activity || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting dashboard metrics:', error);
    // Return default metrics if database query fails
    return {
      totalViews: 0,
      totalInquiries: 0,
      activeListings: 0,
      qualifiedLeads: 0,
      newLeads: 0,
      conversionRate: 0,
      lastActivity: new Date().toISOString()
    };
  }
}
