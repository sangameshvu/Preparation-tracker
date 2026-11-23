/**
 * Cloud Sync Service for Cross-Device Data Consistency
 * Connects the frontend to Netlify Blobs serverless cloud vault
 */

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let lastSyncedTime: string | null = null;
let isSyncing = false;

const API_ENDPOINTS = [
  '/.netlify/functions/cloud-vault',
  '/api/cloud-vault'
];

async function callCloudEndpoint(urlPath: string, options: RequestInit = {}): Promise<Response> {
  let lastError: any = null;

  for (const base of API_ENDPOINTS) {
    try {
      const fullUrl = base + (urlPath.startsWith('?') ? urlPath : '');
      const res = await fetch(fullUrl, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });
      const contentType = res.headers.get('content-type') || '';
      // Valid response if it returned JSON (either 200 OK or 404/400 JSON from serverless function)
      if (contentType.includes('application/json')) {
        return res;
      }
      if (res.ok) {
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('All cloud endpoints failed');
}

/**
 * Fetch latest vault from cloud by userId or email
 */
export async function fetchCloudVault(userId: string, email?: string): Promise<any | null> {
  try {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (email) params.set('email', email.trim().toLowerCase());

    const res = await callCloudEndpoint(`?${params.toString()}`);
    if (!res.ok) return null;

    const data = await res.json();
    if (data.success && data.vault) {
      return data.vault;
    }
    return null;
  } catch (e) {
    console.warn('[CloudSync] Could not fetch remote vault (offline or not yet initialized):', e);
    return null;
  }
}

/**
 * Push vault to cloud
 */
export async function pushCloudVault(
  userId: string,
  email: string,
  vault: any
): Promise<{ success: boolean; savedAt?: string; error?: string }> {
  if (isSyncing) return { success: true };
  isSyncing = true;

  try {
    const res = await callCloudEndpoint('', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        email: email.trim().toLowerCase(),
        vault
      })
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    lastSyncedTime = new Date().toISOString();
    return { success: true, savedAt: data.savedAt || lastSyncedTime };
  } catch (e: any) {
    console.error('[CloudSync] Failed to push vault to cloud:', e);
    return { success: false, error: e.message };
  } finally {
    isSyncing = false;
  }
}

/**
 * Debounced sync trigger
 */
export function queueCloudSync(
  userId: string,
  email: string,
  getVaultSnapshot: () => any,
  delayMs = 2500
): void {
  if (!userId || userId === 'user-guest') return;

  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    try {
      const snapshot = getVaultSnapshot();
      if (snapshot) {
        await pushCloudVault(userId, email, snapshot);
      }
    } catch (e) {
      console.error('[CloudSync] Debounced push error:', e);
    }
  }, delayMs);
}

export function getLastSyncedTime(): string | null {
  return lastSyncedTime;
}
