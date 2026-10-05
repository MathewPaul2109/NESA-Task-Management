import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  items: [],
  total: 0,
  totalPages: 0,
  currentPage: 1,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getProjects = createAsyncThunk('projects/getAll', async (params = {}, thunkAPI) => {
  try {
    const response = await api.get('/projects', { params });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
  try {
    const response = await api.post('/projects', projectData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProject = createAsyncThunk('projects/update', async ({ id, projectData }, thunkAPI) => {
  try {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const deleteProject = createAsyncThunk('projects/delete', async (id, thunkAPI) => {
  try {
    await api.delete(`/projects/${id}`);
    return id; // return id so we can remove it from state
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    reset: () => initialState,
    updateProjectInState: (state, action) => {
      const index = state.items.findIndex(p => p._id === action.payload._id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items = action.payload.projects || [];
        state.total = action.payload.total || 0;
        state.totalPages = action.payload.totalPages || 0;
        state.currentPage = action.payload.currentPage || 1;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.items.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p._id !== action.payload);
      });
  },
});

export const { reset, updateProjectInState } = projectSlice.actions;
export default projectSlice.reducer;
