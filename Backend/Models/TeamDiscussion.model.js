const mongoose = require('mongoose');

const teamDiscussionSchema = new mongoose.Schema({
  TeamId: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },  
  discussionObjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'DiscussionObject', required: true}]
});

const TeamDiscussion = mongoose.model('TeamDiscussion', teamDiscussionSchema);

module.exports = TeamDiscussion;
