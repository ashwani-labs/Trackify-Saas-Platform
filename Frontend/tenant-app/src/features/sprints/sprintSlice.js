import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../utils/axios';

export const fetchSprintsByProject = createAsyncThunk('sprints/fetchSprints', async (projectId) => {
  const response = await axiosInstance.get(`/projects/${projectId}/sprints`);
  return response.data.data;
});

export const createSprint = createAsyncThunk('sprints/createSprint', async (sprintData) => {
  const response = await axiosInstance.post(
    `/projects/${sprintData.projectId}/sprints`,
    sprintData
  );
  return response.data.data;
});

export const updateSprint = createAsyncThunk(
  'sprints/updateSprint',
  async ({ id, projectId, ...data }) => {
    const response = await axiosInstance.put(`/projects/${projectId}/sprints/${id}`, {
      ...data,
      projectId,
    });
    return response.data.data;
  }
);

export const startSprint = createAsyncThunk('sprints/startSprint', async ({ id, projectId }) => {
  const response = await axiosInstance.put(`/projects/${projectId}/sprints/${id}/start`);
  return response.data.data;
});

export const completeSprint = createAsyncThunk(
  'sprints/completeSprint',
  async ({ id, projectId }) => {
    const response = await axiosInstance.put(`/projects/${projectId}/sprints/${id}/complete`);
    return response.data.data;
  }
);

const sprintSlice = createSlice({
  name: 'sprints',
  initialState: {
    list: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSprintsByProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSprintsByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchSprintsByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(startSprint.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      })
      .addCase(completeSprint.fulfilled, (state, action) => {
        const index = state.list.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
      });
  },
});

export default sprintSlice.reducer;
