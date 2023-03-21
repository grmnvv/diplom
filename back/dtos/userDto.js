export default class UserDto{
    email;
    id;
    login;
    isActivated;
    constructor(model){
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.login = model.login;
    }
}