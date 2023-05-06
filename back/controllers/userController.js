import UserService from "../service/userService.js";

class UserController {
  async registration(req, res, next) {
    try {
      const { email, password, login } = req.body;
      const userData = await UserService.registration(email, password, login);
      console.log(userData);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });

      return res.json(userData);
    } catch (e) {
      console.log(e);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const userData = await UserService.login(email, password);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);
      res.clearCookie("refreshToken");
      return res.json(token);
    } catch (e) {
      next(e);
    }
  }

  async activate(req, res, next) {
    try {
      const activationLink = req.params.link;
      await UserService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);
      res.cookie("refreshToken", userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async sendcode(req, res, next) {
    try {
      console.log("fds");
      const { email, code } = req.body;
      const userData = await UserService.sendcode(email, code);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { email, password, salt } = req.body;
      const userData = await UserService.changePassword(email, password, salt);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }

  async checklink(req, res, next) {
    try {
      const { token } = req.params;
      const userData = await UserService.resetPassword(id, token, password);
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
  async createProject(req, res, next) {
    try {
      const { projectName, isHelper, id } = req.body;
      const { refreshToken } = req.cookies;
      console.log(req)
      const imagesData = req.files.map((file, index) => ({
        url: file.path, // Используйте свойство 'path' для доступа к пути файла
        rects: JSON.parse(req.body[`rects[${index}]`] || "[]"),
        name: file.originalname,
      }));
      console.log(id);
      // ... (Код создания проекта и сохранения данных)

      const userData = await UserService.createProject(
        projectName,
        isHelper,
        refreshToken,
        imagesData, 
        id
      );
      return res.json(userData);
    } catch (e) {
      console.log(e)
    }
  }

  async getProjects(req, res, next) {
    try {
      const { refreshToken } = req.cookies;
      const projects = await UserService.getProjects(refreshToken);
      return res.json(projects);
    } catch (e) {
      next(e);
    }
  }
  async saveProject(req, res, next){
    try {
        const {project} = req.body;
        const { refreshToken } = req.cookies;
        const response = await UserService.saveProject(project, refreshToken)
    } catch (e) {
      next(e);
    }
  }
  async deleteProject(req, res, next){
    try {
        const {id} = req.params;
        console.log(id)
        const { refreshToken } = req.cookies;
        const response = await UserService.deleteProject(refreshToken, id)
        return res.json(response)
    } catch (e) {
      next(e);
    }
  }
}

export default new UserController();
