import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    //String que guarda o HTML da noticia
    srcString: { type: String, required: true },
    //Texto alternativo da noticia
    altText: String,
  },
  { timestamps: false, versionKey: false }
);

const NewsModel = mongoose.model("news", NewsSchema);

export default NewsModel;