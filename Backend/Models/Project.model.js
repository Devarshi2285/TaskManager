const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
