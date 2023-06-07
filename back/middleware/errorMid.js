// Импортируем класс ApiError
import ApiError from "./apiError.js";

// Экспортируем обработчик ошибок
export default function (err, req, res, next){
    // Если ошибка является экземпляром ApiError...
    if(err instanceof ApiError){
        // ...возвращаем клиенту статус ошибки и JSON-объект с сообщением об ошибке и связанными с ней ошибками.
        return res.status(err.status).json({message: err.message, errors: err.errors});
    }
    // Если ошибка не является экземпляром ApiError, возвращаем статус 500 (внутренняя ошибка сервера)...
    return res.status(500).json({message:'Непредвиденная ошибка'});
}
