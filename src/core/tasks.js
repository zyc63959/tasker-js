// @ts-check
import { isOdd } from '../dashboard/isOdd';
import { db } from '../database/db';
import { emptyTask } from './emptyTask';
import * as fb from './fb';
import forOwn from 'lodash/forOwn';

const Now = () => new Date().toISOString();

/**
 * 
 * @typedef  TaskEntry
 * @property {Number|null} startedAt
 * @property {Number|null} stoppedAt
 * @property {[Number]|[]} pauses
 */

/**
 * 
 * @typedef  Task
 * @property {String} title
 * @property {TaskEntry[]} executionLog
 */

export const isPaused = (pauses) => pauses.length && isOdd(pauses.length);

/**
 * @typedef {'running'|'stopped'|'running'|'not-started'} Status
 */

export const TaskStatus = {
    /** @type {Status} */
    STOPPED: 'stopped',
    PAUSED: 'paused',
    RUNNING: 'running',
    NOT_STARTED: 'not-started'
};

/**
 * computes the status of a task based on its fields
 * @param {Task} param0 
 * @returns {Status}
 */
export const getTaskStatus = ({ startedAt, stoppedAt, pauses }) => {
    if (stoppedAt) return TaskStatus.STOPPED;
    if (startedAt && isPaused(pauses)) return TaskStatus.PAUSED;
    if (startedAt) return TaskStatus.RUNNING;
    return TaskStatus.NOT_STARTED;
};

export const saveLocalTask = (value) => {
    const current = db.get('tasks').find({ title: value.title });
    if (current.value()) {
        return current.assign(value).write();
    }
    return db.get('tasks').push(value).write();
};

/**
 * Gets an object of tasks from firebase and saves each task to the local database
 * @param {Object} tasks Object containing the tasks to sync them with the local database
 */
export const syncTasks = tasks => {
    forOwn(tasks,saveLocalTask);
};

/**
 * Loads a task from the storage or returns a default one
 * @param {String} title the name of the task to load
 * @returns {Task} the task from database or empty task if it was not found or invalid
 */
export const loadTask = title => {
    const task = db.get('tasks')
        .find({ title })
        .value();
    return task || emptyTask(title);
};

export const formatOutputTask = ({executionLog, ...task}) => ({...task, ...executionLog[0]});

export const updateTask = updater => name => {
    try {
        const {executionLog, ...task} = loadTask(name);
        const newLog = updater(executionLog);
        const newTask = { ...task, executionLog: newLog };
        saveLocalTask(newTask);
        fb.saveTask(newTask); //send it to firebase too
        return formatOutputTask(newTask);
    } catch (error) {
        tk.flash(`Error updating task ${name}:\n ${error.toString()}`);
    }
};
/**
 * Takes a function and uses it to update the first entry of the array
 * @param {(Object)=>Object} fn 
 */
const updateHead = fn => ([current, ...tail]) => {
    const updatedEntry = { ...current, ...fn(current) };
    return [updatedEntry, ...tail];
};
// This is the only function that inserts a new entry on the execution log
export const startTask = updateTask((executionLog) => [
    { startedAt: Now(), stoppedAt: null, pauses: [] }, 
    ...executionLog
]);
export const stopTask = updateTask(updateHead(() => ({ stoppedAt: Now() })));
export const pauseTask = updateTask(updateHead(({ pauses = [] }) => (
    { pauses: pauses.concat(Now()) }
)));

// Sync with firebase
fb.subscribe(saveLocalTask);