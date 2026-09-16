/**
 * ============================================================
 * © 2025 Diploy — a brand of Bisht Technologies Private Limited
 * Original Author: BTPL Engineering Team
 * Website: https://diploy.in
 * Contact: cs@diploy.in
 *
 * Distributed under the Envato / CodeCanyon License Agreement.
 * Licensed to the purchaser for use as defined by the
 * Envato Market (CodeCanyon) Regular or Extended License.
 *
 * You are NOT permitted to redistribute, resell, sublicense,
 * or share this source code, in whole or in part.
 * Respect the author's rights and Envato licensing terms.
 * ============================================================
 */

import { Express } from "express";
import { getFirebaseConfig, updateFirebaseConfig } from "../controllers/firebase.settings.controller";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";

export function registerFirebaseSettingsRoutes(app: Express) {
  app.get("/api/firebase-settings", requireAuth, requireRole("superadmin"), getFirebaseConfig);
  app.post("/api/firebase-settings/update", requireAuth, requireRole("superadmin"), updateFirebaseConfig);
}
