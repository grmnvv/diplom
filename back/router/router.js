import { Router } from "express";
import UserController from "../controllers/userController.js";
import multer from "multer";
const router = new Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/Users/egorgarmanov/Desktop/he/'); // Устанавливаем директорию для сохранения файлов
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname); // Генерируем уникальное имя файла
    },
  });

  const upload = multer({ storage }); 

router.post('/registration', UserController.registration);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/sendcode', UserController.sendcode)
router.post('/changePassword', UserController.changePassword)
router.post('/createProject', upload.array("images"), UserController.createProject)
router.post('/saveProject', UserController.saveProject)
router.get('/activate/:link', UserController.activate)
router.get('/refresh', UserController.refresh);
router.get('/checklink', UserController.checklink);
router.get('/getProjects', UserController.getProjects);


export default router;