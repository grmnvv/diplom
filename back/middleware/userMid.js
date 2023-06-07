// Импортируем модель пользователя и сервис токенов, а также класс ApiError
import { UserModel } from "../models/auth.model.js";
import tokenService from "../services/tokenService.js";
import ApiError from "./apiError.js";

// Экспортируем асинхронное промежуточное ПО для проверки аутентификации
export default async function (req, res, next){
    try {
        // Извлекаем заголовок 'Authorization' из запроса
        const authorizationHeader = req.headers['authorization'];

        // Если заголовка 'Authorization' нет, возвращаем ошибку 'Unauthorized'
        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError()); 
        }

        // Извлекаем токен доступа из заголовка 'Authorization'
        const accessToken = authorizationHeader.split(' ')[1];
        // Если токен доступа отсутствует, возвращаем ошибку 'Unauthorized'
        if(!accessToken){
            return next(ApiError.UnauthorizedError());
        }

        // Проверяем токен доступа и извлекаем из него данные пользователя
        const userData = tokenService.validateAccessToken(accessToken);

        // Если данные пользователя не могут быть извлечены из токена, возвращаем ошибку 'Unauthorized'
        if(!userData){
            return next(ApiError.UnauthorizedError());
        }
        // Если токен проверен успешно, сохраняем данные пользователя в объекте запроса
        req.user = userData;
        // Передаем управление следующему промежуточному ПО
        next();
    } catch (e) {
        // Если при проверке токена произошла ошибка, возвращаем ошибку 'Unauthorized'
        return next(ApiError.UnauthorizedError());
    }
}
