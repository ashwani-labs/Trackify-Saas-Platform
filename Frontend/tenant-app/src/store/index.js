import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import userReducer from '../features/users/userSlice';
import projectReducer from '../features/projects/projectSlice';
import issueReducer from '../features/issues/issueSlice';
import sprintReducer from '../features/sprints/sprintSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: userReducer,
    projects: projectReducer,
    issues: issueReducer,
    sprints: sprintReducer,
  },
});
