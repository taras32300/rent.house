import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bodyParser from "express";
import cookieParser from "cookie-parser";
import colors from "colors";
import Table from "cli-table";

import authRoutes from "./routes/AuthRoutes.js";
import storeRoutes from "./routes/StoreRoutes.js";
import accountRoutes from "./routes/AccountRouters.js"

import {auth} from "./middleware/verifyToken.js";
import {logger} from "./middleware/logger.js";
import {execPath} from "process";


dotenv.config({path: './config/.env'});
const date = new Date();
const template = `[${date.getFullYear()}-${date.getMonth('2-digit')}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}]`;

//Подключение к БД
try {
    mongoose.connect(process.env.DB_CONNECT, () => {
        console.log(template + colors.yellow('   Подключение с базой данных успешно установлено'));
    })
} catch (err) {
    console.error(err)
}


// Импорт роутов


const __dirname = path.resolve()
// Порт сервиса
const PORT = process.env.PORT || 48175


const app = express();

// Middleware для получения данных от пользователя
app.use(express.json());
app.use(express.urlencoded());

// Middleware для работы с куки
app.use(cookieParser());

// Указываем путь, в котором будут сохраняться статичные файлы (Шрифты, Картинки, Иконки)
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use('/img', express.static(path.join(__dirname, '/public/img')));
app.use('/css', express.static(path.join(__dirname, '/public/css')));
app.use('/js', express.static(path.join(__dirname, '/public/js')));
app.use('/uploads', express.static(path.join(__dirname, '/public/img/uploads')));
// Шаблонизатор pug
app.set('view engine', 'pug');

// Путь для шаблонов
app.set('views', path.resolve(__dirname, 'public/views'));

// Роуты
app.use(authRoutes);
app.use(storeRoutes);
app.use(accountRoutes);

// Главная страница
app.get('/', auth, logger, (req, res) => {
    const data = {
        title: 'Коцюба Тарас | Курсовая работа',
        user: req.user,
        page: 'home'
    };
    res.render('index', data);
})

// Страница 404
app.get('**', logger, (req, res) => {
    res.render('./status/404')
});


// instantiate


// Запускаємо веб сервер
app.listen(PORT, () => {
    var table = new Table({
        head: ['', '']
        , colWidths: [30, 30]
    });

    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    table.push(
        ['Автор', 'Коцюба Тарас'],
        ['Проект', 'Курсовая робота'],
        ['Выполнено', '2022г.']
    );
    console.log(table.toString());
    console.log(template + colors.yellow(`   Сервер запущен на порте ${PORT}`));
})