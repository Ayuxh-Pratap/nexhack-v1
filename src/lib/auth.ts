/**
 * Auth module - Re-exported from auth-server for backward compatibility
 * All auth logic now uses Firebase
 */
export { getSession, verifyFirebaseToken } from "./auth-server";