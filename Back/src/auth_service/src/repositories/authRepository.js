import Session from "../models/session.js";

export default {
  createSession: (data) => Session.create(data),
  invalidateSession: (id) =>
    Session.update({ is_valid: false }, { where: { id } }),
};
