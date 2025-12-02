// src/repositories/userProfileRepository.js
import UserProfile from '../models/userProfile.js';

class UserProfileRepository {

    // Crear un perfil (se usa al crear usuario)
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
        const fieldsToUpdate = {
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            phone: data.phone,
            genre: data.genre,
            age: data.age
        };

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
}

export default new UserProfileRepository();
