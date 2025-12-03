import User from '../models/user.js';
import { Op } from 'sequelize';

class UserRepository {
    // Crear usuario en auth.users
    async create(data) {
        return await User.create(data);
    }

    // Buscar por email
    async findByEmail(email) {
        return await User.findOne({
            where: { email },
            attributes: ['id', 'email', 'password', 'created_at', 'updated_at']
        });
    }

    // Buscar por ID
    async findById(id) {
        return await User.findByPk(id, {
            attributes: ['id', 'email', 'password', 'created_at', 'updated_at']
        });
    }

    // Actualizar usuario
    async update(id, data) {
        await User.update(data, {
            where: { id }
        });
        return await this.findById(id);
    }

    // Eliminar usuario
    async delete(id) {
        return await User.destroy({
            where: { id }
        });
    }

    // Listar usuarios con paginación
    async findAll({ limit = 20, offset = 0, role } = {}) {
        const query = {
            limit,
            offset,
            attributes: ['id', 'email', 'created_at'],
            include: []
        };

        // Si se filtra por rol
        if (role) {
            query.include.push({
                model: Role,
                where: { name: role },
                through: { attributes: [] },
                attributes: ['id', 'name']
            });
        }

        return await User.findAll(query);
    }

    // Contar usuarios
    async count({ role } = {}) {
        const query = {};

        if (role) {
            query.include = [{
                model: Role,
                where: { name: role }
            }];
        }

        return await User.count(query);
    }

    // Buscar usuarios por email o nombre (con perfil)
    async search(searchTerm) {
        const { Op } = require('sequelize');
        
        return await User.findAll({
            attributes: ['id', 'email', 'created_at'],
            include: [{
                model: UserProfile,
                as: 'profile',
                where: {
                    [Op.or]: [
                        { full_name: { [Op.iLike]: `%${searchTerm}%` } },
                        { '$user.email$': { [Op.iLike]: `%${searchTerm}%` } }
                    ]
                }
            }]
        });
    }
}

export default new UserRepository();