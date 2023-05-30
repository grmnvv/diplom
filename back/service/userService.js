import bcrypt, { compareSync } from "bcrypt";
import { UserModel } from "../models/userModel.js";
import { tokenModel } from "../models/tokenModel.js";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import UserDto from "../dtos/userDto.js";
import tokenService from "./tokenService.js";
import ApiError from "../middleware/apiError.js";
import emailService from "./emailService.js";
import jwt from "jsonwebtoken";
import { projectModel } from "../models/projectModel.js";

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
    const salt = uuidv4();
    const user = await UserModel.create({
      email,
      password: hashPassword,
      login,
      salt,
    });

    const userDto = new UserDto(user);

    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    console.log("fds");
    return {
      ...tokens,
      user: userDto,
    };
  }

  async login(email, password) {
    const user =
      (await UserModel.findOne({ login: email })) ||
      (await UserModel.findOne({ email }));
    if (!user) {
      throw ApiError.BadRequest(
        `пользователя с таким login/email не существует`
      );
    }
    const salt = uuidv4();
    user.salt = salt;
    await user.save();
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
    };
  }

  async sendcode(email, code) {

    const user =
      (await UserModel.findOne({ login: email })) ||
      (await UserModel.findOne({ email }));
    const salt = uuidv4();
    user.salt = salt;
    await user.save();
    console.log(salt);
    if (!user) {
      throw ApiError.BadRequest(
        `Пользователя с таким login/email не существует`
      );
    }
    await emailService.SendForgot(user.email, code);
    return {
      salt: salt,
    };
  }

  async changePassword(email, password, salt) {
    const user =
      (await UserModel.findOne({ login: email })) ||
      (await UserModel.findOne({ email }));

    if (user.salt === salt) {
      const hashPassword = await bcrypt.hash(password, 3);
      const salt = uuidv4();
      user.password = hashPassword;
      user.salt = salt;
      await user.save();
      return {
        status: "ok",
      };
    } else {
      throw ApiError.BadRequest(`Ошибка доступа`);
    }
  }
  async createProject(projectName, isHelper, refresh, imagesData, id) {
    const proj = await projectModel.findOne({name: projectName})
    if (proj){
      throw ApiError.BadRequest('Такой проект уже существует')
    }
    console.log(refresh)
    // Вам нужно получить userId, если он не доступен здесь
    const user = tokenService.validateRefreshToken(refresh)

    console.log(user)
    const newProjectData = {
      user: user.id,
      id: id,
      name: projectName,
      isHelper: isHelper,
      imageData: imagesData.map((imageData) => ({
        id: uuidv4(),
        name: imageData.name,
        url: imageData.url, // сохраняем url
        rects: imageData.rects,
      })),
    };

    const project = await projectModel.create(newProjectData);
    console.log(project);
  }
  async getProjects(refreshToken) {
    const user = tokenService.validateRefreshToken(refreshToken)
    const projects = await projectModel.find({ user: user.id });
    return projects;
  }

  async saveProject(project, refreshToken) {
    try {
        const user = tokenService.validateRefreshToken(refreshToken)

        let proj = await projectModel.findOne({ id: project.id, user: user.id });
        if (proj) {
            const currentUrls = proj.imageData.map((image) => image.url);
            Object.assign(proj, project);
            proj.imageData.forEach((image, index) => {
                image.url = currentUrls[index];
            });

            let updatedProj = await projectModel.findOneAndUpdate(
                { id: proj.id, user: user.id },  
                proj, 
                { new: true }  
            );

            console.log(updatedProj);
        }
    } catch (error) {
        console.log(error);
    }
}


  async deleteProject(refreshToken, id) {
    try {
      const user = tokenService.validateRefreshToken(refreshToken)
      let proj = await projectModel.findOneAndDelete({ id: id, user: user.id });
      return proj
    } catch (error) {
      console.log(error);
    }
  }
}

export default new UserService();
