import mongoose from "mongoose";

const DescriptionSchema = new mongoose.Schema(
    {
        description: { type: String, required: true}
    }
);

const DescriptionModel = mongoose.model("descriptions", DescriptionSchema);
export default DescriptionModel;