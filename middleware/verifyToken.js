import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

export const auth = async (req, res, next) => {
    const token = req.cookies.auth_token; // Получаем токен, который сохраняется в куки
    if (!token) {
        next();
    } else {
        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET); // Верифицируем токен
            req.user = await User.findOne({_id: verified._id});
            next();
        } catch (err) {
            res.cookie('auth_token', '', {maxAge: 0}); // Удаляем куки с токеном
            res.status(400).render('./status/400');
        }
    }
}
