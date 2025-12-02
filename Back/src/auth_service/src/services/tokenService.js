import jwt from "jsonwebtoken";
import redis from "../config/redis.js";

export default {
  generateTokens(user) {
    const access = jwt.sign(
      { sub: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refresh = jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    redis.set(`refresh:${user.id}`, refresh);

    return { access, refresh };
  }
};
