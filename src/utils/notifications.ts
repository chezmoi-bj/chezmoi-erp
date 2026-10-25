/**
 * Chezmoi ERP - Notification Engine (Push Web, Système & In-App)
 * Alerte instantanée pour les Secrétaires, Administrateurs et Super Admins.
 */

import { AppNotification, PropertyRecord, Role } from '../types';

const NOTIFICATIONS_STORAGE_KEY = 'chezmoi_erp_notifications';

/**
 * Rôles destinataires des notifications automatiques de recensement terrain
 */
export const NOTIFICATION_TARGET_ROLES: Role[] = ['SECRETAIRE', 'ADMIN', 'SUPER_ADMIN'];

export function isUserEligibleForCensusNotification(role: Role): boolean {
  return NOTIFICATION_TARGET_ROLES.includes(role);
}

/**
 * Demande de permission pour les notifications natives du navigateur / OS (Web Push & PWA)
 */
export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Déclenche une notification système native (bureau / smartphone Android)
 */
export function triggerSystemNotification(title: string, options?: NotificationOptions): void {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/assets/aistudio/1_e24ebf1b.png',
        badge: '/assets/aistudio/1_e24ebf1b.png',
        ...options,
      });
    } catch (e) {
      console.warn('[Notification API] Impossible d\'afficher la notification native:', e);
    }
  }
}

/**
 * Sauvegarde les notifications en local
 */
export function saveNotifications(notifications: AppNotification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));
  } catch (e) {
    // Quota
  }
}

/**
 * Charge les notifications enregistrées
 */
export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AppNotification[];
  } catch {
    return [];
  }
}

/**
 * Crée et enregistre une notification de nouveau recensement terrain
 */
export function createCensusNotification(
  property: PropertyRecord,
  agentName: string
): AppNotification {
  const notif: AppNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: 'Nouveau bien recensé sur le terrain',
    message: `${property.title} • ${property.city} (${property.district}) recensé par ${agentName || property.assignedAgentName || 'Agent terrain'}.`,
    targetPropertyId: property.id,
    propertyName: property.title,
    location: `${property.city}, ${property.district}`,
    agentName: agentName || property.assignedAgentName || 'Agent terrain',
    timestamp: Date.now(),
    read: false,
    type: 'NEW_PROPERTY_CENSUS',
  };

  // Déclencher aussi la notification système native (OS / PWA)
  triggerSystemNotification('Chezmoi administration - Nouveau bien recensé', {
    body: notif.message,
    tag: property.id,
  });

  return notif;
}
