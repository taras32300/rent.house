import Product from '../models/ProductModel.js'
import mongoose from 'mongoose'
import User from '../models/UserModel.js'
import {request} from 'express'
import {productValidation} from '../validation/SchemaValidation.js'

export const getStoreCategories = async (req, res) => {
    let products;

    // Возможен вариант когда на сервер приходят не валидные данные
    // И поэтому им нужно задать значение по умолчанию
    const rooms_from = parseInt(req.query.rooms_from) || 1,
        rooms_to = parseInt(req.query.rooms_to) || 64,
        square_from = parseInt(req.query.square_from) || 1,
        square_to = parseInt(req.query.square_to) || 4096000,
        price_from = parseInt(req.query.price_from) || 1,
        price_to = parseInt(req.query.price_to) || 1000000000;

    // Ищем объявления, которые подпадают по заданные пользователем параметры
    if (req.query.sort == 1) {
        products = await Product.find({
            "rooms": {$gte: rooms_from, $lte: rooms_to},
            "square": {$gte: square_from, $lte: square_to},
            "price": {$gte: price_from, $lte: price_to},
        }).limit(20).sort({price: 1})
    } else {
        products = await Product.find({
            "rooms": {$gte: rooms_from, $lte: rooms_to},
            "square": {$gte: square_from, $lte: square_to},
            "price": {$gte: price_from, $lte: price_to},
        }).limit(20).sort({price: -1})
    }

    const data = {
        title: 'Коцюба Тарас | Курсовая работа',
        user: req.user,
        products: products,
        query: req.query,
        page: 'buy'
    };

    res.render('store', data)
}

export const createProduct = async (req, res) => {
    // Если в заполненной форме весть ошибка - вернуть ее пользователю
    const {error} = productValidation(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message)
    }
    ;

    // Массив с путям к файлам, которые мы будем сохранять в БД

    const filePaths = []
    req.files.forEach((file) => {
        let name = file.path;
        filePaths.push(name)
    })

    // Новые объявления
    const product = new Product({
        author: req.user.id,
        title: req.body.title,
        body: req.body.body,
        price: parseInt(req.body.price),
        thumb: req.body.thumb,
        images: filePaths,
        floor: parseInt(req.body.floor),
        square: parseInt(req.body.square),
        rooms: parseInt(req.body.rooms),
        heating: req.body.heating,
        furniture: Boolean(req.body.furniture),
        refit: req.body.refit,
        infrastructure: req.body.infrastructure
    });

    try {
        const savedProduct = await product.save(); // Сохраняем только что созданное объявление в базе данных
        res.status(200).redirect('/account',);
    } catch (err) {
        res.status(400).send(err)
    }
}
export const removeProductDetails = async (req, res) => {
    const product = await Product.findOne({id: req.params.id});
    const author = product.author;


    // Проверяем сбегаются ли идентификатор автора объявления
    // С идентификатором пользователя который пытается удалить объявление
    if (req.user.id === author.toString()) {
        await Product.findOne({id: req.params.id}).deleteOne(); // Если все правильно - удаляем объявление
        res.status(200).redirect('/store')
    } else {
        // Если идентификаторы не совпадают - возвращаем 403 ошибку
        res.status(403).redirect('/status/403');
    }

}
export const getProductDetails = async (req, res) => {
    const id = req.params.id;

    try {
        const product = await Product.findOne({_id: id});
        const author = await User.findOne({_id: product.author})
        res.render('room-details', {
            product: product,
            user: req.user,
            author: author,
            title: 'Коцюба Тарас | Курсовая работа',
            page: 'buy'
        });
    } catch (err) {
        res.status(400).send('Invalid request')
    }


}

export const productCreation = async (req, res) => {
    if (req.user) {
        res.render('edit', {user: req.user, title: 'Коцюба Тарас | Курсовая работа', page: 'sell'})
    } else {
        res.render('./status/401')
    }
}