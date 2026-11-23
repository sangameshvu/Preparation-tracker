import { getStore } from '@netlify/blobs';
import type { Context } from '@netlify/functions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json'
};

export default async (req: Request, context: Context) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: CORS_HEADERS
    });
  }

  try {
    const url = new URL(req.url);
    const store = getStore('user-vaults');

    // GET: Retrieve user vault
    if (req.method === 'GET') {
      const userId = url.searchParams.get('userId');
      const email = url.searchParams.get('email')?.trim().toLowerCase();
      const action = url.searchParams.get('action');

      if (action === 'list_profiles') {
        const profiles = await store.get('registered-profiles', { type: 'json' });
        return new Response(
          JSON.stringify({ success: true, profiles: profiles || [] }),
          { status: 200, headers: CORS_HEADERS }
        );
      }

      let vaultData: any = null;

      if (userId) {
        vaultData = await store.get(userId, { type: 'json' });
      }

      // Fallback by email lookup if not found by userId
      if (!vaultData && email) {
        vaultData = await store.get(`email_${email}`, { type: 'json' });
      }

      if (!vaultData) {
        return new Response(
          JSON.stringify({
            success: false,
            notFound: true,
            message: 'No cloud vault found for this identifier'
          }),
          { status: 200, headers: CORS_HEADERS }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          vault: vaultData,
          updatedAt: vaultData.exportedAt || vaultData.updatedAt || new Date().toISOString()
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // POST: Save/Sync user vault
    if (req.method === 'POST') {
      const body = await req.json();
      const { userId, email, vault } = body;

      if (!userId && !email) {
        return new Response(
          JSON.stringify({ success: false, error: 'Missing userId or email' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const timestamp = new Date().toISOString();
      const enrichedVault = {
        ...vault,
        updatedAt: timestamp,
        syncedAt: timestamp
      };

      // Save by userId
      if (userId) {
        await store.setJSON(userId, enrichedVault);
      }

      // Save by email
      const cleanEmail = (email || vault?.profile?.email || '').trim().toLowerCase();
      if (cleanEmail) {
        await store.setJSON(`email_${cleanEmail}`, enrichedVault);
      }

      // Update registered-profiles index
      try {
        const existingProfiles: any[] = (await store.get('registered-profiles', { type: 'json' })) || [];
        const profileRecord = vault?.profile || { id: userId, email: cleanEmail };
        const updatedProfiles = existingProfiles.filter(
          (p) => p.id !== profileRecord.id && p.email?.toLowerCase() !== cleanEmail
        );
        updatedProfiles.push({
          id: profileRecord.id,
          email: cleanEmail,
          displayName: profileRecord.displayName || 'Sangamesh V U',
          lastSyncedAt: timestamp
        });
        await store.setJSON('registered-profiles', updatedProfiles);
      } catch (idxErr) {
        console.warn('Failed to update profile index:', idxErr);
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Cloud vault successfully saved and synced across all devices.',
          savedAt: timestamp
        }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return new Response(
      JSON.stringify({ error: `Method ${req.method} not allowed` }),
      { status: 405, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    console.error('Error in cloud-vault function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Internal Server Error in cloud vault sync'
      }),
      { status: 500, headers: CORS_HEADERS }
    );
  }
};
