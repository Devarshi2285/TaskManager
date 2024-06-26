const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  content: { type: String },
  typeOfMessage:{type:String,required:true},
  url:{type:String,default:null},
  timestamp: { type: Date, default: Date.now },
  attachment: {type:String,default:null},
  isCommneted:{type:mongoose.Schema.Types.ObjectId,ref:'Message',default:null} 
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
