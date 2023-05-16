import mongoose from "mongoose";
import { MemberModel } from ".";

const BadgesSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  fileName: { type: String, required: true },
});

// Quando deletar uma badge, ela é deletada dos membros
BadgesSchema.pre("remove", function (next) {
  MemberModel.updateMany(
    { badgeId: {$in: this._id} },
    { $pull: { badgeId: this._id } },
    { multi: true }
  );
  next();
});


const BadgesModel = new mongoose.model("badges", BadgesSchema);

export default BadgesModel;

