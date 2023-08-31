import mongoose from "mongoose";
import {ColorModel} from ".";
const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

const ColorSchema = new mongoose.Schema(
    {
        color: { 
            type: String,
            unique: true,
            required: true,
            uppercase: true,
            validate: {
                validator: (value) => {
                return hexColorRegex.test(value);
                }
            }
        }
    }
);

const ColorModel = mongoose.model("colors", ColorSchema);
export default ColorModel;