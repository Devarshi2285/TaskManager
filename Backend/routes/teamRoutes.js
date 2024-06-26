const express = require('express');
const Team = require('../Models/Team.model');
const Employee = require('../Models/Emplyoee.model');
const authtoken = require('../Middleware/authtoken');
const generatecode = require('../Middleware/GenerateCode');

const router=express.Router();


router.post('/createteam', authtoken, async (req, res) => {
    try {
      const createrid = req.user.id;

      const { teamname } = req.body;
      const teamcode = await generatecode();
      const team = new Team({
        teamName: teamname,
        teamCode: teamcode,
        teamLead: createrid,
        teamMember: [
          { employee: createrid, role: 'TeamLead' }
        ]
      });
      const lead = Employee.findById(createrid);

      if (!Array.isArray(lead.teams)) {
        lead.teams = [];
      }

      await team.save();

      lead.teams.push(team._id);
      await Employee.findByIdAndUpdate(createrid, { teams: lead.teams });


      res.status(200).json({message:'Team is created'});
    }
    catch (err) {

      console.log("Error in /token:"+err);

    }

  });

  router.post('/jointeam', authtoken, async (req, res) => {

    const { teamcode, position } = req.body;

    const teamdetails = await Team.findOne({ teamCode: teamcode });

    // Check if teamdetails is found
 

    if (teamdetails) {
      const joinerid = req.user.id;
      const employeeExists = teamdetails.teamMember.some(member => member.employee.toString() === joinerid);
      if (employeeExists) {
        return res.status(200).json({ message: 'You are already in the team' });
      }

      //updating empUnderMe for Lead
      const leadid = teamdetails.teamLead;
      const lead = await Employee.findById(leadid);

      if (!Array.isArray(lead.empUnderMe)) {
        lead.empUnderMe = [];
      }
      lead.empUnderMe.push(joinerid);
      await Employee.findByIdAndUpdate(leadid, { empUnderMe: lead.empUnderMe });

      //Updating TeamMember
      teamdetails.teamMember.push({ employee: joinerid, role: position });
      await Team.findOneAndUpdate({ teamCode: teamcode }, { teamMember: teamdetails.teamMember });


      const joiner = await Employee.findById(joinerid);



      if (!Array.isArray(joiner.teams)) {
        joiner.teams = [];
      }

      joiner.teams.push(teamdetails._id);

      await Employee.findByIdAndUpdate(joinerid, { teams: joiner.teams });

      res.status(200).json({message:'You Joined a New Team'});
    }
    else {
      res.status(402).json({ message: 'Team does not found' });
    }

  });


router.post('/getteams', authtoken, async (req, res) => {
    const { teamid } = req.body;
 

    try {
      let teams;
      const employeeId = req.user.id;
      if (teamid === "All") {
        teams = await Team.find({
          $or: [
            { teamLead: employeeId },
            { 'teamMember.employee': employeeId }
          ]
        })
          .populate('teamLead', 'name _id')  // Populate the teamLead field
          .populate('teamMember.employee', 'name _id');
      }
      else {

        teams = await Team.find({
          $and: [
            {
              $or: [
                { teamLead: employeeId },
                { 'teamMember.employee': employeeId }
              ]
            },
            { _id: teamid }
          ]
        })
          .populate('teamLead', 'name _id')  // Populate the teamLead field
          .populate('teamMember.employee', 'name _id');

      }


      res.status(200).json(teams);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: err.message });
    }

  });

  module.exports=router;