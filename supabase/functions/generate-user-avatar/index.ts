import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400'
      }
    });
  }

  // Only allow POST requests
  if (req.method === 'POST') {
    try {
      // Verify authorization header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Missing authorization header' }), 
          { 
            status: 401,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      const { firstName } = await req.json();

      if (!firstName) {
        return new Response(
          JSON.stringify({ error: 'firstName is required' }), 
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }
        );
      }

      // Generate the avatar URL
      const avatarUrl = `https://avatar.iran.liara.run/username?username=${encodeURIComponent(firstName)}`;

      return new Response(
        JSON.stringify({ avatarUrl }), 
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    } catch (error) {
      console.error('Function error:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }), 
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      );
    }
  }

  return new Response(
    'Method Not Allowed', 
    { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
});