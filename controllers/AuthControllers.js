import User from "../models/UserModel.js";
import {registrationValidatation, loginValidation} from "../validation/SchemaValidation.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";
import jwt from "jsonwebtoken";


export const getLogin = (req, res) => {
    if (req.user) {
        res.status(200).redirect('/');
    } else {
        res.render('login', {title: 'Коцюба Тарас | Курсовая работа'});
    }
};

export const getRegistration = (req, res) => {
    if (req.user) {
        res.status(200).redirect('/')
    } else {
        res.render('registration', {title: 'Коцюба Тарас | Курсовая работа'});
    }
};

export const logOut = (req, res) => {
    if (req.user) {
        res.cookie('auth_token', '', {maxAge: 0});
        res.status(200).redirect('/');
    } else {
        res.redirect('/login')
    }
}

export const postLogin = async (req, res) => {
    const {error} = loginValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const user = await User.findOne({email: req.body.email})
    if (!user) return res.status(400).send('Account with this email does not exist');

    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    // Создание и присвоение токена
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    res.cookie('auth_token', token, {maxAge: 86400000, httpOnly: true});
    res.status(200).redirect('/');

};

export const postRegistration = async (req, res) => {
    // Валидация введенных пользователем данных
    const {error} = registrationValidatation(req.body);
    // Если данные введены неправильно - вернуть ошибку
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    // Проверка существует ли уже аккаунт с указаным пользователем почтовым ящиком
    const emailExists = await User.findOne({email: req.body.email})
    if (emailExists) return res.status(400).send('Email already exists');

    // Хешированние пароля
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt)

    // Создаем нового пользователя на основании модели User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashPassword,
    });

    // Сохраняем данные о пользователе в базе данных или отправляем ошибку
    try {
        const savedUser = await user.save();
        res.status(200).redirect('/')

    } catch (err) {
        res.status(400).send(err)
    }
};