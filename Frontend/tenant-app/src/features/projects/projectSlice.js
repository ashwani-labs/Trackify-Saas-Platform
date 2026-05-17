import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/axios';

export const fetchProjects = createAsyncThunk(
  'projects/fetchAll',
  async ({ page = 0, size = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects?page=${page}&size=${size}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project details');
    }
  }
);

export const fetchProjectStats = createAsyncThunk(
  'projects/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/projects/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'projects/fetchMembers',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/projects/${projectId}/members`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'projects/addMember',
  async ({ projectId, memberData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/projects/${projectId}/members`, memberData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'projects/removeMember',
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove member');
    }
  }
);

const initialState = {
  projects: [],
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  currentProject: null,
  members: [],
  stats: null,
  statsLoading: false,
  isLoading: false,
  memberLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearProjectError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload.content !== undefined) {
          state.projects = action.payload.content;
          state.currentPage = action.payload.number;
          state.totalPages = action.payload.totalPages;
          state.totalElements = action.payload.totalElements;
        } else {
          state.projects = action.payload || [];
        }
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchProjectStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchProjectStats.rejected, (state) => {
        state.statsLoading = false;
      })
      .addCase(fetchProjectMembers.pending, (state) => {
        state.memberLoading = true;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.memberLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchProjectMembers.rejected, (state) => {
        state.memberLoading = false;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.members = state.members.filter((m) => m.userId !== action.payload);
      });
  },
});

export const { clearProjectError, clearCurrentProject } = projectSlice.actions;
export default projectSlice.reducer;
