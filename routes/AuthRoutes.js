// Импортируем класс Router из пакета ExpressJs
import {Router} from "express";
import {auth} from "../middleware/verifyToken.js";
import {logger} from "../middleware/logger.js";

// Импортируем необходимые контроллеры
import {getLogin, getRegistration, logOut, postLogin, postRegistration} from "../controllers/AuthControllers.js";

// Создаем новый экземляр роутера
const router = Router();

// Создаем конечные точки (endpoints)
router.get('/login', auth, logger, getLogin);
router.get('/signup', auth, logger, getRegistration);
router.post('/login', auth, logger, postLogin);
router.post('/signup', auth, logger, postRegistration);
router.get('/logout', auth, logger, logOut);
// Экспортируем роутер
export default router;