import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/axios';

const API_BASE_URL = 'http://localhost:8080';

const getAuthHeader = () => {
  const token = localStorage.getItem('tenantToken');
  return { Authorization: `Bearer ${token}` };
};

// ── Async Thunks ────────────────────────────────────────────────────────────

export const fetchIssuesByProject = createAsyncThunk(
  'issues/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/issues/project/${projectId}`, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const fetchBacklogIssuesPaged = createAsyncThunk(
  'issues/fetchBacklogPaged',
  async ({ projectId, page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/issues/project/${projectId}/paged?page=${page}&size=${size}&sort=createdAt,desc`,
        { headers: getAuthHeader() }
      );
      return response.data.data; // Spring Page object
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch backlog issues');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/create',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/issues`, issueData, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/issues/${id}`, data, {
        headers: getAuthHeader(),
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue');
    }
  }
);

export const deleteIssue = createAsyncThunk('issues/delete', async (id, { rejectWithValue }) => {
  try {
    await axios.delete(`${API_BASE_URL}/issues/${id}`, { headers: getAuthHeader() });
    return id;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to delete issue');
  }
});

export const fetchIssueComments = createAsyncThunk(
  'issues/fetchComments',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/issues/${issueId}/comments`, {
        headers: getAuthHeader(),
      });
      return { issueId, comments: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch comments');
    }
  }
);

export const addComment = createAsyncThunk(
  'issues/addComment',
  async ({ issueId, content }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/issues/${issueId}/comments`,
        { content },
        { headers: getAuthHeader() }
      );
      return { issueId, comment: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

export const fetchIssueAttachments = createAsyncThunk(
  'issues/fetchAttachments',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/issues/${issueId}/attachments`, {
        headers: getAuthHeader(),
      });
      return { issueId, attachments: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch attachments');
    }
  }
);

export const addAttachment = createAsyncThunk(
  'issues/addAttachment',
  async ({ issueId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post(`${API_BASE_URL}/issues/${issueId}/attachments`, formData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'multipart/form-data',
        },
      });
      return { issueId, attachment: response.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload attachment');
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  'issues/deleteAttachment',
  async ({ issueId, attachmentId }, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_BASE_URL}/issues/attachments/${attachmentId}`, {
        headers: getAuthHeader(),
      });
      return { issueId, attachmentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete attachment');
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  issues: [], // all issues for current project
  comments: {}, // { [issueId]: [comments] }
  selectedIssue: null, // issue open in detail panel
  filters: {
    status: 'ALL',
    priority: 'ALL',
  },
  // Backlog pagination
  backlogIssues: [],
  backlogPage: 0,
  backlogTotalPages: 0,
  backlogTotalElements: 0,
  isBacklogLoading: false,
  isLoading: false,
  isCommentLoading: false,
  isAttachmentLoading: false,
  error: null,
};

const issueSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setSelectedIssue: (state, action) => {
      state.selectedIssue = action.payload;
    },
    clearSelectedIssue: (state) => {
      state.selectedIssue = null;
    },
    clearIssues: (state) => {
      state.issues = [];
      state.backlogIssues = [];
      state.backlogPage = 0;
      state.backlogTotalPages = 0;
      state.backlogTotalElements = 0;
      state.comments = {};
      state.selectedIssue = null;
      state.error = null;
    },
    clearIssueError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { status: 'ALL', priority: 'ALL' };
    },
    // Optimistic status update for drag-and-drop feel
    optimisticStatusUpdate: (state, action) => {
      const { id, status } = action.payload;
      const issue = state.issues.find((i) => i.id === id);
      if (issue) issue.status = status;
      if (state.selectedIssue?.id === id) state.selectedIssue.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchIssuesByProject
      .addCase(fetchIssuesByProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIssuesByProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues = action.payload;
      })
      .addCase(fetchIssuesByProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // createIssue
      .addCase(createIssue.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues.push(action.payload);
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // updateIssue
      .addCase(updateIssue.fulfilled, (state, action) => {
        const idx = state.issues.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.issues[idx] = action.payload;
        if (state.selectedIssue?.id === action.payload.id) {
          state.selectedIssue = action.payload;
        }
      })

      // deleteIssue
      .addCase(deleteIssue.fulfilled, (state, action) => {
        state.issues = state.issues.filter((i) => i.id !== action.payload);
        if (state.selectedIssue?.id === action.payload) state.selectedIssue = null;
      })

      // fetchIssueComments
      .addCase(fetchIssueComments.pending, (state) => {
        state.isCommentLoading = true;
      })
      .addCase(fetchIssueComments.fulfilled, (state, action) => {
        state.isCommentLoading = false;
        state.comments[action.payload.issueId] = action.payload.comments;
      })
      .addCase(fetchIssueComments.rejected, (state) => {
        state.isCommentLoading = false;
      })

      // addComment
      .addCase(addComment.fulfilled, (state, action) => {
        const { issueId, comment } = action.payload;
        if (!state.comments[issueId]) state.comments[issueId] = [];
        state.comments[issueId].unshift(comment);
      })

      // Attachments Handling
      .addCase(addAttachment.pending, (state) => {
        state.isAttachmentLoading = true;
      })
      .addCase(addAttachment.fulfilled, (state, action) => {
        state.isAttachmentLoading = false;
        const { issueId, attachment } = action.payload;

        // Update attachments in selectedIssue if it's the one we're editing
        if (state.selectedIssue && state.selectedIssue.id === issueId) {
          if (!state.selectedIssue.attachments) state.selectedIssue.attachments = [];
          state.selectedIssue.attachments.push(attachment);
        }

        // Update in global issues list as well
        const issue = state.issues.find((i) => i.id === issueId);
        if (issue) {
          if (!issue.attachments) issue.attachments = [];
          issue.attachments.push(attachment);
        }
      })
      .addCase(addAttachment.rejected, (state, action) => {
        state.isAttachmentLoading = false;
        state.error = action.payload;
      })
      // Backlog pagination
      .addCase(fetchBacklogIssuesPaged.pending, (state) => {
        state.isBacklogLoading = true;
        state.error = null;
      })
      .addCase(fetchBacklogIssuesPaged.fulfilled, (state, action) => {
        state.isBacklogLoading = false;
        state.backlogIssues = action.payload.content;
        state.backlogPage = action.payload.number;
        state.backlogTotalPages = action.payload.totalPages;
        state.backlogTotalElements = action.payload.totalElements;
      })
      .addCase(fetchBacklogIssuesPaged.rejected, (state, action) => {
        state.isBacklogLoading = false;
        state.error = action.payload;
      })

      .addCase(deleteAttachment.fulfilled, (state, action) => {
        const { issueId, attachmentId } = action.payload;

        if (state.selectedIssue && state.selectedIssue.id === issueId) {
          state.selectedIssue.attachments = state.selectedIssue.attachments.filter(
            (a) => a.id !== attachmentId
          );
        }

        const issue = state.issues.find((i) => i.id === issueId);
        if (issue && issue.attachments) {
          issue.attachments = issue.attachments.filter((a) => a.id !== attachmentId);
        }
      });
  },
});

export const {
  setSelectedIssue,
  clearSelectedIssue,
  clearIssues,
  clearIssueError,
  setFilters,
  clearFilters,
  optimisticStatusUpdate,
} = issueSlice.actions;

export default issueSlice.reducer;
