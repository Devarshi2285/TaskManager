import React, { useEffect, useRef } from 'react';

function Popup({ onClose }) {
  const popupRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div ref={popupRef} className="bg-white p-8 rounded-lg shadow-lg transform transition-transform scale-105">
        <h2 className="text-xl font-bold mb-4">Create a New Team</h2>
        <p>Form and content for creating a team goes here...</p>
        <button onClick={onClose} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded text-center">
          Close
        </button>
      </div>
    </div>
  );
}

export default Popup;
