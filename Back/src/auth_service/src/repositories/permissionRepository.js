// src/repositories/permissionRepository.js
import Permission from '../models/permission.js';

class PermissionRepository {
    
    async create(data) {
        return await Permission.create(data);
    }
    
    async findAll() {
        return await Permission.findAll({
            order: [['module', 'ASC'], ['name', 'ASC']]
        });
    }
    
    async findById(id) {
        return await Permission.findByPk(id);
    }
    
    async findByName(name) {
        return await Permission.findOne({ where: { name } });
    }
    
    async findByModule(module) {
        return await Permission.findAll({
            where: { module },
            order: [['name', 'ASC']]
        });
    }
    
    async update(id, data) {
        const permission = await Permission.findByPk(id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        return await permission.update(data);
    }
    
    async delete(id) {
        const permission = await Permission.findByPk(id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        return await permission.destroy();
    }
}

export default new PermissionRepository();