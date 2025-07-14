import { useState } from 'react'; //manage components like username, emal,password and selected role
import axios from 'axios'; // /api/register/
import 'bootstrap/dist/css/bootstrap.min.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); //radio button for user and admin default user

  const handleRegister = async () => { //called when register button is clicked
    try{
      const response =await axios.post('http://127.0.0.1:8000/api/register/', { //send post requets to jango registrations details
        username,
        email,
        password,
        is_staff: role === 'admin', //if user selects admin will be is_staff
      });
      console.log("Registration successful:",response.data);
      window.location.href = '/login'; //if succeed redirect to login page
    }catch(error){
      if(error.response){
        console.error("server error: ",error.response.data); //if server responds with err
        alert(JSON.stringify(error.response.data)); 
      }else{
        console.error("unknown error: ",error);
        alert("registration failed."); // if request fails entirely
      }
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <input type="text" placeholder="Username" onChange={e => setUsername(e.target.value)} className="form-control mb-2"/>
      <input type="email" placeholder="Email" onChange={e => setEmail(e.target.value)} className="form-control mb-2"/>
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} className="form-control mb-2" />
      <div className="mb-3">
        <label>Select Role:</label>
        <div>
          <label className="me-3">
            <input type="radio" value="user" checked={role === 'user'} onChange={(e) => setRole(e.target.value)}/>User </label>
          <label>
            <input type="radio" value="admin" checked={role === 'admin'} onChange={(e) => setRole(e.target.value)}/>Admin </label>
          </div>
        <button onClick={handleRegister} className="btn btn-success" disabled={!username || !email || !password}>Register</button>
      </div>
    </div>
  );
}

export default Register;
