import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getApiErrorPayload } from '@trackify/shared';
import api from '../../utils/axios';

export const fetchIssuesByProject = createAsyncThunk(
  'issues/fetchByProject',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/project/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch issues'));
    }
  }
);

export const fetchBacklogIssuesPaged = createAsyncThunk(
  'issues/fetchBacklogPaged',
  async ({ projectId, page = 0, size = 20 }, { rejectWithValue }) => {
    try {
      const response = await api.get(
        `/issues/project/${projectId}/paged?page=${page}&size=${size}&sort=createdAt,desc`
      );
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch backlog issues'));
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/create',
  async (issueData, { rejectWithValue }) => {
    try {
      const response = await api.post('/issues', issueData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to create issue'));
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issues/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/issues/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to update issue'));
    }
  }
);

export const deleteIssue = createAsyncThunk('issues/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/issues/${id}`);
    return id;
  } catch (error) {
    return rejectWithValue(getApiErrorPayload(error, 'Failed to delete issue'));
  }
});

export const fetchIssueByKey = createAsyncThunk(
  'issues/fetchByKey',
  async (issueKey, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/key/${encodeURIComponent(issueKey)}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch issue'));
    }
  }
);

export const fetchIssueActivity = createAsyncThunk(
  'issues/fetchActivity',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${issueId}/activity`);
      return { issueId, activity: response.data.data };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch activity'));
    }
  }
);

export const fetchIssueComments = createAsyncThunk(
  'issues/fetchComments',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${issueId}/comments`);
      return { issueId, comments: response.data.data };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch comments'));
    }
  }
);

export const addComment = createAsyncThunk(
  'issues/addComment',
  async ({ issueId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issues/${issueId}/comments`, { content });
      return { issueId, comment: response.data.data };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to add comment'));
    }
  }
);

export const fetchIssueAttachments = createAsyncThunk(
  'issues/fetchAttachments',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issues/${issueId}/attachments`);
      return { issueId, attachments: response.data.data };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to fetch attachments'));
    }
  }
);

export const addAttachment = createAsyncThunk(
  'issues/addAttachment',
  async ({ issueId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post(`/issues/${issueId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return { issueId, attachment: response.data.data };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to upload attachment'));
    }
  }
);

export const deleteAttachment = createAsyncThunk(
  'issues/deleteAttachment',
  async ({ issueId, attachmentId }, { rejectWithValue }) => {
    try {
      await api.delete(`/issues/attachments/${attachmentId}`);
      return { issueId, attachmentId };
    } catch (error) {
      return rejectWithValue(getApiErrorPayload(error, 'Failed to delete attachment'));
    }
  }
);

const initialState = {
  issues: [],
  comments: {},
  activity: {},
  selectedIssue: null,
  isActivityLoading: false,
  filters: {
    status: 'ALL',
    priority: 'ALL',
  },
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
      state.activity = {};
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
    optimisticStatusUpdate: (state, action) => {
      const { id, status } = action.payload;
      const issue = state.issues.find((i) => i.id === id);
      if (issue) issue.status = status;
      if (state.selectedIssue?.id === id) state.selectedIssue.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(updateIssue.fulfilled, (state, action) => {
        const idx = state.issues.findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.issues[idx] = action.payload;
        if (state.selectedIssue?.id === action.payload.id) {
          state.selectedIssue = action.payload;
        }
      })
      .addCase(deleteIssue.fulfilled, (state, action) => {
        state.issues = state.issues.filter((i) => i.id !== action.payload);
        if (state.selectedIssue?.id === action.payload) state.selectedIssue = null;
      })
      .addCase(fetchIssueByKey.fulfilled, (state, action) => {
        state.selectedIssue = action.payload;
      })
      .addCase(fetchIssueActivity.pending, (state) => {
        state.isActivityLoading = true;
      })
      .addCase(fetchIssueActivity.fulfilled, (state, action) => {
        state.isActivityLoading = false;
        state.activity[action.payload.issueId] = action.payload.activity;
      })
      .addCase(fetchIssueActivity.rejected, (state) => {
        state.isActivityLoading = false;
      })
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
      .addCase(addComment.fulfilled, (state, action) => {
        const { issueId, comment } = action.payload;
        if (!state.comments[issueId]) state.comments[issueId] = [];
        state.comments[issueId].unshift(comment);
      })
      .addCase(addAttachment.pending, (state) => {
        state.isAttachmentLoading = true;
      })
      .addCase(addAttachment.fulfilled, (state, action) => {
        state.isAttachmentLoading = false;
        const { issueId, attachment } = action.payload;

        if (state.selectedIssue && state.selectedIssue.id === issueId) {
          if (!state.selectedIssue.attachments) state.selectedIssue.attachments = [];
          state.selectedIssue.attachments.push(attachment);
        }

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
