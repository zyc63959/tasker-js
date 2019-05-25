// @ts-check
import React from 'react';
import './App.css';
import { Task } from './Task';
import { loadTask } from '../tasks';
import Paper  from '@material-ui/core/Paper';

// const devMode = process.env.NODE_ENV !== 'production';

const taskNames = ['work', 'eating', 'workout', 'programming'];
let tasks;
if (!window.tk) {
    window.tk = { global: () => { } };
    tasks = [require('../../fixtures/fakeTask').running, ...taskNames.slice(1).map(loadTask)];
} else {
    tasks = taskNames.map(loadTask);
}

function App() {
    return (
        <Paper className='App-header'>
            {tasks.map(task =>
                <Task {...task} key={task.title}></Task>
            )}
        </Paper>
    );
}
// function App() {
//     return (
//         <Grid container spacing={2} className="App-header">
//             {tasks.map(task =>
//                 <Grid item key={task.title}>
//                     <Task {...task}></Task>
//                 </Grid>)}
//         </Grid>
//     );
// }

export default App;
