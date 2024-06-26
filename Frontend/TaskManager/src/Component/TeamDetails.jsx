import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import Tasks from "./Tasks";
import customFetch from "../../fetchInstance";
import LeftNavbar from "../Component/LeftNavbar";



function TeamDetails() {
  const token = localStorage.getItem('token');
  const { id } = useParams();
  console.log(id);

  const [employeeId, setEmployeeId] = useState();
  const [teams, setTeams] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState('');
  const [showPopup,setShowPopup]=useState(false);
  const [assignedTo,setAssignedTo]=useState(null);
  const fetchteams = async () => {

    try {
      const resid = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getid`,null);

      if (resid.status === 200) {
        const data = resid.data;
        setEmployeeId(data.userid);
      }
      else {
        throw new Error("Problem in fetching user");
      }

      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`,null);
      if (res.status !== 200) {
        throw new Error('Failed to fetch profile');
      }
      const data = res.data;
      setUser(data.username);



      const bodyObj={ teamid: id };
      const teamres = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/team/getteams`, bodyObj);

      if (teamres.status === 200) {

        const data = teamres.data;
        console.log(data[0]);
        setTeams(data[0]);

      }
      else {
        throw new Error('Failed to fetch teams');
      }

    }
    catch (err) {
      setError(err.message);
    }
    finally {
      setLoading(false);
    }
  }


  useEffect(() => {


    fetchteams();

  }, []);

  if (loading) {
    return <p>Loading teams...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <div className={`w-full m-auto pt-11 ${showPopup ? 'blur-sm' : ''}`}>
      <div className="w-full m-auto">
        <div className="grid grid-cols-5 gap-3">

          <div className="grid col-start-1 col-end-2">
               <LeftNavbar username={user} id={employeeId} on={""}></LeftNavbar>
          </div>

          <div className="grid col-start-2 col-end-6">
            <div className="w-full">
              <div className="w-full">
                <div className="grid grid-cols-10 gap-3">
                  <div className="grid col-start-1 col-end-2  pl-11 pt-5 text-left">
                    <h1 className="text-3xl font-bold">{teams && teams?.teamName}</h1>
                  </div>


                  <div className="grid col-start-8 col-end-9 pt-6">
                    <div className="w-full rounded-xl bg-black text-white text-right p-2 grid grid-cols-3">
                      <div className="grid col-span-1"><img className="w-5" src="\src\assets\img\output-onlinepngtools (2).png" alt="" /></div>
                      <div className="grid col-2 pr-1"><p className="text-sm">TeamGoals</p></div>
                    </div>
                  </div>
                  

                  <div className="grid col-start-9 col-end-10 pt-6">
                    <div className="w-full rounded-xl bg-black text-white text-right p-2 grid grid-cols-3">
                      <div className="grid col-span-1"><img className="w-5" src="\src\assets\img\output-onlinepngtools.png" alt="" /></div>
                      <div className="grid col-2 pr-1"><a href={`/discussion/${id}`} className="text-sm">Discussion</a></div>
                    </div>

                  </div>
                  
                

                </div>
              </div>

              <div className="w-full pt-10">

                <div className="w-11/12 m-auto grid grid-cols-3 gap-2">


                  {teams.teamMember.map(member => (

                    <div className="w-full grid grid-cols-6 gap-1 border-slate-200 border-2 p-3 rounded-2xl">
                      <div className="col-start-1 col-end-2">
                        <img className="pt-2" src="\src\assets\img\profile-user.png" alt="" />
                      </div>
                      <div className="col-start-2 col-end-7 pl-2">
                        <div className="w-full">
                          <div className="w-full">
                            <a className="text-xl font-semibold" href={`/profile/${member.employee?._id}`}>{member.employee?.name || 'Unknown'}</a>
                          </div>
                          <div className="w-full">
                            <p className="text-slate-500">{member.role}</p>
                          </div>
                        </div>
                      </div>
                      <div className="grid col-start-1 col-end-7 pt-3">
                        <div className="w-4/5 m-auto">
                          <div className="grid grid-cols-2 gap-2">

                            {teams.teamLead?._id === employeeId && member.employee?._id !== employeeId && (

                              <div onClick={() => 
                              {
                                setShowPopup(true);
                                setAssignedTo(member.employee?._id);
                                }} className="hover:cursor-pointer">
                                <div className="w-full rounded-xl bg-black text-white p-2 grid grid-cols-3">
                                  <div className="grid col-span-1"><img className="w-4 pt-1" src="\src\assets\img\output-onlinepngtools (1).png" alt="" /></div>
                                  <div className="grid col-span-2 pr-1"><p className="text-sm">Assign Task</p></div>
                                </div>
                              </div>

                            )}

                            {member.employee?._id !== employeeId && (
                              <div className="hover:cursor-pointer">
                                <div className="w-full rounded-xl bg-black text-white p-2 grid grid-cols-3">
                                  <div className="grid col-span-1"><img className="w-4 pt-1" src="\src\assets\img\output-onlinepngtools.png" alt="" /></div>
                                  <div className="grid col-span-2 pr-1"><a className="text-sm" href={`http://localhost:5173/chat/${member.employee?._id}`}>Message</a></div>
                                </div>
                              </div>
                            )}



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
      <div className="w-full bg-black min-h-16 text-center">
          <p className="text-white pt-6">@All rights reserved</p>
        </div>
      {showPopup && <Tasks assignedTo={assignedTo} onClose={() => setShowPopup(false)} />}
    </>
  );

}

export default TeamDetails;
