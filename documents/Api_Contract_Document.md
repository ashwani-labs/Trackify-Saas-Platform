==========================================
API CONTRACT DOCUMENT
(ULTRA DETAILED)
==========================================

BASE URL:
---------
/api/v1

AUTH:
-----
Authorization: Bearer <JWT_TOKEN>

HEADERS:
--------
Content-Type: application/json
X-Tenant-ID (optional, derived from JWT internally)

STANDARD RESPONSE FORMAT:
--------------------------
{
  "status": "SUCCESS | ERROR",
  "message": "string",
  "data": {},
  "timestamp": "ISO_DATE"
}

--------------------------------------------

1. AUTH APIs
------------

1.1 LOGIN
POST /auth/login

REQUEST:
{
  "email": "user@example.com",
  "password": "password123"
}

RESPONSE:
{
  "status": "SUCCESS",
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user_id": 1,
    "tenant_id": "tenant_1",
    "role": "ADMIN"
  }
}

ERRORS:
- INVALID_CREDENTIALS
- USER_NOT_FOUND

--------------------------------------------

1.2 LOGOUT
POST /auth/logout

RESPONSE:
{
  "status": "SUCCESS",
  "message": "Logged out"
}

--------------------------------------------

2. TENANT APIs (MASTER ONLY)
----------------------------

2.1 CREATE TENANT
POST /tenants

REQUEST:
{
  "name": "ABC Company",
  "code": "abc",
  "admin_email": "admin@abc.com"
}

RESPONSE:
{
  "status": "SUCCESS",
  "message": "Tenant created",
  "data": {
    "tenant_id": 101
  }
}

--------------------------------------------

3. USER APIs
------------

3.1 REGISTER USER
POST /users/register

REQUEST:
{
  "email": "user@abc.com",
  "password": "password123",
  "name": "John Doe"
}

RESPONSE:
{
  "status": "SUCCESS",
  "message": "Registration pending approval"
}

--------------------------------------------

3.2 APPROVE USER (ADMIN)
POST /users/{id}/approve

RESPONSE:
{
  "status": "SUCCESS",
  "message": "User approved"
}

--------------------------------------------

3.3 GET USERS
GET /users

RESPONSE:
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 1,
      "email": "user@abc.com",
      "role": "USER",
      "status": "ACTIVE"
    }
  ]
}

--------------------------------------------

4. PROJECT APIs
---------------

4.1 CREATE PROJECT
POST /projects

REQUEST:
{
  "name": "Project Alpha",
  "description": "Sample project"
}

RESPONSE:
{
  "status": "SUCCESS",
  "data": {
    "project_id": 10
  }
}

--------------------------------------------

4.2 GET PROJECTS
GET /projects

RESPONSE:
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 10,
      "name": "Project Alpha"
    }
  ]
}

--------------------------------------------

5. ISSUE APIs
-------------

5.1 CREATE ISSUE
POST /issues

REQUEST:
{
  "project_id": 10,
  "title": "Fix bug",
  "description": "Fix login issue",
  "priority": "HIGH",
  "assigned_to": 2
}

RESPONSE:
{
  "status": "SUCCESS",
  "data": {
    "issue_id": 100
  }
}

--------------------------------------------

5.2 UPDATE ISSUE
PUT /issues/{id}

REQUEST:
{
  "status": "IN_PROGRESS"
}

RESPONSE:
{
  "status": "SUCCESS",
  "message": "Issue updated"
}

--------------------------------------------

5.3 GET ISSUES
GET /issues?projectId=10

RESPONSE:
{
  "status": "SUCCESS",
  "data": [
    {
      "id": 100,
      "title": "Fix bug",
      "status": "TODO"
    }
  ]
}

--------------------------------------------

6. COMMENTS APIs
----------------

6.1 ADD COMMENT
POST /comments

REQUEST:
{
  "issue_id": 100,
  "message": "Working on this"
}

RESPONSE:
{
  "status": "SUCCESS",
  "message": "Comment added"
}

--------------------------------------------

7. ERROR CODES
--------------

AUTH_ERRORS:
- INVALID_TOKEN
- TOKEN_EXPIRED

USER_ERRORS:
- USER_NOT_FOUND
- USER_NOT_APPROVED

PROJECT_ERRORS:
- PROJECT_NOT_FOUND

ISSUE_ERRORS:
- ISSUE_NOT_FOUND

--------------------------------------------

8. PAGINATION FORMAT
--------------------

GET /issues?page=1&size=10

RESPONSE:
{
  "status": "SUCCESS",
  "data": {
    "content": [],
    "page": 1,
    "size": 10,
    "total_elements": 100
  }
}

--------------------------------------------

9. SECURITY RULES
-----------------

- JWT required for all APIs (except login/register)
- Role-based access enforced
- Tenant isolation via backend only

--------------------------------------------

END OF DOCUMENT
==========================================