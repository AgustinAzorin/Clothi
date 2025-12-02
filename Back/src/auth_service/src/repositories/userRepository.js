import User from "../models/user.js";
import UserProfile from "../models/userProfile.js";

export default {
  findByEmail: (email) => User.findOne({ where: { email } }),
  findById: (id) => User.findByPk(id),
  createUser: (data) => User.create(data),
  createProfile: (data) => UserProfile.create(data),
};
