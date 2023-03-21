import UserService from "../service/userService.js";

class UserController {

    async registration(req, res, next) {
        try {
            const {email, password, login} = req.body;
            const userData = await UserService.registration(email, password, login);
            console.log(userData)
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})

            return res.json(userData);
        } catch (e) {
            next(e);
        }
        
      }

    async login(req, res, next) {
        try {
            const { email, password, login } = req.body;
            const userData = await UserService.login(email, password, login);
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

    async forgotMail(req, res, next ) {
        try {
            const { email, login } = req.body;
            const userData = await UserService.mailForgot(email, login)
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }



    async resetPassword(req, res, next){
        try {
            const {id, token} = req.params;
            const {password} = req.body;
            console.log(token)
            const userData = await UserService.resetPassword(id, token, password)
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();