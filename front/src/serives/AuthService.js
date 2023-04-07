import $api from "../http";


export default class AuthService {
    static async login(email, password){
        return $api.post('/login', {email, password})
    }
    static async registration(email, password, login){
        return $api.post('/registration', {email, password, login})
    }
    static async logout(){
        return $api.post('/logout')
    }
    static async sendCode(email, code){
        return $api.post('/sendcode', {email, code})
    }
    static async changePassword(email, password, salt){
        return $api.post('/changePassword', {email, password, salt})
    }
}