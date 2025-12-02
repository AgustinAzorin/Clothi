// src/controllers/roleController.js
import roleService from"../services/roleService.js";

class RoleController {

    // Crear rol
    async createRole(req, res) {
        try {
            const { name, description } = req.body;

            if (!name) {
                return res.status(400).json({
                    ok: false,
                    message: "Role name is required"
                });
            }

            const role = await roleService.createRole({ name, description });

            return res.status(201).json({
                ok: true,
                message: "Role created successfully",
                role
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error creating role"
            });
        }
    }

    // Obtener todos los roles
    async getAllRoles(req, res) {
        try {
            const roles = await roleService.getRoles();

            return res.status(200).json({
                ok: true,
                roles
            });
        } catch (err) {
            return res.status(500).json({
                ok: false,
                message: "Error fetching roles"
            });
        }
    }

    // Obtener rol por ID
    async getRoleById(req, res) {
        try {
            const { id } = req.params;

            const role = await roleService.getRoleById(id);

            if (!role) {
                return res.status(404).json({
                    ok: false,
                    message: "Role not found"
                });
            }

            return res.status(200).json({
                ok: true,
                role
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error fetching role"
            });
        }
    }

    // Actualizar rol
    async updateRole(req, res) {
        try {
            const { id } = req.params;
            const { name, description } = req.body;

            const updatedRole = await roleService.updateRole(id, { name, description });

            return res.status(200).json({
                ok: true,
                message: "Role updated successfully",
                role: updatedRole
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error updating role"
            });
        }
    }

    // Eliminar rol
    async deleteRole(req, res) {
        try {
            const { id } = req.params;

            await roleService.deleteRole(id);

            return res.status(200).json({
                ok: true,
                message: "Role deleted successfully"
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error deleting role"
            });
        }
    }
    // Asignar permiso a un rol
    async assignPermission(req, res) {
        try {
            const { roleId } = req.params;
            const { permissionId } = req.body;

            const result = await roleService.assignPermission(roleId, permissionId);

            return res.status(201).json({
                ok: true,
                message: "Permission assigned successfully",
                result
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error assigning permission"
            });
        }
    }

    // Remover permiso de un rol
    async removePermission(req, res) {
        try {
            const { roleId, permissionId } = req.params;

            await roleService.removePermission(roleId, permissionId);

            return res.status(200).json({
                ok: true,
                message: "Permission removed successfully"
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error removing permission"
            });
        }
    }
}

export default new RoleController();