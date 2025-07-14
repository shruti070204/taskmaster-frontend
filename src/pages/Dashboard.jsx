import React, {useCallback, useEffect,useState} from 'react';//hooks for state, lifecycle and memoizing func
import axios from 'axios';//http client to call backend api
import {jwtDecode} from 'jwt-decode'//decodes jwt to extract user info
import 'bootstrap/dist/css/bootstrap.min.css';

function Dashboard({token}){
    const authToken=token ||localStorage.getItem('token'); //gets token from props or local storage(for authentication header)
    //store the list of task and filter for statu spriority and due date
    const [task,setTasks]=useState([]);
    const [statusFilter,setStatusFilter]=useState('');
    const [priorityFilter,setPriorityFilter]=useState('');
    const [dueDateFilter,setDueDateFilter]=useState('');
    //store inputs for cretaing a noew task
    const [newTitle, setNewTitle] = useState('');
    const [newDueDate, setNewDueDate] = useState('');
    const [newPriority, setNewPriority] = useState('');
    //manages update of task
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editStatus, setEditStatus] = useState('');
    const [editPriority, setEditPriority] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

    const fetchTasks = useCallback(() => { //memorise the func to avoid unnecessary rerenders
        const authHeader={ //prep using jwt
            Authorization: `Bearer ${authToken}`
        };
        console.log("auth header:",authHeader);
        axios.get('http://127.0.0.1:8000/api/tasks/', { //fetch filtered task from be an dupd the state
            headers: authHeader,
            params: {
                status: statusFilter,
                priority_level: priorityFilter,
                due_date: dueDateFilter,
            },
        })
        .then(res => setTasks(res.data))
        .catch(err => console.error(err));
    },[authToken,statusFilter,priorityFilter,dueDateFilter]); 
        //auto loads tasks when component mount or token change
        useEffect(()=>{
            console.log("Token recevived in dashboard: ",authToken);
            if (authToken){
                fetchTasks();
            }
        },[authToken,fetchTasks]);

    const getUserIdFromToken=(token) => {
        try{
            const decoded = jwtDecode(token);
            return decoded.user_id; //extract uid from jwt so fe can assoiciate created task with the logged in user
        }catch(e){
            console.error("Invalid or missing token");
            return null;
        }   
    }

    const handleCreateTask = async () => {
        try { //create new task via post 
            await axios.post('http://127.0.0.1:8000/api/tasks/', {
                title: newTitle,
                due_date: newDueDate,
                priority_level: newPriority,
                status: "TODO",  // default
                assigned_to: getUserIdFromToken(authToken)
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            // Reset form and refresh
            setNewTitle('');
            setNewDueDate('');
            setNewPriority('');
            fetchTasks(); //show new task
            // Reload tasks
            axios.get('http://127.0.0.1:8000/api/tasks/', {
                headers: { Authorization: `Bearer ${authToken}` },
            }).then(res => setTasks(res.data));
    
        } catch (err) {
            console.error("Failed to create task:", err.res?.data || err);
        }
    };
    //clears token and redirect to login
    const handleLogout=()=> {
        localStorage.removeItem('token');
        window.location.href='/login';
    };
    //confirms, deletes task via api and refresh  task list
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            console.log("Deleting task with ID:", id);
            await axios.delete(`http://127.0.0.1:8000/api/tasks/${id}/`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });
            fetchTasks();
        } catch (err) {
            console.error('Delete error:', err);
        }
    };
    //loads selected task to editable file
    const handleEdit = (task) => {
        setEditingTaskId(task.id);
        setEditTitle(task.title);
        setEditStatus(task.status);
        setEditPriority(task.priority_level);
        setEditDueDate(task.due_date);
    };
    //save upd using patch and refresh list
    const saveEdit = async (id) => {
        try {
            await axios.patch(
                `http://127.0.0.1:8000/api/tasks/${id}/`,
                {
                    title: editTitle,
                    status: editStatus,
                    priority_level: editPriority,
                    due_date:editDueDate
                },
                { headers: { Authorization: `Bearer ${authToken}` } }
            );
            setEditingTaskId(null);
            setEditTitle('');
            setEditStatus('');
            setEditPriority('');
            setEditDueDate('');
            fetchTasks();
        } catch (err) {
            console.error('Update failed:', err);
        }
    };
    //assign bootstrap color classes to status for better ui
    const getBadgeColor = (status) => {
        switch (status) {
            case 'TODO':
                return 'bg-secondary';
            case 'INPROGRESS':
                return 'bg-warning text-dark';
            case 'DONE':
                return 'bg-success';
            default:
                return 'bg-light text-dark';
            }
        };

    return (
        <div className='container mt-5'>
            <h2>Task Dashboard</h2>
            <div className='mb-4'>
                <div className='row g-3 align-items-end'>

                    <div className='col-md-3'>
                        <label htmlFor='statusFilter' className='form-label fw-bold'>Status: </label>
                        <select id='statusFilter' onChange={(e) => setStatusFilter(e.target.value)} className='form-select'>
                            <option value=''>All</option>
                            <option value='TODO'>To Do</option>
                            <option value='INPROGRESS'>In Progress</option>
                            <option value='DONE'>Done</option>
                        </select>
                    </div>

                    <div className='col-md-3'>
                        <label htmlFor='priorityFilter' className='form-label fw-bold'>Priority: </label>
                        <select id='priorityFilter' onChange={(e) => setPriorityFilter(e.target.value)} className='form-select'>
                            <option value="">All Priorities</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div className='col-md-3'>
                        <label htmlFor='dueDateFilter' className='form-label fw-bold'>Due Date: </label>
                        <input id='dueDateFilter' type='date' onChange={(e) => setDueDateFilter(e.target.value)} className='form-control'/>
                    </div>

                    <div className='row mt-3'>
                        <div className='col-md-12 d-flex justify-content-start'>
                            <button className="btn btn-primary" onClick={fetchTasks}>Filter</button>
                        </div>
                    </div>
                </div>    
            </div>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Priority</th>
                        <th>Due date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {task.map((task)=>(
                        <tr key={task.id}>
                            <td>
                                {editingTaskId === task.id ? (
                                    <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}className="form-control"/>
                                ):(
                                    task.title
                                )}
                            </td>
                            <td>
                                {editingTaskId === task.id ?(
                                    <select className='form-select' value={editStatus} onChange={(e)=> setEditStatus(e.target.value)}>
                                        <option value="TODO">To do</option>
                                        <option value="INPROGRESS">In progress</option>
                                        <option value="DONE">Done</option>
                                    </select>
                                ):(
                                    <span className={`badge ${getBadgeColor(task.status)}`}>{task.status}</span>
                                )}
                            </td>
                            <td>
                                {editingTaskId === task.id ? (
                                    <select className='form-select' value={editPriority} onChange={(e) => setEditPriority(e.target.value)}>
                                        <option value="high">High</option>
                                        <option value="medium">Medium</option>
                                        <option value="low">Low</option>
                                    </select>
                                ) : (
                                    task.priority_level
                                )}
                            </td>
                            <td>
                                {editingTaskId === task.id ? (
                                    <input type='date' className='form-control' value={editDueDate} onChange={(e) =>setEditDueDate(e.target.value)}/>
                                ):(
                                    task.due_date
                                )}
                            </td>
                            <td>
                                {editingTaskId === task.id ? (
                                    <>
                                        <button className='btn btn-sm btn-success mt-2' onClick={() => saveEdit(task.id)}>Save</button>
                                        <button className="btn btn-sm btn-secondary" onClick={() => setEditingTaskId(null)}>Cancel</button>
                                    </>
                                ):(
                                    <>
                                        <button className='btn btn-sm btn-outline-primary me-2' onClick={()=> handleEdit(task)}>Edit</button>
                                        <button className='btn btn-sm btn-outline-danger' onClick={() => handleDelete(task.id)}>Delete</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    {task.length === 0 &&(
                        <tr>
                            <td colSpan="5" className='text-center'>No task yet. Add one below.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            <h4 className='mt-4'>Add new task</h4>
            <input type='text' placeholder='task title' className='form-control mb-2'value={newTitle} onChange={(e)=> setNewTitle(e.target.value)}/>
            <input type="date" className="form-control mb-2" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)}/>
            <select className='form-select mb-2' value={newPriority} onChange={(e)=>setNewPriority(e.target.value)}>
                <option value="">Select Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>
            <button onClick={handleCreateTask} className="btn btn-success">Add Task</button>
            <button className="btn btn-danger float-end" onClick={handleLogout}>Logout</button>

        </div>
        
    );
}
export default Dashboard;
