/**
 * AI Response Templates API
 * Manages AI response templates for automated customer interactions
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

import { initializeDatabase } from '../database/setup';

export async function onRequest(context: any) {
  const { request, env } = context;
  const method = request.method;

  try {
    // Initialize database if needed
    await initializeDatabase(env);

    const db = env.DB;
    const userId = 'user-001'; // Default user for demo

    switch (method) {
      case 'GET':
        return await getAITemplates(db, userId);
      case 'POST':
        return await createAITemplate(db, userId, request);
      case 'PUT':
        return await updateAITemplate(db, userId, request);
      case 'DELETE':
        return await deleteAITemplate(db, userId, request);
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
    console.error('AI Templates API error:', error);
    
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

async function getAITemplates(db: any, userId: string) {
  try {
    const templates = await db.prepare(`
      SELECT 
        id,
        name,
        category,
        trigger_keywords,
        response_template,
        variables,
        tone,
        priority,
        is_active,
        usage_count,
        success_rate,
        created_at,
        updated_at
      FROM ai_response_templates 
      WHERE user_id = ?
      ORDER BY priority DESC, created_at DESC
    `).bind(userId).all();

    const formattedTemplates = templates.results.map((template: any) => ({
      id: template.id,
      name: template.name,
      category: template.category,
      triggerKeywords: JSON.parse(template.trigger_keywords),
      responseTemplate: template.response_template,
      variables: JSON.parse(template.variables),
      tone: template.tone,
      priority: template.priority,
      isActive: Boolean(template.is_active),
      usageCount: template.usage_count,
      successRate: template.success_rate,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      data: formattedTemplates,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to get AI templates: ${error}`);
  }
}

async function createAITemplate(db: any, userId: string, request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      category, 
      triggerKeywords, 
      responseTemplate, 
      variables, 
      tone, 
      priority 
    } = body;

    if (!name || !category || !triggerKeywords || !responseTemplate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Missing required fields: name, category, triggerKeywords, responseTemplate'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const templateId = `template-${Date.now()}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO ai_response_templates (
        id, user_id, name, category, trigger_keywords, response_template,
        variables, tone, priority, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      templateId,
      userId,
      name,
      category,
      JSON.stringify(triggerKeywords),
      responseTemplate,
      JSON.stringify(variables || []),
      tone || 'friendly',
      priority || 1,
      now,
      now
    ).run();

    const newTemplate = await db.prepare(`
      SELECT * FROM ai_response_templates WHERE id = ?
    `).bind(templateId).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...newTemplate,
        triggerKeywords: JSON.parse(newTemplate.trigger_keywords),
        variables: JSON.parse(newTemplate.variables),
        isActive: Boolean(newTemplate.is_active)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to create AI template: ${error}`);
  }
}

async function updateAITemplate(db: any, userId: string, request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template ID is required'
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
    if (updates.category) {
      updateFields.push('category = ?');
      updateValues.push(updates.category);
    }
    if (updates.triggerKeywords) {
      updateFields.push('trigger_keywords = ?');
      updateValues.push(JSON.stringify(updates.triggerKeywords));
    }
    if (updates.responseTemplate) {
      updateFields.push('response_template = ?');
      updateValues.push(updates.responseTemplate);
    }
    if (updates.variables) {
      updateFields.push('variables = ?');
      updateValues.push(JSON.stringify(updates.variables));
    }
    if (updates.tone) {
      updateFields.push('tone = ?');
      updateValues.push(updates.tone);
    }
    if (updates.priority !== undefined) {
      updateFields.push('priority = ?');
      updateValues.push(updates.priority);
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
      UPDATE ai_response_templates 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `).bind(...updateValues).run();

    const updatedTemplate = await db.prepare(`
      SELECT * FROM ai_response_templates WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();

    if (!updatedTemplate) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...updatedTemplate,
        triggerKeywords: JSON.parse(updatedTemplate.trigger_keywords),
        variables: JSON.parse(updatedTemplate.variables),
        isActive: Boolean(updatedTemplate.is_active)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to update AI template: ${error}`);
  }
}

async function deleteAITemplate(db: any, userId: string, request: Request) {
  try {
    const url = new URL(request.url);
    const templateId = url.searchParams.get('id');

    if (!templateId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await db.prepare(`
      DELETE FROM ai_response_templates 
      WHERE id = ? AND user_id = ?
    `).bind(templateId, userId).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Template not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Template deleted successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to delete AI template: ${error}`);
  }
}
