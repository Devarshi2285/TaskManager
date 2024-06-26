import React from "react";
import { useNavigate } from "react-router-dom";
import customFetch from "../../fetchInstance";
function JoinTeam({ onClose }) {
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target.form);
    const teamcode = formData.get('teamcode');
    const position = formData.get('position');
    const token = localStorage.getItem('token');


    try {
      const bodyObj={ teamcode:teamcode, position:position };
      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/team/jointeam`, bodyObj);

      window.alert(res.data.message);
      navigate('/teams');
      onClose();
        
    } catch (err) {
      console.log("Err in fetch: " + err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg transform transition-transform scale-105 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-black">
          &times;
        </button>
        <form>
          <h1 className="text-2xl font-bold mb-4">Join Team</h1>
          <label htmlFor="teamcode" className="block mb-2">Team Code</label>
          <input type="text" name="teamcode" className="border p-2 rounded w-full mb-4" />
          <label htmlFor="position" className="block mb-2">Position</label>
          <input type="text" name="position" className="border p-2 rounded w-full mb-4" />
          <button onClick={handleJoin} className="bg-black text-white px-4 py-2 rounded">
            Join
          </button>
        </form>
      </div>
    </div>
  );
}

export default JoinTeam;
