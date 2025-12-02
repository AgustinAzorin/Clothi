// middlewares/authorize.js
import roleService from "../services/roleService.js";
import permissionService from "../services/permissionService.js";
import redis from "../config/redis.js"; // opcional: si no lo tenés, export null o mock

/**
 * authorize(options)
 * options: {
 *   roles: ['admin','user'],        // OR empty
 *   permissions: ['create_user']    // OR empty
 * }
 *
 * También podés usar short-hands:
 * authorize(['admin']) // roles only
 * authorize('create_user') // permission only
 */
export default function authorize(options = {}) {
  // soporta authorize(['admin']) o authorize('perm') o authorize({ roles: [], permissions: [] })
  let roles = [];
  let permissions = [];

  if (Array.isArray(options)) roles = options;
  else if (typeof options === "string") permissions = [options];
  else {
    roles = options.roles ?? [];
    permissions = options.permissions ?? [];
  }

  return async (req, res, next) => {
    try {
      // req.user viene del middleware authenticate (debe haberlo ejecutado antes)
      const user = req.user;
      if (!user || !user.sub) {
        return res.status(401).json({ error: "Unauthorized: no user" });
      }
      const userId = user.sub;

      // 1) Si no se piden roles ni permisos, permitir (o podrías negar; acá permito)
      if (roles.length === 0 && permissions.length === 0) return next();

      // 2) Intentar leer cache de Redis (si disponible) para roles/permisos del user
      let cached = null;
      if (redis && typeof redis.get === "function") {
        const key = `auth_meta:${userId}`;
        const raw = await redis.get(key);
        if (raw) {
          try { cached = JSON.parse(raw); } catch (err) { cached = null; }
        }
      }

      let userRoles = [];
      let userPermissions = [];

      if (cached) {
        userRoles = cached.roles || [];
        userPermissions = cached.permissions || [];
      } else {
        // Traer roles y permisos desde services (estos deben devolver arrays de strings)
        userRoles = await roleService.getUserRolesNames(userId); // ej: ['user','admin']
        userPermissions = await permissionService.getPermissionsForUser(userId); // ej: ['create_user', 'delete_user']

        // Guardar en cache (TTL 60s por defecto)
        if (redis && typeof redis.set === "function") {
          const key = `auth_meta:${userId}`;
          await redis.set(key, JSON.stringify({ roles: userRoles, permissions: userPermissions }), {
            EX: 60
          }).catch(()=>{}); // no romper si falla cache
        }
      }

      // 3) Check roles (si pediste roles)
      if (roles.length > 0) {
        const hasRole = roles.some(r => userRoles.includes(r));
        if (!hasRole) {
          return res.status(403).json({ error: "Forbidden: insufficient role" });
        }
      }

      // 4) Check permissions (si pediste permisos)
      if (permissions.length > 0) {
        const hasPerm = permissions.some(p => userPermissions.includes(p));
        if (!hasPerm) {
          return res.status(403).json({ error: "Forbidden: insufficient permissions" });
        }
      }

      // 5) OK
      next();
    } catch (err) {
      console.error("authorize middleware error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
}
