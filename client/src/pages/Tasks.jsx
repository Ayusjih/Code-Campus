import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [code, setCode] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchTasks = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/tasks/list/${auth.currentUser.uid}`);
            setTasks(res.data);
        } catch (err) { console.error(err); }
    };
    fetchTasks();
  }, []);

  const handleSubmit = async () => {
    try {
        await axios.post('http://localhost:5000/api/tasks/submit', {
            firebase_uid: auth.currentUser.uid,
            task_id: selectedTask.id,
            code: code
        });
        alert("Solution Submitted Successfully!");
        setSelectedTask(null);
        setCode('');
    } catch (err) {
        alert("Submission failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">⚡ Daily Assessments</h1>
        <p className="text-gray-500 mb-8">Tasks expire 24 hours after being posted by your teacher.</p>

        {selectedTask ? (
            // --- CODE EDITOR VIEW ---
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row h-[70vh]">
                <div className="w-full md:w-1/3 p-6 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                    <button onClick={() => setSelectedTask(null)} className="text-sm text-blue-600 font-bold mb-4">← Back to List</button>
                    <h2 className="text-2xl font-bold mb-2">{selectedTask.title}</h2>
                    <div className="text-xs text-gray-500 mb-4">Posted by: {selectedTask.teacher_name}</div>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTask.description}</p>
                </div>
                <div className="w-full md:w-2/3 bg-gray-900 flex flex-col">
                    <textarea 
                        className="flex-1 bg-gray-900 text-green-400 font-mono p-6 outline-none resize-none"
                        placeholder="// Write your Java/C++ code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    ></textarea>
                    <div className="p-4 bg-gray-800 flex justify-end">
                        <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">Submit Solution</button>
                    </div>
                </div>
            </div>
        ) : (
            // --- TASK LIST VIEW ---
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-400">No active assessments for your branch/semester today.</div>
                ) : tasks.map(task => (
                    <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">Expiring Soon</span>
                            <span className="text-xs text-gray-400">{new Date(task.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{task.title}</h3>
                        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{task.description}</p>
                        <button 
                            onClick={() => setSelectedTask(task)}
                            className="w-full bg-indigo-50 text-indigo-600 font-bold py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                        >
                            Start Assessment
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

// ... (rest of your component code) ...

export default Tasks; // <--- THIS IS CRITICAL