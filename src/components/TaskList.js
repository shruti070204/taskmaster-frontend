import React, {useEffect,useState} from "react"; //core react lib, hook for performingside effects(fetching data) after component mounts, hook to add state(vars) to func components
import api from "../services/api"; //custom axios instance use to make http req weith pre-configured settings

function TaskList(){
    const[tasks,setTasks]=useState([]); //listof task ftech frm be,func to upd task,init as empty arr

    useEffect(() =>{//run after components is 1st rendered,fetch tasks from api when component loads
        const token=localStorage.getItem('token') //authenticate user for api calls
        api.get('tasks/',{ //send get req, fetch task assigned user
            headers:{
                Authorization:`Bearer ${token}`, //include jwt token
            },
        })
        .then(res =>setTasks(res.data)) //takes res data and stores it  in tasks state
        .catch(err => console.error(err)); //catch any err from api call and log it to console 
    }, []);

    return (
        <div>
            <h2>Tasks</h2>
            <ul>
                {tasks.map(task=>( //iterates task arr
                    <li key={task.id}>{task.title}-{task.status}</li>
                ))}
            </ul>
        </div>
    );
}

export default TaskList;