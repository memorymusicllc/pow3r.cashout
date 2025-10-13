/**
 * Auto-Response API Endpoints
 * Handles auto-response rules management and execution
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

import { initializeDatabase } from './database/setup';

export async function onRequest(context: any) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method;

  try {
    // Initialize database if needed
    await initializeDatabase(env);

    const db = env.DB;
    const userId = 'user-001'; // Default user for demo

    switch (method) {
      case 'GET':
        return await getAutoResponses(db, userId);
      case 'POST':
        return await createAutoResponse(db, userId, request);
      case 'PUT':
        return await updateAutoResponse(db, userId, request);
      case 'DELETE':
        return await deleteAutoResponse(db, userId, url);
      default:
        return new Response(JSON.stringify({
          success: false,
          error: 'Method not allowed'
        }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Auto-response API error:', error);
    
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

async function getAutoResponses(db: any, userId: string) {
  try {
    const rules = await db.prepare(`
      SELECT 
        id,
        name,
        triggers,
        response,
        conditions,
        is_active,
        priority,
        platforms,
        usage_count,
        success_rate,
        created_at,
        updated_at
      FROM auto_response_rules 
      WHERE user_id = ?
      ORDER BY priority DESC, created_at DESC
    `).bind(userId).all();

    const formattedRules = rules.results.map((rule: any) => ({
      id: rule.id,
      name: rule.name,
      triggers: JSON.parse(rule.triggers),
      response: rule.response,
      conditions: rule.conditions ? JSON.parse(rule.conditions) : null,
      isActive: Boolean(rule.is_active),
      priority: rule.priority,
      platforms: rule.platforms ? JSON.parse(rule.platforms) : [],
      usageCount: rule.usage_count,
      successRate: rule.success_rate,
      createdAt: rule.created_at,
      updatedAt: rule.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      data: formattedRules,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to get auto-responses: ${error}`);
  }
}

async function createAutoResponse(db: any, userId: string, request: Request) {
  try {
    const body = await request.json();
    const { name, triggers, response, conditions, priority, platforms } = body;

    if (!name || !triggers || !response) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: name, triggers, response'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ruleId = `rule-${Date.now()}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO auto_response_rules (
        id, user_id, name, triggers, response, conditions, 
        priority, platforms, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      ruleId,
      userId,
      name,
      JSON.stringify(triggers),
      response,
      conditions ? JSON.stringify(conditions) : null,
      priority || 1,
      platforms ? JSON.stringify(platforms) : JSON.stringify([]),
      now,
      now
    ).run();

    const newRule = await db.prepare(`
      SELECT * FROM auto_response_rules WHERE id = ?
    `).bind(ruleId).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...newRule,
        triggers: JSON.parse(newRule.triggers),
        conditions: newRule.conditions ? JSON.parse(newRule.conditions) : null,
        platforms: newRule.platforms ? JSON.parse(newRule.platforms) : [],
        isActive: Boolean(newRule.is_active)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to create auto-response: ${error}`);
  }
}

async function updateAutoResponse(db: any, userId: string, request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rule ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const updateFields = [];
    const updateValues = [];

    if (updates.name) {
      updateFields.push('name = ?');
      updateValues.push(updates.name);
    }
    if (updates.triggers) {
      updateFields.push('triggers = ?');
      updateValues.push(JSON.stringify(updates.triggers));
    }
    if (updates.response) {
      updateFields.push('response = ?');
      updateValues.push(updates.response);
    }
    if (updates.conditions) {
      updateFields.push('conditions = ?');
      updateValues.push(JSON.stringify(updates.conditions));
    }
    if (updates.priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(updates.priority);
    }
    if (updates.platforms) {
      updateFields.push('platforms = ?');
      updateValues.push(JSON.stringify(updates.platforms));
    }
    if (updates.isActive !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(updates.isActive ? 1 : 0);
    }

    if (updateFields.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No fields to update'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    updateFields.push('updated_at = ?');
    updateValues.push(new Date().toISOString());
    updateValues.push(id);
    updateValues.push(userId);

    await db.prepare(`
      UPDATE auto_response_rules 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `).bind(...updateValues).run();

    const updatedRule = await db.prepare(`
      SELECT * FROM auto_response_rules WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();

    if (!updatedRule) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rule not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...updatedRule,
        triggers: JSON.parse(updatedRule.triggers),
        conditions: updatedRule.conditions ? JSON.parse(updatedRule.conditions) : null,
        platforms: updatedRule.platforms ? JSON.parse(updatedRule.platforms) : [],
        isActive: Boolean(updatedRule.is_active)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to update auto-response: ${error}`);
  }
}

async function deleteAutoResponse(db: any, userId: string, url: URL) {
  try {
    const ruleId = url.searchParams.get('id');

    if (!ruleId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rule ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await db.prepare(`
      DELETE FROM auto_response_rules 
      WHERE id = ? AND user_id = ?
    `).bind(ruleId, userId).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Rule not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Rule deleted successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to delete auto-response: ${error}`);
  }
}
