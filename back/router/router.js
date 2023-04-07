import { Router } from "express";
import UserController from "../controllers/userController.js";
const router = new Router();

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/sendcode', UserController.sendcode)
router.post('/changePassword', UserController.changePassword)
router.get('/activate/:link', UserController.activate)
router.get('/refresh', UserController.refresh);
router.get('/checklink', UserController.checklink);


export default router;