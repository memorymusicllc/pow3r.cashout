/**
 * Garage Management API
 * Handles garage items (posts, projects, inventory) management
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

import { initializeDatabase } from './database/setup';

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
        return await getGarageItems(db, userId, request);
      case 'POST':
        return await createGarageItem(db, userId, request);
      case 'PUT':
        return await updateGarageItem(db, userId, request);
      case 'DELETE':
        return await deleteGarageItem(db, userId, request);
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
    console.error('Garage API error:', error);
    
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

async function getGarageItems(db: any, userId: string, request: Request) {
  try {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    const platform = url.searchParams.get('platform') || 'all';
    const status = url.searchParams.get('status') || 'all';

    let query = `
      SELECT 
        id,
        name,
        description,
        category,
        condition,
        price,
        images,
        platforms,
        status,
        tags,
        created_at,
        updated_at
      FROM garage_items 
      WHERE user_id = ?
    `;
    
    const queryParams = [userId];

    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (platform !== 'all') {
      query += ` AND platforms LIKE ?`;
      queryParams.push(`%"${platform}"%`);
    }

    if (status !== 'all') {
      query += ` AND status = ?`;
      queryParams.push(status);
    }

    query += ` ORDER BY updated_at DESC`;

    const items = await db.prepare(query).bind(...queryParams).all();

    const formattedItems = items.results.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category,
      condition: item.condition,
      price: item.price,
      images: item.images ? JSON.parse(item.images) : [],
      platforms: item.platforms ? JSON.parse(item.platforms) : [],
      status: item.status,
      tags: item.tags ? JSON.parse(item.tags) : [],
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return new Response(JSON.stringify({
      success: true,
      data: formattedItems,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to get garage items: ${error}`);
  }
}

async function createGarageItem(db: any, userId: string, request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      description, 
      category, 
      condition, 
      price, 
      images, 
      platforms, 
      tags 
    } = body;

    if (!name) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const itemId = `item-${Date.now()}`;
    const now = new Date().toISOString();

    await db.prepare(`
      INSERT INTO garage_items (
        id, user_id, name, description, category, condition, price,
        images, platforms, status, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)
    `).bind(
      itemId,
      userId,
      name,
      description || '',
      category || '',
      condition || 'excellent',
      price || 0,
      JSON.stringify(images || []),
      JSON.stringify(platforms || []),
      JSON.stringify(tags || []),
      now,
      now
    ).run();

    const newItem = await db.prepare(`
      SELECT * FROM garage_items WHERE id = ?
    `).bind(itemId).first();

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...newItem,
        images: JSON.parse(newItem.images),
        platforms: JSON.parse(newItem.platforms),
        tags: JSON.parse(newItem.tags)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to create garage item: ${error}`);
  }
}

async function updateGarageItem(db: any, userId: string, request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Item ID is required'
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
    if (updates.description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(updates.description);
    }
    if (updates.category) {
      updateFields.push('category = ?');
      updateValues.push(updates.category);
    }
    if (updates.condition) {
      updateFields.push('condition = ?');
      updateValues.push(updates.condition);
    }
    if (updates.price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(updates.price);
    }
    if (updates.images) {
      updateFields.push('images = ?');
      updateValues.push(JSON.stringify(updates.images));
    }
    if (updates.platforms) {
      updateFields.push('platforms = ?');
      updateValues.push(JSON.stringify(updates.platforms));
    }
    if (updates.status) {
      updateFields.push('status = ?');
      updateValues.push(updates.status);
    }
    if (updates.tags) {
      updateFields.push('tags = ?');
      updateValues.push(JSON.stringify(updates.tags));
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
      UPDATE garage_items 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `).bind(...updateValues).run();

    const updatedItem = await db.prepare(`
      SELECT * FROM garage_items WHERE id = ? AND user_id = ?
    `).bind(id, userId).first();

    if (!updatedItem) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Item not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...updatedItem,
        images: JSON.parse(updatedItem.images),
        platforms: JSON.parse(updatedItem.platforms),
        tags: JSON.parse(updatedItem.tags)
      },
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to update garage item: ${error}`);
  }
}

async function deleteGarageItem(db: any, userId: string, request: Request) {
  try {
    const url = new URL(request.url);
    const itemId = url.searchParams.get('id');

    if (!itemId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Item ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await db.prepare(`
      DELETE FROM garage_items 
      WHERE id = ? AND user_id = ?
    `).bind(itemId, userId).run();

    if (result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Item not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Item deleted successfully',
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    throw new Error(`Failed to delete garage item: ${error}`);
  }
}
