==========================================
FRONTEND ARCHITECTURE DOCUMENT
==========================================

1. OVERVIEW
-----------
Framework: React.js
Build Tool: Vite (recommended)
State Management: Zustand (or Redux Toolkit)
Routing: React Router
UI Library: Tailwind CSS (recommended)

Architecture Type: Single Page Application (SPA)

--------------------------------------------

2. APPLICATION STRUCTURE
------------------------

src/
 ├── app/
 │   ├── store/
 │   ├── router/
 │   └── providers/
 │
 ├── features/
 │   ├── auth/
 │   ├── users/
 │   ├── projects/
 │   ├── issues/
 │   ├── comments/
 │   └── admin/
 │
 ├── components/
 │   ├── common/
 │   ├── layout/
 │   └── ui/
 │
 ├── services/
 │   ├── api/
 │   └── hooks/
 │
 ├── utils/
 ├── constants/
 └── assets/

--------------------------------------------

3. ROUTING STRUCTURE
--------------------

PUBLIC ROUTES:
- /login
- /register

PROTECTED ROUTES:
- /dashboard
- /projects
- /projects/:id
- /issues
- /admin/users

ROLE BASED ROUTES:
- ADMIN → /admin/*
- USER → limited access

--------------------------------------------

4. AUTHENTICATION FLOW
----------------------

1. User logs in
2. API returns JWT
3. Store token in:
   - localStorage (simple)
   - or httpOnly cookie (secure)

4. Add token to all API requests

5. On app load:
   - Validate token
   - Redirect accordingly

--------------------------------------------

5. STATE MANAGEMENT
-------------------

GLOBAL STATE:
- auth (user, role, token)
- tenant context
- UI state (loading, theme)

FEATURE STATE:
- projects
- issues
- users

TOOLS:
- Zustand (simple & scalable)

--------------------------------------------

6. API LAYER DESIGN
-------------------

services/api/

- authApi.js
- userApi.js
- projectApi.js
- issueApi.js

USING:
- Axios instance

INTERCEPTORS:
- Add JWT to headers
- Handle 401 errors

--------------------------------------------

7. UI COMPONENT ARCHITECTURE
----------------------------

COMPONENT TYPES:

1. Layout Components
- Sidebar
- Navbar
- Footer

2. Feature Components
- ProjectCard
- IssueCard
- UserList

3. UI Components
- Button
- Input
- Modal
- Dropdown

--------------------------------------------

8. KEY SCREENS
--------------

1. LOGIN PAGE
- Email/password
- Error handling

2. DASHBOARD
- Overview
- Recent projects

3. PROJECT PAGE
- Project list
- Create project modal

4. ISSUE BOARD (KANBAN)
- Columns:
  - TODO
  - IN_PROGRESS
  - DONE

- Drag & Drop support

5. ADMIN PANEL
- User approval
- User list

--------------------------------------------

9. KANBAN BOARD DESIGN
----------------------

LIBRARY:
- react-beautiful-dnd (or dnd-kit)

FLOW:
1. Fetch issues grouped by status
2. Render columns
3. Drag issue → update status
4. Call API → persist change

--------------------------------------------

10. ROLE-BASED UI
-----------------

ADMIN:
- Full access
- See admin panel

USER:
- Limited access
- Only assigned projects/tasks

--------------------------------------------

11. ERROR HANDLING
------------------

- Global error handler
- Toast notifications

EXAMPLES:
- Login failed
- API error
- Network error

--------------------------------------------

12. LOADING & UX
----------------

- Skeleton loaders
- Spinners for API calls
- Optimistic UI updates

--------------------------------------------

13. SECURITY
------------

- Never store sensitive data in frontend
- Validate role before rendering UI
- Token expiration handling

--------------------------------------------

14. PERFORMANCE OPTIMIZATION
----------------------------

- Lazy loading routes
- Code splitting
- Memoization (React.memo)

--------------------------------------------

15. FOLDER EXAMPLE (FEATURE)
----------------------------

features/issues/

- IssueList.jsx
- IssueCard.jsx
- IssueForm.jsx
- issueSlice.js (if Redux)
- issueApi.js

--------------------------------------------

16. ENVIRONMENT CONFIG
----------------------

.env
VITE_API_BASE_URL=http://localhost:8080/api/v1

--------------------------------------------

17. FUTURE ENHANCEMENTS
-----------------------

- WebSocket (real-time board)
- Dark mode
- Mobile responsiveness
- Micro-frontend (advanced)

--------------------------------------------

END OF DOCUMENT
==========================================