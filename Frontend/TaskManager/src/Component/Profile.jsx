import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import customFetch from "../../fetchInstance";
import LeftNavbar from "./LeftNavbar";

function Profile() {
    const [userdata, setUserData] = useState(null);
    const [employeeId, setEmployeeId] = useState();
    const [user, setUser] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [tasksData,setTasksData]=useState(null);
    const { userid } = useParams();

    const getUserData = async () => {
        try {
            const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getuserdata`, { id: userid });
            if (res.status === 200) {
                setUserData(res.data.user);
                setUser(res.data.user.name);
                setEmployeeId(res.data.user._id);
            }
           
            

            const restasks=await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/gettaskdeatils`,{id : userid});

            if(restasks.status===200){
                  setTasksData(restasks.data);  
            }
            // else{
            //     throw new Error(restasks.data.message);
            // }

        } catch (err) {
            window.alert(err);
        }
    };

    useEffect(() => {
        getUserData();
    }, []);

    return (
        <div className="w-full m-auto pt-11">
            <div className="w-full m-auto">
                <div className="grid grid-cols-5 gap-3">
                    <div className="grid col-start-1 col-end-2">
                        {user && <LeftNavbar username={user} id={employeeId} on={""}/>}
                    </div>
                    <div className="col-start-2 col-end-6">
                        <div className="col-span-3 grid grid-cols-3 gap-3 pr-2">
                            <div className="bg-white shadow-2xl p-6 rounded-xl">
                                <div className="w-16 m-auto">
                                    <img className="rounded-full" src="\src\assets\img\profile-user.png" alt="" />
                                </div>
                                <div className="w-full text-center pt-3">
                                    <h1 className="text-2xl font-semibold">{userdata?.name}</h1>
                                </div>
                                <div>
                                    <h1 className="text-center text-base text-slate-500">{userdata?.Experience} experience</h1>
                                </div>
                            </div>
                            <div className="bg-white shadow-2xl p-6 rounded-xl">
                                <h1 className="text-2xl font-bold">Teams associated:</h1>
                                {userdata?.teams.length === 0 ? "No teams there" : ""}
                                {userdata?.teams && userdata.teams.map((team, index) => (
                                    <div key={index}>
                                        <li className="text-xl">{team.teamName}</li>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white shadow-2xl p-6 rounded-xl">
                                <h1 className="text-2xl font-bold">Key Stats:</h1>
                                {tasksData ? (
                                    <div>
                                    <div className="relative py-2">
                                        <h1 className="text-xl font-semibold float-left">Total task given:</h1>
                                        <h1 className="text-xl font-semibold pl-40">{tasksData.total}</h1>
                                    </div>
                                    <div className="relative py-2 cursor-pointer" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
                                    <h1 className="text-xl font-semibold float-left">Completed task:</h1>
                                        <h1 className="text-xl font-semibold pl-40">{tasksData.completed}</h1>
                                        {showTooltip && (
                                            <div className="absolute bg-gray-100 rounded-md shadow-md py-2 px-4 border border-gray-200">
                                                <div className="tooltip-arrow" style={{ position: "absolute", width: "0", height: "0", borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderBottom: "10px solid #ccc", top: "-10px", left: "calc(50% - 10px)", transform: "translateX(-50%)" }}></div>
                                                <h1 className="text-green-500">OnTime:{tasksData.completed !== 0 ? Math.floor((tasksData.onTime / tasksData.completed) * 100) : 0}%</h1>
                                                <h1 className="text-blue-500">Before Time: {tasksData.completed !== 0 ? Math.floor((tasksData.beforeTime / tasksData.completed) * 100) : 0}%</h1>
                                                <h1 className="text-red-800">Overdue: {tasksData.completed !== 0 ? Math.floor((tasksData.afterTime / tasksData.completed) * 100) : 0}%</h1>
                                            </div>
                                        )}
                                    </div>
                                    <div className="py-2">
                                        <h1 className="text-xl float-left font-semibold">Pending tasks:</h1>
                                        <h1 className="text-xl font-semibold pl-40">{tasksData.pendding}</h1>
                                    </div>
                                    
                                    </div>
                                ) : (
                                    <div className="flex items-center w-full">
                                            <h1>No task Given</h1>
                                    </div>
                                )}
                                
                             
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
