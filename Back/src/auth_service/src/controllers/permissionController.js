// src/controllers/permissionController.js
import permissionService from'../services/permissionService.js';

class PermissionController {

    // Crear permiso
    async createPermission(req, res) {
        try {
            const { name, description } = req.body;

            const permission = await permissionService.createPermission({ name, description });

            res.status(201).json({
                ok: true,
                message: "Permission created successfully",
                permission
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error creating permission"
            });
        }
    }

    // Obtener todos los permisos
    async getAllPermissions(req, res) {
        try {
            const permissions = await permissionService.getPermissions();

            res.status(200).json({
                ok: true,
                permissions
            });

        } catch (err) {
            res.status(500).json({
                ok: false,
                message: err.message || "Error fetching permissions"
            });
        }
    }

    // Obtener un permiso por ID
    async getPermissionById(req, res) {
        try {
            const { id } = req.params;

            const permission = await permissionService.getPermissionById(id);

            res.status(200).json({
                ok: true,
                permission
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error fetching permission"
            });
        }
    }

    // Actualizar permiso
    async updatePermission(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const updatedPermission = await permissionService.updatePermission(id, { name, description });

            res.status(200).json({
                ok: true,
                message: "Permission updated successfully",
                permission: updatedPermission
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error updating permission"
            });
        }
    }

    // Eliminar permiso
    async deletePermission(req, res) {
        try {
            const { id } = req.params;

            await permissionService.deletePermission(id);

            res.status(200).json({
                ok: true,
                message: "Permission deleted successfully"
            });

        } catch (err) {
            res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error deleting permission"
            });
        }
    }
}

export default new PermissionController();

