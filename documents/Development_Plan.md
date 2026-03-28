==========================================
AI-DRIVEN DEVELOPMENT PLAN
(DAY-WISE EXECUTION)
==========================================

GOAL:
Build Multi-Tenant SaaS (Jira-like)
using Spring Boot + React + MySQL

STRATEGY:
- Build in small chunks
- Use AI (Claude/ChatGPT) per task
- Validate each step before moving

--------------------------------------------

WEEK 1: FOUNDATION SETUP
-----------------------

DAY 1: Project Setup
--------------------
TASKS:
- Create Git repo
- Setup backend (Spring Boot)
- Setup frontend (React + Vite)
- Setup MySQL locally

AI PROMPT:
"Create a Spring Boot multi-module project with Maven including API Gateway and Auth service"

--------------------------------------------

DAY 2: Master Database Setup
----------------------------
TASKS:
- Create master DB
- Create tables:
  - tenants
  - user_lookup

AI PROMPT:
"Generate MySQL schema for master database with tenants and user_lookup tables with indexes"

--------------------------------------------

DAY 3: Tenant Creation Flow
---------------------------
TASKS:
- API to create tenant
- Dynamically create new DB
- Insert into master DB

AI PROMPT:
"Spring Boot code to dynamically create MySQL database and store its configuration"

--------------------------------------------

DAY 4: Auth Service - Login Logic
--------------------------------
TASKS:
- Login API
- Fetch tenant from master DB
- Switch datasource
- Validate user

AI PROMPT:
"Spring Boot login API with dynamic datasource routing based on tenant_id"

--------------------------------------------

DAY 5: JWT Implementation
------------------------
TASKS:
- Generate JWT
- Add filter
- Extract tenant_id from token

AI PROMPT:
"Implement JWT authentication filter in Spring Boot with tenant context storage"

--------------------------------------------

--------------------------------------------

WEEK 2: CORE BACKEND FEATURES
-----------------------------

DAY 6: User Management
----------------------
TASKS:
- Register user
- Approval API (Admin)

AI PROMPT:
"Create REST APIs for user registration and admin approval with status PENDING/ACTIVE"

--------------------------------------------

DAY 7: Project APIs
-------------------
TASKS:
- Create project
- List projects

AI PROMPT:
"Spring Boot CRUD APIs for project management with user association"

--------------------------------------------

DAY 8: Issue APIs
-----------------
TASKS:
- Create issue
- Update issue
- Assign issue

AI PROMPT:
"Design issue management APIs with status and assignment logic"

--------------------------------------------

DAY 9: Comments API
-------------------
TASKS:
- Add comments to issues

AI PROMPT:
"Spring Boot API for adding comments to issues with proper relations"

--------------------------------------------

DAY 10: API Gateway
-------------------
TASKS:
- Setup gateway
- Route services

AI PROMPT:
"Configure Spring Cloud Gateway for routing and JWT validation"

--------------------------------------------

--------------------------------------------

WEEK 3: FRONTEND DEVELOPMENT
----------------------------

DAY 11: React Setup
-------------------
TASKS:
- Setup routing
- Setup auth flow

AI PROMPT:
"Create React app with routing and authentication flow using JWT"

--------------------------------------------

DAY 12: Login & Register UI
---------------------------
TASKS:
- Login page
- Register page

AI PROMPT:
"Design React login and register pages with API integration"

--------------------------------------------

DAY 13: Dashboard
-----------------
TASKS:
- Basic dashboard UI

--------------------------------------------

DAY 14: Project UI
------------------
TASKS:
- Project list
- Create project modal

--------------------------------------------

DAY 15: Kanban Board UI
-----------------------
TASKS:
- Columns
- Drag & drop

AI PROMPT:
"Build Kanban board in React using drag-and-drop with API integration"

--------------------------------------------

--------------------------------------------

WEEK 4: ADVANCED FEATURES
-------------------------

DAY 16: Role-Based UI
---------------------
TASKS:
- Admin panel
- Restrict user views

--------------------------------------------

DAY 17: Notifications
---------------------
TASKS:
- Email service integration

--------------------------------------------

DAY 18: Error Handling
----------------------
TASKS:
- Global error handler

--------------------------------------------

DAY 19: Optimization
--------------------
TASKS:
- Pagination
- Loading states

--------------------------------------------

DAY 20: Testing
---------------
TASKS:
- Test APIs
- Test UI flows

--------------------------------------------

--------------------------------------------

WEEK 5: DEPLOYMENT
------------------

DAY 21:
- Dockerize backend & frontend

DAY 22:
- Setup CI/CD

DAY 23:
- Deploy to cloud (AWS/GCP)

--------------------------------------------

BEST PRACTICES
--------------
- Build feature by feature
- Test after every step
- Keep commits small
- Use Postman for API testing

--------------------------------------------

AI USAGE STRATEGY
-----------------
- Give clear prompts
- Mention tech stack
- Ask for production-ready code
- Validate before using

--------------------------------------------

END OF PLAN
==========================================