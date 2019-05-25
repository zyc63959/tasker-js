/* eslint-env jest */
import './__mocks__/tasker';
import { loadTask, updateTask } from '../src/tasks';
import { emptyTask } from '../src/emptyTask';

describe('Should task tasks =>', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return default Task', () => {
        const title = 'test-1';
        const expected = emptyTask(title);
        expect(loadTask(title)).toEqual(expected);
        expect(tk.readFile).toHaveBeenCalledWith(expect.any(String));
        expect(tk.flashLong).toHaveBeenCalledWith('Reading from database');
        expect(tk.flash).toHaveBeenCalledWith('Reading from database');
    });

    it('should load a Task', () => {
        const title = 'test-1';
        tk.readFile.mockReturnValueOnce(JSON.stringify({tasks:[{title}]}));
        const expected = emptyTask(title);
        expect(loadTask(title)).toEqual(expected);
        expect(tk.readFile).toHaveBeenCalledWith(expect.any(String));
        expect(tk.flashLong).toHaveBeenCalledWith('Reading from database');
        expect(tk.flash).toHaveBeenCalledWith('Reading from database');
    });

    it('update specific Task field', () => {
        const title = 'test-2';
        const startedAt = Symbol('startedAt');
        const updater = jest.fn().mockReturnValue({startedAt});
        const initialValue = JSON.stringify({tasks:[]},null,2);
        const task = {
            title,
            startedAt,
            pauses: [],
            stoppedAt: null,
        };
        expect(updateTask(updater)(title)).toEqual(task);
        expect(updater).toHaveBeenCalledWith(emptyTask(title));
        expect(tk.writeFile).toHaveBeenCalledWith(expect.any(String),initialValue,false);
        expect(tk.flash).toHaveBeenCalledWith('DB write complete!');
    });
});
