const mongoose = require('mongoose');

// Define the Team schema
const teamSchema = new mongoose.Schema({
  teamName:{
    type:String,
    required:true
  },
  teamCode: {
    type: String,
    required: true,
    unique: true
  },
  teamLead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  teamMember: [{
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    role: {
      type: String,
      required:true // Default role if not specified
    }
  }]
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
