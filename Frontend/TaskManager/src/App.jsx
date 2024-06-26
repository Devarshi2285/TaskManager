import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import Layout from './Component/Layout';
import Home from './Component/Home';
import SignUp from './Component/SignUp';
import Teams from './Component/Team';
import CreateTeam from './Component/CreateTeam';
import JoinTeam from './Component/JoinTeam';
import TeamDetails from './Component/TeamDetails';
import Tasks from './Component/Tasks';
import GetTask from './Component/GetTask';
import Chat from './Component/Chat';
import Discussion from './Component/Discussion';
import Login from './Component/Login';
import Profile from './Component/Profile';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'about',
        element: <h1>About</h1>,
      },
      {
        path: 'teams',
        element: <Teams />,
      },
      {
        path: 'teamdetails/:id',
        element: <TeamDetails />,
      },
      {
        path: 'assigntask/:empid',
        element: <Tasks />,
      },
      {
        path: 'gettask/',
        element: <GetTask />,
      },
      {
        path: 'discussion/:teamid',
        element: <Discussion />,
      },
      {
        path: 'chat/:receiverid',
        element: <Chat />,
      },
      {
        path: 'createteam',
        element: <CreateTeam />,
      },
      {
        path: 'jointeam',
        element: <JoinTeam />,
      },
      {
        path: 'profile/:userid',
        element: <Profile />,
      },
      {
        path: '/signup',
        element: <SignUp />,
      },
      {
        path: '/login',
        element: <Login />,
      }
    ],
  },
  
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
