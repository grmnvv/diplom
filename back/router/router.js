import { Router } from "express";
import UserController from "../controllers/userController.js";
const router = new Router();

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/forgotEmail', UserController.forgotMail)
router.post('/changePassword', UserController.forgotMail)
router.post('/reset-password/:id/:token', UserController.resetPassword)
router.get('/activate/:link', UserController.activate)
router.get('/refresh', UserController.refresh);


export default router;