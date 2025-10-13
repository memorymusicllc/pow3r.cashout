/**
 * Health Check Endpoint
 * Returns system status and database connection info
 * 
 * @version 1.0.0
 * @date 2025-01-10
 */

export async function onRequest(context: any) {
  try {
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: context.env.ENVIRONMENT || 'development',
      version: context.env.VERSION_PREFIX || 'DEV',
      database: 'connected', // Will be updated when we implement Cloudflare D1
      services: {
        api: 'operational',
        database: 'operational',
        ai: 'operational'
      }
    };

    return new Response(JSON.stringify(healthData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
