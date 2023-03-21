import express from 'express'
import cors from 'cors';
import cookieParser from "cookie-parser";
import dotenv from 'dotenv'
import mongoose from "mongoose";
import router from './router/router.js'
import errorMid from './middleware/errorMid.js';
dotenv.config()


const PORT = 5001;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));
app.use('/api', router);
app.use(errorMid)


const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            family: 4
        });
        console.log("[DB] Connected to MongoDB");
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}


start();