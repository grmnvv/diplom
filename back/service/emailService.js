import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
import { UserModel } from '../models/userModel.js';
dotenv.config()

class mailService {
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth:{
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }
    async SendActivationMail(to, name, patronymic, link){
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: `Активация аккаунта FastAnnot`,
            text: 'Подтверждение аккаунта',
            html:
                `
                <div>
                    <h1>Уважаемый/ая ${name} ${patronymic}, Вы зарегистрировались на сайте мединского центра MCenter.</h1>
                    <h2>Чтобы активировать аккаунт, перейдите по ссылке:</h2>
                    <a style="font-size: 30px" href="${link}">Активация аккаунта</a>
                </div>
                `
        })
    }
    async SendForgot(email, id, payload){
        console.log(email)
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_USER,
                to: email,
                subject: `Сброс пароля`,
                text: 'Если вы не сбрасывали пароль, не реагируйте на это письмо',
                html:
                    `
                    <div>
                        <h1>Перейдите по ссылке для сброса пароля</h1>
                        <a style="font-size: 30px" href="http://localhost:5001/api/reset-password/${id}/${payload}">Сброс</a>
                    </div>
                    `
            })
        } catch (e) {
            console.log(e)
        }
        
    }
}


export default new mailService();