// src/controllers/permissionController.js
import permissionService from "../services/permissionService.js";

class PermissionController {
    
    async createPermission(req, res) {
        try {
            const { name, description, module, action } = req.body;
            
            if (!name || !module || !action) {
                return res.status(400).json({
                    ok: false,
                    message: "Name, module and action are required"
                });
            }
            
            const permission = await permissionService.createPermission({
                name, description, module, action
            });
            
            return res.status(201).json({
                ok: true,
                message: "Permission created successfully",
                data: permission
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error creating permission"
            });
        }
    }
    
    async getAllPermissions(req, res) {
        try {
            const permissions = await permissionService.getAllPermissions();
            return res.status(200).json({
                ok: true,
                data: permissions
            });
        } catch (err) {
            return res.status(500).json({
                ok: false,
                message: "Error fetching permissions"
            });
        }
    }
    
    async getPermissionById(req, res) {
        try {
            const { id } = req.params;
            const permission = await permissionService.getPermissionById(id);
            
            return res.status(200).json({
                ok: true,
                data: permission
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error fetching permission"
            });
        }
    }
    
    async getPermissionsByModule(req, res) {
        try {
            const { module } = req.params;
            const permissions = await permissionService.getPermissionsByModule(module);
            
            return res.status(200).json({
                ok: true,
                data: permissions
            });
        } catch (err) {
            return res.status(500).json({
                ok: false,
                message: "Error fetching permissions by module"
            });
        }
    }
    
    async updatePermission(req, res) {
        try {
            const { id } = req.params;
            const updated = await permissionService.updatePermission(id, req.body);
            
            return res.status(200).json({
                ok: true,
                message: "Permission updated successfully",
                data: updated
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error updating permission"
            });
        }
    }
    
    async deletePermission(req, res) {
        try {
            const { id } = req.params;
            await permissionService.deletePermission(id);
            
            return res.status(200).json({
                ok: true,
                message: "Permission deleted successfully"
            });
        } catch (err) {
            return res.status(err.status || 500).json({
                ok: false,
                message: err.message || "Error deleting permission"
            });
        }
    }
}

export default new PermissionController();