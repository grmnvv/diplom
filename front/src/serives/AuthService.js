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
    static async refresh(){
        return $api.get('/refresh')
    }
    static async sendCode(email, code){
        return $api.post('/sendcode', {email, code})
    }
    static async changePassword(email, password, salt){
        return $api.post('/changePassword', {email, password, salt})
    }
    static async createProject(formData){
        console.log(formData)
        return $api.post('/createProject', formData, {headers: {'Content-Type': 'multipart/form-data' }})
    }
    static async getProject(){
        return $api.get(`/getProjects`)
    }
    static async saveProject(project){
        return $api.post(`/saveProject`, {project})
    }
    static async deleteProject(id){
        return $api.delete(`/deleteProject/${id}`)
    }
}