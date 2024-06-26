// import './App.css'
import React from 'react'
import '../App.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState,useEffect } from 'react';
import customFetch from '../../fetchInstance';

function Header() {
  const [user, setUser] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      console.log('Starting fetch...');
      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`,null);
      // console.log('Fetch response status:', res.status);
      // console.log( res.data);
      if (res.status !== 200) {
        throw new Error('Failed to fetch profile');
      }
      const data = res.data;
      // console.log('Fetched data:', data);
      setUser(data.username);
    } catch (err) {
      navigate('/signup');
      console.error('Error fetching profile:', err.message);
      setError(err.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('refreshtoken')) { fetchData(); }

  }, []);

  const goForLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshtoken');
    setUser('');
    navigate('/signup');
  };
  
  return (
    <>

      <div className='sm:grid sm:grid-cols-12'>
        <div className='sm:col-start-1 sm:col-end-4'>
          <div className='pl-5 pt-2'> 
            <a href='/' className='font-extrabold text-3xl'>
            TeamTable
          </a>
          </div>

        </div>

       <div className='sm:col-start-11 col-end-13 text-center'> 

          <div className='sm:grid sm:grid-cols-3 pt-2'>
            <div><a href="/">About</a></div>
            <div><a href="/teams">Teams</a></div>
            { user && (
              
              <div><a onClick={goForLogout} className="hover:cursor-pointer">Logout</a></div>
            )}
            { !user && (
              
              <div><a href='/login'>Login</a></div>
            )}
            
          </div>

        </div>
      </div>

    </>
  )
}

export default Header
