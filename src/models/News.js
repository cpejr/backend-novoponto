import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    //String que guarda o HTML da noticia
    html: { type: String, required: true },

    index: { type: Number, required: true, unique: true },

    newsId: { type: String, required: true, unique: true },
  },
  { timestamps: false, versionKey: false }
);

const NewsModel = mongoose.model("news", NewsSchema);

export default NewsModel;
