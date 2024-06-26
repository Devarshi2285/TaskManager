import React, { useState, useEffect } from "react";
import Tasks from "./Tasks";
import customFetch from "../../fetchInstance";
import LeftNavbar from "./LeftNavbar";
function GetTask() {
    const [assignToYou, setAssignToYou] = useState(true);
    const [tasks, setTasks] = useState([]);
    const [error, setError] = useState();
    const [onGoingTask, setOnGoingTask] = useState(null);
    const [timer, setTimer] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [user, setUser] = useState('');
    const [userId,setUserId]=useState(null);

    const getYourTasks = async () => {
        try {
            const resname = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`,null);
          
            const namedata = resname.data;
            setUser(namedata.username);

            const resId = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getid`,null);
            if (resId.status === 200) {
              const data = resId.data;
              setUserId(data.userid);
            } else if(resId.status!==401){
              throw new Error('Problem in fetching user');
            }


            const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/getyourtasks`,null);
            const data = res.data;
            if (res.status===200) {
                setTasks(data);
                console.log(data);
            } else {
                throw new Error('Cannot get Tasks');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const getGivenTasks = async () => {
        try {
            const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/getgiventasks`,null);
            const data = res.data;
            if (res.status===200) {
                setTasks(data);
                console.log(data);
            } else {
                throw new Error('Cannot get Tasks');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const changeToRequestedStatus = async (taskid) => {
        try {
            const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/changeinrequeststatus`, { taskid });

            if (res.status===200) {
                console.log('Status updated successfully');
                await getYourTasks();
                
            } else {
                const errorData = res.data;
                throw new Error(errorData.message || 'Some problem in fetch');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const changeToMarkComplete = async (taskid) => {
        try {
            const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/changetomarkcomplete`, { taskid });

            if (res.status===200) {
                console.log('Status updated successfully');
                await getGivenTasks();
            } else {
                const errorData = res.data;
                throw new Error(errorData.message || 'Some problem in fetch');
            }
        } catch (err) {
            setError(err.message);
        }
    }

    const handleChange = () => {
        setTasks([]);
        setAssignToYou(!assignToYou);
    };
    const startTask = async (taskid) => {
        
        if(onGoingTask){
            await closeTask();
        }

        setOnGoingTask(taskid);

        
        
        const starttime=new Date();
        setStartTime(starttime);
        localStorage.setItem('ongoingtask',taskid);
        localStorage.setItem('starttime',starttime);
        const res=await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/setongoingtask`,{taskid:taskid});
    }
    const closeTask = async () => {

        const endTime = new Date();
        const timeDifferenceMilliseconds = endTime - startTime;
        const timeDifferenceMinutes = timeDifferenceMilliseconds / (1000 * 60); // Difference in minutes as a decimal
        setTotalMinutes( timeDifferenceMinutes); // Add the difference to total minutes
        await updateWorkedTime(timeDifferenceMinutes);
        setOnGoingTask(null);


    };
    const updateWorkedTime = async (minutesWorked) => {
        console.log(onGoingTask);
        try {
            const hours = Math.floor(minutesWorked / 60); // Calculate hours
            const minutes = minutesWorked % 60; // Calculate remaining minutes
            const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/updateworkedtime`,{ taskid: onGoingTask, hoursWorked: hours, minutesWorked: minutes });

            if (res.status === 200) {
                console.log('Worked time updated successfully');
                getYourTasks(); // Refresh tasks after update
            } else {
                const errorData = res.data;
                throw new Error(errorData.message || 'Some problem in fetch');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (assignToYou) {
            getYourTasks();
        } else {
            getGivenTasks();
        }

       

    }, [assignToYou,tasks]);
    if (error) {
        return (<><h1>{error}</h1></>);
    }
    return (

        <>

            <div className="w-full m-auto pt-11">
                <div className="grid grid-cols-5 gap-3">
                    <div className="grid col-start-1 col-end-2 bg-slate-100 rounded-2xl">
                        <LeftNavbar username={user} id={userId} on={"task"}></LeftNavbar>
                    </div>

                    {/* navbar ends */}

                    <div className="grid col-start-2 col-end-6">

                        <div className="w-full">
                            <div className="w-full">
                                <div className="grid grid-cols-10 gap-3">
                                    <div className="grid col-start-1 col-end-5  pl-11 pt-5 text-left">
                                        <h1 className="text-3xl font-bold">
                                            {assignToYou ? "  Task Assigend to You:" : "  Task Assigend by You:"}
                                        </h1>
                                    </div>  
                                    <div className="grid col-start-7 col-end-9">
                                        <div className="w-full">
                                            <div className="pt-6">
                                                <div onClick={handleChange} className="w-9/12 bg-black text-white rounded-xl text-center transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-slate-300 hover:cursor-pointer">
                                                    <h1 className="p-1"> {assignToYou ? "Assigend by You" : "Assigend to You"}</h1>
                                                </div>
                                            </div>

                                        </div>


                                    </div>

                                </div>

                            </div>



                            <div className="w-full pt-20">
                                <div className="w-11/12 m-auto">
                                    <div className="grid grid-cols-2 gap-2">

                                        {assignToYou && tasks.map(task => (
                                            <div className="border-slate-300 border-2 p-2 rounded-md">
                                                <div className="w-11/12 m-auto">
                                                    <div className="grid grid-col-8">
                                                        <div className="col-start-1 col-end-4">
                                                            <div className="w-full">
                                                                <h1 className="text-xl">{task.title}</h1>
                                                            </div>
                                                        </div>

                                                        <div className="grid col-start-5 col-end-6 pt-1">
                                                            <div className="flex items-center pl-6">
                                                                <img className="w-5" src="\src\assets\img\output-onlinepngtools (3).png" alt="" />
                                                                <span className="pl-1 text-slate-500 font-medium">{task.deadlineByDate.substring(0, 10)}</span>                                               </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-full pt-3">
                                                        <p className="text-slate-500">{task.discription}</p>
                                                    </div>

                                                    <div className="w-full pt-4">

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <img className="w-5 pt-1 float-left" src="\src\assets\img\output-onlinepngtools (4).png" alt="" />
                                                                <h1 className="pl-7  text-slate-500 font-normal">Due in {task.deadlineByHours} hours</h1>
                                                            </div>
                                                            <div>
                                                                <img className="w-5 pt-1 float-left" src="\src\assets\img\output-onlinepngtools (5).png" alt="" />
                                                                <h1 className="pl-7 text-slate-500 font-normal">Given By {task.assignedBy?.name}</h1>

                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="w-full pt-4">

                                                        <div className="grid grid-cols-3 gap-2 border-t-2 border-slate-300">

                                                            <div>
                                                                <img className="w-5 pt-1 float-left" src="\src\assets\img\output-onlinepngtools (6).png" alt="" />
                                                                <h1 className="pl-7  text-slate-500 font-normal">{task.youWorkedFor.hours}hr {Math.floor(task.youWorkedFor.minutes)}m Worked</h1>
                                                            </div>
                                                            <div className="col-start-2 col-end-4">
                                                                <div className="grid grid-cols-5 gap-2">
                                                                    
                                                                    {task.status==='inProgress' && (task._id === onGoingTask ? (

                                                                        <div className="col-start-1 col-end-2 hover:bg-slate-100 hover:cursor-pointer" onClick={closeTask}>

                                                                            <img className="w-4 pt-2 float-left pl-1" src="\src\assets\img\pause-button.png" alt="" />
                                                                            <h1 className="pl-5 pb-1">Stop</h1>

                                                                        </div>
                                                                    )
                                                                        : (

                                                                            <div className="col-start-1 col-end-2 hover:bg-slate-100 hover:cursor-pointer" onClick={() => startTask(task._id)}>

                                                                                <img className="w-4 pt-2 float-left pl-1" src="\src\assets\img\play.png" alt="" />
                                                                                <h1 className="pl-5 pb-1">Start</h1>

                                                                            </div>

                                                                        ))}

                                                                    {task.status==='inProgress' && !task.requestedToMarkComplete && (
                                                                        <div className="col-start-2 col-end-4 hover:bg-slate-100 hover:cursor-pointer" onClick={() => changeToRequestedStatus(task._id)}>
                                                                        <img className="w-8 float-left pt-1 pl-3" src="\src\assets\img\next.png" alt="" />
                                                                        <h1 className="text-green-600 pl-9">Complete</h1>
                                                                    </div>
                                                                    )}
                                                                    {task.status==='inProgress' && task.requestedToMarkComplete && (
                                                                        <div className="col-start-2 col-end-4 hover:bg-slate-100 hover:cursor-pointer" onClick={() => changeToRequestedStatus(task._id)}>
                                                                        <img className="w-8 float-left pt-1 pl-3" src="\src\assets\img\output-onlinepngtools (7).png" alt="" />
                                                                        <h1 className="text-yellow-400 pl-9">Requested</h1>
                                                                    </div>
                                                                    )}
                                                                    {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Distinctio, culpa. Beatae a sequi, libero placeat voluptate quos repellendus iure ipsam amet in non veritatis itaque distinctio ipsum quas. Harum, neque? Lorem ipsum dolor sit, amet consectetur adipisicing elit. Porro, odit suscipit qui, iure ullam provident expedita harum cum vitae a ea voluptatem perspiciatis at, modi veritatis repellat maiores? Nulla, ipsa? */}
                                                                    {task.status==='inProgress' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-yellow-400">In Progress</h1>
                                                                    </div>)}

                                                                   {task.status==='overDue' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-red-500">Over Due</h1>
                                                                    </div>)}

                                                                    {task.status==='onTime' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-yellow-400">On Time</h1>
                                                                    </div>)}

                                                                    {task.status==='beforeTime' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-green-600">Before Time</h1>
                                                                    </div>)}

                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        ))}


                                        {!assignToYou && tasks.map(task => (
                                            <div className="border-slate-300 border-2 p-2 rounded-md">
                                                <div className="w-11/12 m-auto">
                                                    <div className="grid grid-col-8">
                                                        <div className="col-start-1 col-end-4">
                                                            <div className="w-full">
                                                                <h1 className="text-xl float-left">{task.title}</h1>
                                                                {task.isOnGoing && ( <img className="w-6 pt-2 pl-3" src="\src\assets\img\output-onlinepngtools (8).png" alt="" />)}
                                                               
                                                            </div>
                                                        </div>

                                                        <div className="grid col-start-5 col-end-6 pt-1">
                                                            <div className="flex items-center pl-6">
                                                                <img className="w-5" src="\src\assets\img\output-onlinepngtools (3).png" alt="" />
                                                                <span className="pl-1 text-slate-500 font-medium">{task.deadlineByDate.substring(0, 10)}</span>                                               </div>
                                                        </div>
                                                    </div>

                                                    <div className="w-full pt-3">
                                                        <p className="text-slate-500">{task.discription}</p>
                                                    </div>

                                                    <div className="w-full pt-4">

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <img className="w-5 pt-1 float-left" src="\src\assets\img\output-onlinepngtools (4).png" alt="" />
                                                                <h1 className="pl-7  text-slate-500 font-normal">Due in {task.deadlineByHours} hours</h1>
                                                            </div>
                                                            <div>
                                                                <img className="w-5 pt-1 float-left" src="\src\assets\img\output-onlinepngtools (5).png" alt="" />
                                                                <h1 className="pl-7 text-slate-500 font-normal">Given To {task.assignedTo?.name}</h1>

                                                            </div>
                                                        </div>

                                                    </div>
                                                    <div className="w-full pt-4">

                                                        <div className="grid grid-cols-3 gap-2">

                                                            <div>
                                                                <img className="w-5 pt-1 float-left" src="\src\assets\img\output-onlinepngtools (6).png" alt="" />
                                                                <h1 className="pl-7  text-slate-500 font-normal">{task.youWorkedFor.hours}hr {Math.floor(task.youWorkedFor.minutes)}m Worked</h1>
                                                            </div>
                                                            <div className="col-start-2 col-end-4">
                                                                <div className="grid grid-cols-5 gap-2">
                                                                    {task.requestedToMarkComplete && task.status==='inProgress' && (
                                                                         <div className="col-start-1 col-end-4 hover:bg-slate-100 hover:cursor-pointer" onClick={() => changeToMarkComplete(task._id)}>
                                                                         <img className="w-8 float-left pt-4 pl-3" src="\src\assets\img\next.png" alt="" />
                                                                         <h1 className="text-green-600 pl-9">Requested to mark Complete</h1>
                                                                     </div>
                                                                    ) 
                                                                    }
                                                                    {task.status==='inProgress' && !task.requestedToMarkComplete &&(
                                                                       <h1 className="text-red-600 pl-9">Pendding</h1>
                                                                    )

                                                                    }

                                                                    {task.status!=='inProgress' && (
                                                                       <h1 className="text-green-600 pl-9">Completed</h1>
                                                                    )

                                                                    }   

                                                                    {task.status==='inProgress' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-yellow-400">In Progress</h1>
                                                                    </div>)}

                                                                   {task.status==='overDue' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-red-500">Over Due</h1>
                                                                    </div>)}

                                                                    {task.status==='onTime' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-yellow-400">On Time</h1>
                                                                    </div>)}

                                                                    {task.status==='beforeTime' && (<div className="text-center col-start-4 col-end-6">
                                                                        <h1 className="text-green-600">Before Time</h1>
                                                                    </div>)}



                                                                    
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                </div>
                                            </div>
                                        ))}




                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            <div className="w-full bg-black min-h-16 text-center ">
                <p className="text-white pt-6">@All rights reserved</p>
            </div>

        </>
    );
}

export default GetTask;
