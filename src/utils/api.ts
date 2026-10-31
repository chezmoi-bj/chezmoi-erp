/**
 * Client API centralisé et résilient pour Chezmoi administration
 * - Élimine les erreurs de parsing JSON inattendues ("Unexpected token '<', '<!doctype...'")
 * - Cible automatiquement l'URL absolue de production (https://admin.chezmoi.bj/api) sur mobile APK / WebView
 * - Intercepteur réseau pour erreurs HTTP (404/500) avec messages clairs et typés
 */

// Détection de l'environnement mobile ou production
export function getApiBaseUrl(): string {
  // 1. Variable d'environnement explicite VITE_API_URL
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }

  // 2. Détection contexte mobile (Capacitor, Cordova, WebView APK, file://)
  if (typeof window !== 'undefined') {
    const isFileProto = window.location.protocol === 'file:';
    const isCapacitor = (window as any).Capacitor !== undefined || window.location.origin.includes('capacitor');
    const isCustomPort = window.location.port !== '' && window.location.port !== '3000' && window.location.port !== '5173';
    const isRemoteProduction = window.location.hostname.includes('chezmoi.bj');

    if (isFileProto || isCapacitor || (window.location.hostname === 'localhost' && isCustomPort) || isRemoteProduction) {
      return 'https://admin.chezmoi.bj/api';
    }

    // 3. Mode développement local web standard (port 3000 ou proxy Vite)
    return '/api';
  }

  return 'https://admin.chezmoi.bj/api';
}

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  user?: any;
  message?: string;
  [key: string]: any;
}

/**
 * Effectue un appel API sécurisé avec interception d'erreurs et parsing JSON protégé
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/api') 
    ? endpoint.replace(/^\/api/, '') 
    : endpoint.startsWith('/') 
    ? endpoint 
    : `/${endpoint}`;

  const fullUrl = baseUrl.endsWith('/api') && cleanEndpoint.startsWith('/')
    ? `${baseUrl}${cleanEndpoint}`
    : `${baseUrl}${cleanEndpoint}`;

  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  // Injecter le token d'authentification s'il existe dans le stockage local
  try {
    const rawSession = localStorage.getItem('cm_auth_session');
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (parsed?.token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${parsed.token}`);
      }
    }
  } catch {
    // Ignorer si non disponible
  }

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers,
    });

    const contentType = res.headers.get('content-type') || '';
    const rawText = await res.text();

    // Protection anti-crash si le serveur a renvoyé du HTML (404/500/Nginx/Apache/Vite index.html)
    const isHtml = rawText.trim().startsWith('<') || contentType.includes('text/html');

    if (isHtml) {
      console.warn(`[API Client Interceptor] Réponse HTML inattendue sur ${fullUrl} (HTTP ${res.status}):`, rawText.substring(0, 160));
      return {
        ok: false,
        status: res.status,
        error: res.status === 404 
          ? `Point de terminaison introuvable (404) sur le serveur de production. Veuillez vérifier l'accès au service.`
          : res.status >= 500
          ? `Le serveur de données a rencontré une erreur temporaire (HTTP ${res.status}). Veuillez réessayer dans quelques instants.`
          : `Le serveur a renvoyé une page web inattendue au lieu de données JSON (HTTP ${res.status}).`,
      };
    }

    let parsedJson: any = null;
    if (rawText.trim().length > 0) {
      try {
        parsedJson = JSON.parse(rawText);
      } catch (parseErr) {
        console.error(`[API Client Interceptor] Erreur de syntaxe JSON sur ${fullUrl}:`, parseErr);
        return {
          ok: false,
          status: res.status,
          error: 'Format de données invalide reçu du serveur.',
        };
      }
    }

    if (!res.ok) {
      const errorMsg = parsedJson?.error || parsedJson?.message || `Erreur serveur (HTTP ${res.status})`;
      return {
        ok: false,
        status: res.status,
        data: parsedJson,
        error: errorMsg,
        ...parsedJson,
      };
    }

    return {
      ok: true,
      status: res.status,
      data: parsedJson,
      ...parsedJson,
    };
  } catch (networkErr: any) {
    console.error(`[API Client Interceptor] Échec de connexion réseau vers ${fullUrl}:`, networkErr?.message);
    return {
      ok: false,
      status: 0,
      error: `Impossible de contacter le serveur Chezmoi (${baseUrl}). Veuillez vérifier votre connexion Internet.`,
    };
  }
}
