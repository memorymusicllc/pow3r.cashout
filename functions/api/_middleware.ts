/**
 * Cloudflare Pages Functions Middleware
 * Handles CORS, authentication, and request routing
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

export async function onRequest(context: any) {
  const { request, next } = context;
  
  // Handle CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Add CORS headers to all responses
  const response = await next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}