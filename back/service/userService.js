import bcrypt, { compareSync } from "bcrypt";
import { UserModel } from "../models/userModel.js";
import { tokenModel } from "../models/tokenModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from 'dotenv';
import UserDto from "../dtos/userDto.js";
import tokenService from "./tokenService.js";
import ApiError from "../middleware/apiError.js";
import emailService from "./emailService.js";
import jwt from 'jsonwebtoken';

class UserService {

    async registration(email, password, login) {
      const candidate = await UserModel.findOne({ email });
      if (candidate) {
        throw ApiError.BadRequest(
          `Пользователь с почтовым адресом ${email} уже существует`
        );
      }
      const candidate2 = await UserModel.findOne({ login });

      if (candidate2) {
        throw ApiError.BadRequest(
          `Пользователь с логином ${login} уже существует`
        );
      }

      const hashPassword = await bcrypt.hash(password, 3);
      const activationLink = uuidv4();
      const user = await UserModel.create({email, password: hashPassword, login, activationLink})

      const userDto = new UserDto(user);

      const tokens = tokenService.generateTokens({...userDto})

      await tokenService.saveToken(userDto.id, tokens.refreshToken);
      console.log('fds')
      return {
        ...tokens,
        user: userDto,
      };
    }

    async login(email, password, login){
      const user = login ? await UserModel.findOne({ login }) : await UserModel.findOne({ email });
      if (!user) {
          throw ApiError.BadRequest(`Пользователя с таким login/email не существует`);
      }

      const isPassEqual = await bcrypt.compare(password, user.password);
      if (!isPassEqual) {
          throw ApiError.BadRequest("Неверный пароль");
      }
      const userDto = new UserDto(user);
      const token = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, token.refreshToken);
      return {
          ...token,
          user: userDto,
      };
    }

    async activate(activationLink) {
      const user = await UserModel.findOne({ activationLink });
      if (!user) {
        throw ApiError.BadRequest("Некорректная ссылка активации");
      }
      user.isActivated = true;
      await user.save();
    }

    async logout(refreshToken) {
      const token = await tokenService.removeToken(refreshToken);
      return token;
    }

    async refresh(refreshToken) {
      if (!refreshToken) {
        throw ApiError.UnauthorizedError();
      }
      const userData = tokenService.validateRefreshToken(refreshToken);
      const tokenFromDb = tokenService.findToken(refreshToken);
      if (!userData || !tokenFromDb) {
        throw ApiError.UnauthorizedError();
      }

      const user = await UserModel.findById(userData.id);
      const userDto = new UserDto(user);
      const token = tokenService.generateTokens({ ...userDto });
      await tokenService.saveToken(userDto.id, token.refreshToken);
      return {
        ...token,
        user: userDto,
      }
    }

    async mailForgot(email, login){ //тут мы генерируем ссылку
      const user = login ? await UserModel.findOne({ login }) : await UserModel.findOne({ email });
      if (!user) {
        throw ApiError.BadRequest(`Пользователя с таким login/email не существует`);;
      }
      const payload = {
        id: user._id,
        email: user.email
      }
      const secret = process.env.RESETLINK + user._id;
      const token = jwt.sign(payload, secret, {expiresIn:'30s'})
      await emailService.SendForgot(user.email, user._id, token)
      return {'response':'Письмо было отправлено'}
    }

    async resetPassword(id, token, password){ //тут мы проверяем валидность и перезаписываем пароль
      const secret = process.env.RESETLINK + id;
      const payload = jwt.verify(token, secret)
      if (!payload) {
        throw ApiError.BadRequest('Неверная ссылка')
      }
      if (id !== payload.id){
        throw ApiError.BadRequest('Неверная ссылка')
      }
      const hashPassword = await bcrypt.hash(password, 3);
      await UserModel.findByIdAndUpdate({_id: payload.id}, {password: hashPassword})
    }
}

export default new UserService();