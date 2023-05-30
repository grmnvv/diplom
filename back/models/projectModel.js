import mongoose from "mongoose";
const { Schema, model } = mongoose;

const projectModel = model("Projects", new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  id: { type: String, required: true },
  name: { type: String, required: true },
  isHelper: { type: Boolean, default: false },
  imageData: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true }, // Добавлено поле url
    rects: [{
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, required: true },
      height: { type: Number, required: true },
      id: { type: String, required: true },
      color: { type: String, required: true },
      name: { type: String },
      label: {type: String }
    }]
  }]
}));

export { projectModel };

