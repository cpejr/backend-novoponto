import mongoose from "mongoose";

function castToObjectIdFields(object, filedsToCast) {
  filedsToCast.forEach((field) => {
    if (object[field]) object[field] = mongoose.Types.ObjectId(object[field]);
  });
}

export { castToObjectIdFields };
