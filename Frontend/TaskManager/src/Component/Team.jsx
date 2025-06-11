import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateTeam from './CreateTeam';
import JoinTeam from './JoinTeam';
import customFetch from '../../fetchInstance';
import addIcon from '../assets/img/add.png';
import LeftNavbar from './LeftNavbar';
function Teams() {
  const [employeeId, setEmployeeId] = useState();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showJoinPopup, setShowJoinPopup] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchTeams = async () => {
      try {
        const resId = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/getid`,null);
        if (resId.status === 200) {
          const data = resId.data;
          setEmployeeId(data.userid);
        } else if(resId.status!==401){
          throw new Error('Problem in fetching user');
        }

        const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`,null);
        if (res.status !== 200 && res.status!==401) {
          throw new Error('Failed to fetch profile');
        }
        const data = res.data;
        setUser(data.username);
        const bodyObj={ teamid: 'All' };
        const teamRes = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/team/getteams`, bodyObj);

        if (teamRes.status === 200) {
          const data = teamRes.data;
          setTeams(data);
        } else {
          throw new Error('Failed to fetch teams');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTeams();
  }, [showPopup,showJoinPopup]);

  if (loading) {
    return <p>Loading teams...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <div className={`w-full m-auto pt-11 ${showPopup  ? 'blur-sm' : ''}`}>
        <div className="grid grid-cols-5 gap-3">
          <div className="grid col-start-1 col-end-2 bg-slate-100 rounded-2xl">
           <LeftNavbar username={user} id={employeeId} on={"team"} ></LeftNavbar>
          </div>

          <div className="grid col-start-2 col-end-6">
            <div className="w-full">
              <div className="w-1/4 pl-5 pt-5">
                <h1 className="text-3xl font-bold">Teams</h1>
              </div>
              <div className="w-full pt-20">
                <div className="w-11/12 m-auto grid grid-cols-4 gap-2">
                  {teams.map((team) => (
                    <div key={team._id} className="border-slate-300 border-2 rounded-2xl">
                      <div className="pt-3 pb-16">
                        <div className="w-4/5 float-left">
                          <div className="pl-9">
                            <h1 className="font-bold text-2xl">{team.teamName}</h1>
                          </div>
                          <div className="pl-10">
                            {team.teamLead?._id === employeeId && (
                              <h1 className="text-slate-500 font-semibold">{team.teamCode}</h1>
                            )}
                          </div>
                        </div>
                        <div className="w-1/6 float-left pt-5">
                          <a href={`teamdetails/${team._id}`}>
                            <img className="w-3" src="src/assets/img/right-arrow.png" alt="" />
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full pt-12">
                <div
                  className=" w-1/5 m-auto border-slate-300 border-2 rounded-lg p-2 flex items-center justify-center transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => setShowPopup(true)}
                >
                  <h1 className="font-semibold text-lg pr-2">Create Team</h1>
                  <img className="w-5" src={addIcon} alt="Create Team" />
                </div>
              </div>
              <div className="w-full pt-5">
                <div
                  className=" w-1/5 m-auto border-slate-300 border-2 rounded-lg p-2 flex items-center justify-center transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
                  onClick={() => setShowJoinPopup(true)}
                >
                  <h1 className="font-semibold text-lg pr-2">Join Team</h1>
                  <img className="w-5" src="src/assets/img/add.png" alt="Create Team" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-full bg-black min-h-16 text-center">
          <p className="text-white pt-6">@All rights reserved</p>
        </div>
      </div>
      {showPopup && <CreateTeam onClose={() => setShowPopup(false)} />}
      {showJoinPopup && <JoinTeam onClose={() => setShowJoinPopup(false)} />}
    </>
  );
}

export default Teams;