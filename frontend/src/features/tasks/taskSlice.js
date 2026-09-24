import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  tasks: [],
  archivedTasks: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  isArchivedLoading: false,
  message: '',
};

export const getTasks = createAsyncThunk('tasks/getAll', async (projectId, thunkAPI) => {
  try {
    const url = projectId ? `/tasks?projectId=${projectId}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, taskData }, thunkAPI) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createTask = createAsyncThunk('tasks/create', async (taskData, thunkAPI) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const archiveTask = createAsyncThunk('tasks/archive', async (taskId, thunkAPI) => {
  try {
    await api.patch(`/tasks/${taskId}/archive`);
    return taskId;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getArchivedTasks = createAsyncThunk('tasks/getArchived', async (_, thunkAPI) => {
  try {
    const response = await api.get('/tasks/archived');
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const restoreTask = createAsyncThunk('tasks/restore', async (taskId, thunkAPI) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/restore`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const taskSlice = createSlice({
  name: 'task',
  initialState,
  reducers: {
    reset: (state) => initialState,
    removeTask: (state, action) => {
      state.tasks = state.tasks.filter(t => t._id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tasks = action.payload;
      })
      .addCase(getTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        // Find index and update the specific task in the state
        const index = state.tasks.findIndex(t => t._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
      })
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(archiveTask.fulfilled, (state, action) => {
        // Remove the archived task from the active list immediately
        state.tasks = state.tasks.filter(t => t._id !== action.payload);
      })
      .addCase(archiveTask.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getArchivedTasks.pending, (state) => {
        state.isArchivedLoading = true;
      })
      .addCase(getArchivedTasks.fulfilled, (state, action) => {
        state.isArchivedLoading = false;
        state.archivedTasks = action.payload;
      })
      .addCase(getArchivedTasks.rejected, (state, action) => {
        state.isArchivedLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(restoreTask.fulfilled, (state, action) => {
        // Remove from archived list
        state.archivedTasks = state.archivedTasks.filter(t => t._id !== action.payload._id);
        // Add back to active tasks list
        state.tasks.push(action.payload);
      })
      .addCase(restoreTask.rejected, (state, action) => {
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, removeTask } = taskSlice.actions;
export default taskSlice.reducer;