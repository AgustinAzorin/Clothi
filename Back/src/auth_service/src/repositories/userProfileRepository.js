import UserProfile from '../models/userProfile.js';

class UserProfileRepository {
    // Crear un perfil
    async createProfile(data) {
        return await UserProfile.create(data);
    }

    // Obtener perfil por ID de usuario
    async getProfileByUserId(userId) {
        return await UserProfile.findOne({
            where: { id: userId }
        });
    }

    // Actualizar solo los campos del perfil
    async updateProfile(userId, data) {
        // Solo campos permitidos del perfil
        const fieldsToUpdate = {};
        
        if (data.full_name !== undefined) fieldsToUpdate.full_name = data.full_name;
        if (data.phone !== undefined) fieldsToUpdate.phone = data.phone;
        if (data.genre !== undefined) fieldsToUpdate.genre = data.genre;
        if (data.age !== undefined) fieldsToUpdate.age = data.age;
        if (data.avatar_url !== undefined) fieldsToUpdate.avatar_url = data.avatar_url;

        await UserProfile.update(fieldsToUpdate, {
            where: { id: userId }
        });

        return await this.getProfileByUserId(userId);
    }

    // Eliminar perfil
    async deleteProfile(userId) {
        return await UserProfile.destroy({
            where: { id: userId }
        });
    }

    // Buscar perfiles por nombre
    async searchByFullName(name) {
        const { Op } = require('sequelize');
        return await UserProfile.findAll({
            where: {
                full_name: { [Op.iLike]: `%${name}%` }
            }
        });
    }
}

export default new UserProfileRepository();