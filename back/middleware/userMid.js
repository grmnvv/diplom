import { UserModel } from "../models/auth.model.js";
import tokenService from "../services/tokenService.js";
import ApiError from "./apiError.js";


export default async function (req, res, next){
    try {
        const authorizationHeader = req.headers['authorization'];

        if(!authorizationHeader){
            return next(ApiError.UnauthorizedError()); 
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken){
            return next(ApiError.UnauthorizedError());
        }

        const userData = tokenService.validateAccessToken(accessToken);

        if(!userData){
            return next(ApiError.UnauthorizedError());
        }
      
        const pat = await UserModel.findById(userData.id)
        
        if(!pat){
            return next(ApiError.UnauthorizedError());
        }
        req.user = userData;
        next();
    } catch (e) {
        return next(ApiError.UnauthorizedError());
    }
}