import jwt from 'jsonwebtoken'
import { tokenModel } from '../models/tokenModel.js';
class tokenService{
    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWTAS, {expiresIn:'30d'});
        const refreshToken = jwt.sign(payload, process.env.JWTRS, {expiresIn:'30d'});
        return{
            accessToken,
            refreshToken
        }
    }

    validateAccessToken(token){
        try {
            const userData = jwt.verify(token, process.env.JWTAS);
            return userData; 
        } catch (e) {
            return null;
        }
    }
    validateRefreshToken(token){
        try {
            const userData = jwt.verify(token, process.env.JWTRS);
            return userData; 
        } catch (e) {
            return null;
        }
    }

    async saveToken(userId, refreshToken){
        const tokenData = await tokenModel.findOne({user:userId})
        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({user:userId, refreshToken})
        return token;
    }

    async removeToken(refreshToken){
        const tokenData = tokenModel.deleteOne({refreshToken});
        return tokenData;
    }

    async findToken(refreshToken){
        const tokenData = tokenModel.findOne({refreshToken});
        return tokenData;
    }
}

export default new tokenService;