const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
//   text: { type: String, required: true },
//   timestamp: { type: Date, default: Date.now }
// });

const discussionObjectSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  timestamp: { type: Date, default: Date.now },
  content: { type: String },
  typeOfMessage:{type:String,required:true},
  attachment: {type:String,default:null},
  url:{type:String,default:null},
  teamId:{type:mongoose.Schema.Types.ObjectId,ref:'Team',required:true},
  isCommneted:{type:mongoose.Schema.Types.ObjectId,ref:'DiscussionObject',default:null}
});

const DiscussionObject = mongoose.model('DiscussionObject', discussionObjectSchema);

module.exports = DiscussionObject;
