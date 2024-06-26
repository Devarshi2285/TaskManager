import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Signup.css';
import customFetch from '../../fetchInstance';


function Login() {
    const navigate = useNavigate();

    const handleSignin = async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const username = formData.get('loginusername');
        const password = formData.get('loginpassword');

        if (username === "" || password === "") {
            window.alert("All fields are necessary!!");
        } else {
            const formObj = {
                username: username,
                password: password
            };

            try {
                const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/signin`, formObj);


                if (res.status === 200) {
                    const data = res.data;
                    console.log("Access Token:", data.token);
                    console.log("Refresh Token:", data.refreshtoken);

                    localStorage.setItem('token', data.token);
                    localStorage.setItem('refreshtoken', data.refreshtoken);
                    navigate('/teams');
                } else {
                    const data = res.data.message;
                    window.alert(data);
                }
            } catch (err) {
                console.log('There was a problem with your fetch operation:', err);
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100">
            <div className="w-full max-w-md p-8 bg-white shadow-2xl rounded-lg">
                <h1 className="text-center text-2xl font-bold mb-6 text-black">Login</h1>
                <form onSubmit={handleSignin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loginusername">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="loginusername"
                            type="text"
                            name="loginusername"
                            placeholder="Username"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="loginpassword">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="loginpassword"
                            type="password"
                            name="loginpassword"
                            placeholder="Password"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-black hover:bg-slate-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Sign In
                        </button>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <a href="/forgot-password" className="inline-block align-baseline font-bold text-sm text-slate-600 hover:text-slate-800">
                            Forgot Password?
                        </a>
                        <a href="/signup" className="inline-block align-baseline font-bold text-sm text-slate-600 hover:text-slate-800">
                            Sign Up Here
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Login;
