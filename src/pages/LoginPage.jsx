import React, {useState} from 'react'; //required write react component, to manage local component state
import {useNavigate} from 'react-router-dom'; //for programmatic navigation
import api from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

function LoginPage({setToken}){
    const [username, setUsername]=useState('');
    const [password,setPassword]=useState('');
    const navigate = useNavigate();

    const handleLogin=async(e)=>{
        e.preventDefault(); //prevent default submission which reload page
        try{
            const response=await api.post('/token/',{
                username,
                password,
            }); //sends post to jango be /token/ endpoint with the user cred to get jwt
            const accessToken=response.data.access;
            console.log("Received access token:",accessToken);//debuggingg log to verify token received
            setToken(accessToken); //save token in parent component
            localStorage.setItem('token',accessToken); //save in browser
            window.location.href=('/dashboard'); //redirect to dashboard
        } catch(error){
            alert('login failed check credentials.');
        }
    };
    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div className="mb-3">
                    <label>Username</label>
                    <input type='text' className='form-control' value={username} onChange={(e)=>setUsername(e.target.value)}required/>
                </div>
                <div className='mb-3'>
                    <label>Password</label>
                    <input type='password' className='form-control' value={password} onChange={(e)=> setPassword(e.target.value)}required/>
                </div>
                <button type='submit' className='btn btn-primary'>Login</button>
            </form>
            <hr/>
            <p>Don't have an account? </p>
            <button className='btn btn-outline-secondary' onClick={() => navigate('/register')}>Register</button>
        </div>
    );
}

export default LoginPage;
