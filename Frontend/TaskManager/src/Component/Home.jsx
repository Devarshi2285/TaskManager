import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import customFetch from '../../fetchInstance';
function Home() {
  const [user, setUser] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      console.log('Starting fetch...');
      const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/profile`,null);
      // console.log('Fetch response status:', res.status);
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
    <div className='min-h-screen bg-white'>
      <div className='w-11/12 m-auto pt-40'>
        <div className='grid grid-cols-2'>

          <div className='pl-14 pt-16'>
          <h1 className='text-5xl font-extrabold'>Hello {user}</h1>
            <h1 className='text-5xl font-extrabold'>StreamLine Your Team's WorkFlow</h1>
            <p className='font-bold text-lg text-slate-400'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic excepturi ad incidunt culpa pariatur doloremque cum distinctio, nemo delectus quam odit necessitatibus, quod adipisci accusantium atque! Aperiam aut sunt necessitatibus!</p>
            <div className='pt-3'>

              <div className='w-2/12 bg-black rounded-full min-h-8 hover:shadow-[0_4px_10px_rgba(0,0,0,0.9)] transition-shadow'>
                <button className='w-full text-white pt-1 font-semibold'>Getstared</button>
              </div>

            </div>

          </div>
          <div className=' opacity-70'><img className='rounded-lg' src="https://media.istockphoto.com/id/1434742171/photo/laptop-ppt-presentation-business-meeting-and-team-working-on-review-for-new-digital-website.jpg?s=612x612&w=0&k=20&c=MA7DEVo4nFIJPXgERQQx-W5srlaMThr_aFtDRaHeB00=" alt="" /></div>
        </div>

        <div className='w-full pt-36'>
          <div className='w-full'>
            <div className='w-2/3 m-auto text-center'>
              <h1 className='text-5xl font-extrabold'>StreamLine Your Work Flow!!</h1>
            </div>
            <div className='pt-3'>
              <div className='w-1/6 m-auto bg-slate-200 text-center rounded-full'>
                <h1 className='font-bold text-xl p-1'>Key fetures</h1>
              </div></div>

            <div className='pt-4'>

              <div className='w-3/4 m-auto text-center'>
                <p className='font-bold text-lg text-slate-400' >Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla temporibus expedita fuga non earum omnis, suscipit perspiciatis deleniti quidem aperiam recusandae corrupti dictao!</p>
              </div>

            </div>
          </div>

          <div className='w-3/4 pt-16 grid grid-cols-3  gap-11 m-auto'>
            <div>
              <div className='w-full'>
                <div className='w-1/5 float-left rounded-full'>
                    <img className='rounded-full w-16' src="https://cdn-icons-png.freepik.com/512/6488/6488298.png" alt="" />
                </div>
                <div className='w-2/3 text-left pl-20'>
                <h1 className='text-2xl font-extrabold'>Team Managmet</h1>
                </div>
                <div className='pt-4'>
                <p className='font-bold text-lg text-slate-400 text-left'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vero sunt voluptatem a fugit nemo dolorem cum illo obcaecati vitae quasi. Vitae laborum praesentium ullam saepe odit numquam hic recusandae natus.</p>
                </div>
              </div>
              
          
            </div>
            <div>
              <div className='w-full'>
                <div className='w-1/5 float-left rounded-full'>
                    <img className='rounded-full w-16' src="https://cdn-icons-png.freepik.com/512/6488/6488298.png" alt="" />
                </div>
                <div className='w-2/3 text-left pl-20'>
                <h1 className='text-2xl font-extrabold'>Team Managmet</h1>
                </div>
                <div className='pt-4'>
                <p className='font-bold text-lg text-slate-400 text-left'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vero sunt voluptatem a fugit nemo dolorem cum illo obcaecati vitae quasi. Vitae laborum praesentium ullam saepe odit numquam hic recusandae natus.</p>
                </div>
              </div>
              
          
            </div>
            <div>
              <div className='w-full'>
                <div className='w-1/5 float-left rounded-full'>
                    <img className='rounded-full w-16' src="https://cdn-icons-png.freepik.com/512/6488/6488298.png" alt="" />
                </div>
                <div className='w-2/3 text-left pl-20'>
                <h1 className='text-2xl font-extrabold'>Team Managmet</h1>
                </div>
                <div className='pt-4'>
                <p className='font-bold text-lg text-slate-400 text-left'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vero sunt voluptatem a fugit nemo dolorem cum illo obcaecati vitae quasi. Vitae laborum praesentium ullam saepe odit numquam hic recusandae natus.</p>
                </div>
              </div>
              
          
            </div>
            
          </div>



        </div>


      </div>
      <div className='pt-10'>
      <div className='w-full bg-black min-h-16 text-center'>
          <p className='text-white pt-6'>@All right reserved</p>
      </div>
       </div>

    </div>


  );
}

export default Home;
