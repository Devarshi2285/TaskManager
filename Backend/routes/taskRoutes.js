const express = require('express');
const Task = require('../Models/Task.model');
const authtoken = require('../Middleware/authtoken');

const router=express.Router();


router.post('/gettaskdeatils', authtoken, async (req, res) => {

    const { id } = req.body;
    try {
        const tasks = await Task.find({ assignedTo: id });

        const total = tasks.length;
        let pendding = 0;
        let completed = 0;
        let onTime = 0;
        let beforeTime = 0;
        let afterTime = 0;


        tasks.forEach(task => {
            if (task.status === 'inProgress') {
                pendding++;
            }
            else if (task.status === 'overDue') {
                completed++;
                afterTime++;

            }
            else if (task.status === 'onTime') {
                completed++;
                onTime++;
            }
            else if (task.status === 'beforeTime') {
                completed++;
                beforeTime++;
            }




        });
        res.status(200).json({ total: total, completed: completed, pendding: pendding, onTime: onTime, beforeTime: beforeTime, afterTime: afterTime });

    } catch (err) {
        console.log(err);
        res.status(401).json({ message: err });
    }



});



router.post('/assigntask', authtoken, async (req, res) => {

    const { title, assignedTo, description, deadlineHours, deadlineDate } = req.body;
    const assingerid = req.user.id;
    // console.log(assingerid + empid + discription + deadlinehours + deadlinedate);

    try {

        const taskobj = new Task({
            title: title,
            discription: description,
            deadlineByDate: deadlineDate,
            deadlineByHours: deadlineHours,
            assignedTo: assignedTo,
            assignedBy: assingerid
        });

        await taskobj.save();
        res.status(200).json({ message: 'Assigned Successfully' });
    }
    catch (err) {
        console.log(err);
        res.status(402).json({ err });
    }

});

router.get('/getyourtasks', authtoken, async (req, res) => {
    const userid = req.user.id;

    try {
        const tasks = await Task.find({ assignedTo: userid }).populate('assignedBy', 'name');

        // Transform tasks to only include the date part in deadlineByDate
        const transformedTasks = tasks.map(task => {
            const transformedTask = task.toObject(); // Convert Mongoose document to plain object
            transformedTask.deadlineByDate = transformedTask.deadlineByDate.toISOString().substring(0, 10);
            return transformedTask;
        });

        res.status(200).json(transformedTasks);
    } catch (err) {
        console.log(err);
        res.status(402).send();
    }
});
router.get('/getgiventasks', authtoken, async (req, res) => {

    const userid = req.user.id;

    try {

        const tasks = await Task.find({ assignedBy: userid }).populate('assignedTo', 'name');
        // console.log(tasks);
        res.status(200).json(tasks);

    }
    catch (err) {
        console.log(err);
        res.status(402).send();
    }

});

router.post('/setongoingtask', authtoken, async (req, res) => {

    const { taskid } = req.body;
    try {

        const task = await Task.findById(taskid);

        if (!task) {
            return res.status(404).send('Task not found');
        }

        // Toggle the requestedToMarkComplete field
        const newStatus = !task.isOnGoing;

        // Update the task with the new status
        await Task.findByIdAndUpdate(taskid, { isOnGoing: newStatus });

    }
    catch (err) {
        console.log(err);
        res.status(401).send();
    }

});
router.post('/changeinrequeststatus', authtoken, async (req, res) => {

    const { taskid } = req.body;

    try {

        const task = await Task.findById(taskid);

        if (!task) {
            return res.status(404).send('Task not found');
        }

        // Toggle the requestedToMarkComplete field
        const newStatus = !task.requestedToMarkComplete;

        // Update the task with the new status
        await Task.findByIdAndUpdate(taskid, { requestedToMarkComplete: newStatus });

    }
    catch (err) {
        console.log(err);
        res.status(401).send();
    }


});

router.post('/changetomarkcomplete', authtoken, async (req, res) => {
    const { taskid } = req.body;
    try {
        const task = await Task.findById(taskid);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const currentDate = new Date();
        const deadlineDate = new Date(task.deadlineByDate);
        const deadlineHours = task.deadlineByHours;
        const workedHours = task.youWorkedFor.hours;

        // Set the time part to 00:00:00 to compare only the date
        currentDate.setHours(0, 0, 0, 0);
        deadlineDate.setHours(0, 0, 0, 0);

        if (currentDate > deadlineDate) {
            task.status = 'overDue';
        } else if (workedHours > deadlineHours) {
            task.status = 'overDue';
        } else if (currentDate >= deadlineDate && workedHours > deadlineHours) {
            task.status = 'overDue';
        } else if (currentDate.getTime() === deadlineDate.getTime() && workedHours === deadlineHours) {
            task.status = 'onTime';
        } else {
            task.status = 'beforeTime';
        }

        await task.save();
        res.status(200).json({ message: 'Task status updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).send();
    }
});

router.post('/updateworkedtime', authtoken, async (req, res) => {
    const { taskid, hoursWorked, minutesWorked } = req.body;


    try {
        const task = await Task.findById(taskid);
        
        // Add hours and minutes separately
        task.youWorkedFor.hours += hoursWorked;

        // Add minutes and handle carryover to hours if necessary
        task.youWorkedFor.minutes += minutesWorked;
        if (task.youWorkedFor.minutes >= 60) {
            task.youWorkedFor.hours += Math.floor(task.youWorkedFor.minutes / 60);
            task.youWorkedFor.minutes %= 60;
        }
        const newStatus = !task.isOnGoing;

        // Update the task with the new status
        task.isOnGoing = newStatus;
        await task.save();

        res.status(200).json({ message: 'Worked time updated successfully' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports=router;