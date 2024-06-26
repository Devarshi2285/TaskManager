import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Signup.css';
import customFetch from '../../fetchInstance';


function SignUp() {
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        console.log("Submitting form...");
        const formData = new FormData(e.target);

        const username = formData.get('username');
        const email = formData.get('mail');
        const password = formData.get('password');
        const repassword = formData.get('repassword');
        const experience = formData.get('experience');

        if (username === "" || email === "" || password === "" || repassword === ""  || experience === "") {
            window.alert("All fields are necessary");
        } else if (password.length !== 8) {
            window.alert("Password must be 8 characters");
        } else if (password !== repassword) {
            window.alert("Re-enter password should be same as password");
        } else {
            const formObj = {};

            formData.forEach((value, key) => {
                formObj[key] = value;
            });

            try {
                console.log("here:"+import.meta.env.SERVER_REQ_URI);
                const res = await customFetch(`${import.meta.env.VITE_SERVER_REQ_URI}/auth/signup`, formObj);
                if (res.status === 200) {
                    console.log("User created");
                    navigate('/login');
                } else {
                    const data = await res.text();
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
                <h1 className="text-center text-2xl font-bold mb-6 text-black">Sign Up</h1>
                <form onSubmit={handleSignup}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="username"
                            type="text"
                            name="username"
                            placeholder="Username"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="mail">
                            Email
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="mail"
                            type="email"
                            name="mail"
                            placeholder="Email"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="password"
                            type="password"
                            name="password"
                            placeholder="Password"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="repassword">
                            Re-enter Password
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="repassword"
                            type="password"
                            name="repassword"
                            placeholder="Re-enter Password"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="experience">
                            Experience
                        </label>
                        <input
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            id="experience"
                            type="text"
                            name="experience"
                            placeholder="Experience"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <button
                            className="bg-black hover:bg-slate-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            type="submit"
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
