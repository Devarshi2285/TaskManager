const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  password:{type:String , required:true},
  email: { type: String, required: true },
  Skills: { type: String , default:null},
  Experience:{type:String , default:null},
  empUnderMe: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Team' }],
  publicKey:{type:String,require:true},
  privateKey:{type:String,require:true},
  refreshtoken: {type: String}
});

const Employee = mongoose.model('Employee', employeeSchema);

module.exports = Employee;
