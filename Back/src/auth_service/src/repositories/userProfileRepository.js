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
    async findAll({ limit, offset, role }) {
        const query = {
            limit,
            offset,
            include: [
                {
                    model: UserProfile,
                    as: 'profile'
                }
            ]
        };

        if (role) {
            query.include.push({
                model: Role,
                where: { name: role },
                through: { attributes: [] }
            });
        }

        return await User.findAll(query);
    }

    async count({ role }) {
        const query = {};

        if (role) {
            query.include = [{
                model: Role,
                where: { name: role }
            }];
        }

        return await User.count(query);
    }

    async search(searchTerm) {
        return await User.findAll({
            include: [{
                model: UserProfile,
                as: 'profile',
                where: {
                    [Op.or]: [
                        { full_name: { [Op.iLike]: `%${searchTerm}%` } },
                        { email: { [Op.iLike]: `%${searchTerm}%` } }
                    ]
                }
            }]
        });
    }

}

export default new UserProfileRepository();
