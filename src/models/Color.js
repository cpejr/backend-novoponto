import mongoose from "mongoose";
const hexColorRegex = /^#(?:[0-9a-fA-F]{3,4}){1,2}$/;

const ColorSchema = new mongoose.Schema(
    {
        primaryColor: { 
            type: String,
            required: true,
            uppercase: true,
            validate: {
                validator: (value) => {
                    return hexColorRegex.test(value);
                },
                message: (props) =>
                `${props.value} não está no formato de cor hexadecimal.`,
            
            }
        },

        secundaryColor: { 
            type: String,
            required: true,
            uppercase: true,
            validate: {
                validator: (value) => {
                    return hexColorRegex.test(value);
                },
                message: (props) =>
                `${props.value} não está no formato de cor hexadecimal.`,
            
            }
        }
    }
);
// Middleware para deletar cores anteriores antes de criar uma nova cor
ColorSchema.pre("save", async function (next) {
    const existingColors = await this.constructor.find();
    if (existingColors.length > 0) {
        await this.constructor.deleteMany({});
    }
    next();
});

const ColorModel = mongoose.model("colors", ColorSchema);
export default ColorModel;
