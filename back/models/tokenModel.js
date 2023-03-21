import mongoose from "mongoose";
const { Schema, model } = mongoose;

const tokenModel = model("Token", new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'patient'},
    refreshToken: {type: String, required: true},
}))

export { tokenModel };