/**
 * Device utilities for authentication
 * Collects device data for backend authentication
 */

export interface DeviceData {
    fcm_token?: string;
    timezone: string;
}

/**
 * Get user's timezone
 */
export function getUserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
        return "UTC";
    }
}

/**
 * Get FCM token (Firebase Cloud Messaging)
 * Returns empty string if not available (permissions not granted, service worker not registered, etc.)
 */
export async function getFCMToken(): Promise<string> {
    // Check if we're in browser environment
    if (typeof window === "undefined") {
        return "";
    }

    // Check if service workers are supported
    if (!("serviceWorker" in navigator)) {
        return "";
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
        return "";
    }

    try {
        // Dynamically import firebase/messaging only if available
        // This prevents errors if firebase/messaging is not installed
        const { getMessaging, getToken } = await import("firebase/messaging");
        const { app } = await import("@/lib/firebase");
        
        const messaging = getMessaging(app);
        
        // Request notification permission
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission not granted");
            return "";
        }

        // Get FCM token
        // Note: You need to configure your Firebase project with a VAPID key
        // For now, we'll return empty string if token retrieval fails
        try {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            });
            return token || "";
        } catch (tokenError) {
            console.log("FCM token retrieval failed (this is normal if VAPID key is not configured):", tokenError);
            return "";
        }
    } catch (error) {
        // Firebase messaging not installed or not configured
        // This is fine - FCM token is optional
        console.log("FCM not available (this is normal if firebase/messaging is not installed):", error);
        return "";
    }
}

/**
 * Get device data for authentication
 * FCM token will be empty string if not available (permissions, service worker, or FCM not configured)
 */
export async function getDeviceData(): Promise<DeviceData> {
    const fcmToken = await getFCMToken();
    
    return {
        fcm_token: fcmToken || "", // Empty string if not available
        timezone: getUserTimezone(),
    };
}

