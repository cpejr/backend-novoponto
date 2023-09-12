import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    access: {
      type: Number,
      required: true,
    },
    // Determina grupo de compilação da role
    // 0 --> Não compilar
    // 1 --> Compilação de membro
    // 2 --> --- de trainees
    compileGroup: {
      type: Number,
      default: 1
    },
    departamentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'departament',
    },
  },
  { timestamps: false, versionKey: false }
);

const RoleModel = mongoose.model("roles", RoleSchema);

export default RoleModel;
