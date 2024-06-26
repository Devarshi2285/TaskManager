const mongoose = require('mongoose');
const { boolean } = require('webidl-conversions');

const taskSchema = new mongoose.Schema({
  title:{type:String,required:true},
  discription:{type:String , required:true},
  deadlineByDate: { type: Date, required: true },
  deadlineByHours:{type:Number , required:true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  status: { type: String, default: 'inProgress' },
  isOnGoing:{type:Boolean,default:false},
  youWorkedFor: {
    hours: { type: Number, default: 0 },
    minutes: { type: Number, default: 0 }
},
  requestedToMarkComplete:{type:Boolean , default:false}
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
