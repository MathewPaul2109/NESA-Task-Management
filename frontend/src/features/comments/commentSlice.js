import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  comments: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getComments = createAsyncThunk('comments/getAll', async (taskId, thunkAPI) => {
  try {
    const response = await api.get(`/comments/${taskId}`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addComment = createAsyncThunk('comments/add', async ({ taskId, content }, thunkAPI) => {
  try {
    const response = await api.post(`/comments/${taskId}`, { content });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const getProjectComments = createAsyncThunk('comments/getProject', async (projectId, thunkAPI) => {
  try {
    const response = await api.get(`/comments/project/${projectId}`);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const addProjectComment = createAsyncThunk('comments/addProject', async ({ projectId, content }, thunkAPI) => {
  try {
    const response = await api.post(`/comments/project/${projectId}`, { content });
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const commentSlice = createSlice({
  name: 'comment',
  initialState,
  reducers: {
    resetComments: (state) => {
      state.comments = [];
      state.isError = false;
      state.isSuccess = false;
      state.isLoading = false;
      state.message = '';
    },
    // Useful for real-time updates from socket.io
    appendComment: (state, action) => {
      // Check if it already exists to avoid duplicates if both socket and API return it
      const exists = state.comments.find(c => c._id === action.payload._id);
      if (!exists) {
        state.comments.push(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments = action.payload;
      })
      .addCase(getComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      })
      .addCase(getProjectComments.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectComments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.comments = action.payload;
      })
      .addCase(getProjectComments.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addProjectComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
      });
  },
});

export const { resetComments, appendComment } = commentSlice.actions;
export default commentSlice.reducer;
