import mongoose from "mongoose";
const { Schema, model } = mongoose;

const UserModel = model("User", new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    login: {type: String},
    isActivated: {type: Boolean, default:false},
    salt: { type: String},
}))

export { UserModel };