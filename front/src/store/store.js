import { makeAutoObservable, runInAction } from "mobx";
import UserDto from '../DTO/userDto';
import AuthService from '../serives/AuthService';

export default class Store {
    
    isAuth = false;
    salt = '';
    user = {
        email: "",
        isActivated: false,
        id: "",
        login: ""
      };

    constructor(){
        makeAutoObservable(this);
    }  

    setAuth(bool){
        this.isAuth = bool;
    }

    setUser(user){
        this.user = user;
    }

    setSalt(salt){
        this.salt = salt;
    }


    async login(email, password){
        try {
            const response = await AuthService.login(email, password);
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            console.error(e.response?.data?.message)
        }
    }
    async registration(email, password, login){
        try {
            const response = await AuthService.registration(email, password, login) ;
            localStorage.setItem('token', response.data.accessToken);
            this.setAuth(true);
            this.setUser(response.data.user);
        } catch (e) {
            console.error(e.response?.data?.message)
        }
    }
    async logout(){
        try {
            await AuthService.logout();
            localStorage.removeItem('token');
            this.setAuth(false);
            this.setUser({});
        } catch (e) {
            console.error(e.response?.data?.message)
        }
    }
    async forgot(id, token, password){
        try {
            await AuthService.forgot(id, token, password);
        } catch (e) {
            console.error(e.response?.data?.message)
        }
    }

    async sendCode(email, code){
        try {
            const response = await AuthService.sendCode(email, code)
            this.setSalt(response.data.salt)
            console.log(response.data.salt)
        } catch (e) {
            console.log(e.response?.data?.message)
        }
    }
    async changePassword(email, password){
        try {
            console.log('her ', this.salt)
            await AuthService.changePassword(email, password, this.salt)
            
        } catch (e) {
            console.log(e.response?.data?.message)
        }
    }
}