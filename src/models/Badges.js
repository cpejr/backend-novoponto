import mongoose from "mongoose";
import { MemberModel } from ".";

const BadgesSchema = new mongoose.Schema(
    {
        name: {type: String, required: true},
        description: {type: String, required: true},
        url: {type: String, required: true},
    }
);

// Quando deletar uma tribo, ela é deletada dos membros
BadgesSchema.pre("remove", function (next) {
    MemberModel.updateMany(
      { badgeId: this._id },
      { $set: { badgeId: null } },
      { multi: true }
    );
    next();
  });

const BadgesModel = new mongoose.model("badges", BadgesSchema);

export default BadgesModel;