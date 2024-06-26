import React from 'react';
import { useNavigate } from 'react-router-dom';
import customFetch from '../../fetchInstance';
function CreateTeam({ onClose }) {
  const navigate = useNavigate();

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target.form);
    const teamname = formData.get('teamname');

    try {
      const bodyObj={ teamname:teamname };

      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/team/createteam`, bodyObj);
        window.alert(res.data.message);
        //navigate('/teams');
        onClose();
      
      
    } catch (err) {
      console.log('Err in fetch: ' + err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center">
    <div className="bg-white p-8 rounded-lg shadow-lg transform transition-transform scale-105 relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-black">
        &times;
      </button>
      <form>
        <label htmlFor="teamname" className='p-3'>Enter Team Name:</label>
        <input type="text" name="teamname" className="border p-2 rounded"/>
        <button onClick={handleCreateTeam} className="ml-2 bg-black text-white px-4 py-2 rounded">
          Create
        </button>
      </form>
    </div>
  </div>
  );
}

export default CreateTeam;
