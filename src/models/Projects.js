import mongoose from "mongoose";

const ProjectsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  area: { type: String, required: true },
});

const ProjectsModel = new mongoose.model("projects", ProjectsSchema);

export default ProjectsModel;
