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
            const { email, password} = req.body;
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

    async sendcode(req, res, next ) {
        try {
            console.log('fds')
            const { email, code } = req.body;
            const userData = await UserService.sendcode(email, code)
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }



    async changePassword(req, res, next){
        try {
            const {email, password, salt} = req.body;
            const userData = await UserService.changePassword(email, password, salt)
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async checklink(req, res, next){
        try {
            const {token} = req.params;
            const userData = await UserService.resetPassword(id, token, password)
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();