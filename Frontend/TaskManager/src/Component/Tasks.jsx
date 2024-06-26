import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import customFetch from "../../fetchInstance";
function Tasks({ assignedTo,onClose }) {
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineHours, setDeadlineHours] = useState("");
    
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (description.trim() === '' || deadlineDate.trim() === '' || deadlineHours.trim() === '') {
      alert('All fields are required');
      return;
    }

    try {
    console.log(assignedTo);
    console.log(typeof(descri));
  const bodyObj={ title:title , assignedTo:assignedTo , description:description,deadlineHours:deadlineHours,deadlineDate:deadlineDate };
      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/task/assigntask`, bodyObj);

      if (res.status === 200) {
        window.alert(res.data.message);
        onClose();
      } else {
        throw new Error(res.data.message);
      }
    } catch (err) {
      window.alert(err.message);
      console.log(err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex justify-center items-center">
      <div className="bg-white p-8 rounded-lg shadow-lg transform transition-transform scale-105 relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-black">
          &times;
        </button>
        <form>
          <h1 className="text-2xl font-bold mb-4">Assign Task</h1>
          <label htmlFor="title" className="block mb-2">Title</label>
          <input
            type="text"
            name="title"
            className="border p-2 rounded w-full mb-4"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <label htmlFor="description" className="block mb-2">Description</label>
          <input
            type="text"
            name="description"
            className="border p-2 rounded w-full mb-4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label htmlFor="hours" className="block mb-2">Deadline by Hours</label>
          <input
            type="number"
            name="hours"
            className="border p-2 rounded w-full mb-4"
            value={deadlineHours}
            onChange={(e) => setDeadlineHours(e.target.value)}
          />
          <label htmlFor="date" className="block mb-2">Deadline by Date</label>
          <input
            type="date"
            name="date"
            className="border p-2 rounded w-full mb-4"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
          />
          <button onClick={handleSubmit} className="bg-black text-white px-4 py-2 rounded">
            Assign
          </button>
        </form>
      </div>
    </div>
  );
}

export default Tasks;
