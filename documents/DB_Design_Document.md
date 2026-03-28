==============================
DATABASE DESIGN DOCUMENT
(ULTRA DETAILED)
==============================

1. OVERVIEW
-----------
Architecture: Multi-Tenant (Database per Tenant)
Master DB → Routing & Tenant Mapping
Tenant DB → Actual Application Data
Database: MySQL 8+
Charset: utf8mb4

--------------------------------------------

2. MASTER DATABASE
------------------

TABLE: tenants
--------------
id              BIGINT PK AUTO_INCREMENT
name            VARCHAR(150) NOT NULL
code            VARCHAR(100) UNIQUE NOT NULL
db_name         VARCHAR(150) NOT NULL
db_host         VARCHAR(150) NOT NULL
db_port         INT DEFAULT 3306
db_username     VARCHAR(150) NOT NULL
db_password     VARCHAR(255) NOT NULL (encrypted)
status          ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE'
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEXES:
- UNIQUE(code)
- INDEX(status)

--------------------------------------------

TABLE: user_lookup
------------------
id              BIGINT PK AUTO_INCREMENT
email           VARCHAR(255) NOT NULL
tenant_id       BIGINT NOT NULL
created_at      TIMESTAMP

INDEXES:
- INDEX(email)
- UNIQUE(email, tenant_id)

NOTES:
- Used ONLY for login routing
- No password stored here
- Same email allowed across tenants

--------------------------------------------

3. TENANT DATABASE (PER TENANT)
------------------------------

TABLE: users
------------
id              BIGINT PK AUTO_INCREMENT
email           VARCHAR(255) UNIQUE NOT NULL
password        VARCHAR(255) NOT NULL
name            VARCHAR(150)
role            ENUM('ADMIN','USER') NOT NULL
status          ENUM('PENDING','ACTIVE','DISABLED') DEFAULT 'PENDING'
last_login_at   TIMESTAMP NULL
created_at      TIMESTAMP
updated_at      TIMESTAMP
is_deleted      BOOLEAN DEFAULT FALSE

INDEXES:
- UNIQUE(email)
- INDEX(role)
- INDEX(status)

--------------------------------------------

TABLE: projects
---------------
id              BIGINT PK AUTO_INCREMENT
name            VARCHAR(200) NOT NULL
description     TEXT
created_by      BIGINT (FK → users.id)
is_archived     BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP
updated_at      TIMESTAMP

INDEXES:
- INDEX(created_by)
- INDEX(is_archived)

--------------------------------------------

TABLE: project_members
----------------------
id              BIGINT PK AUTO_INCREMENT
project_id      BIGINT (FK → projects.id)
user_id         BIGINT (FK → users.id)
role            ENUM('OWNER','MEMBER') DEFAULT 'MEMBER'
created_at      TIMESTAMP

CONSTRAINTS:
- UNIQUE(project_id, user_id)

INDEXES:
- INDEX(user_id)

--------------------------------------------

TABLE: issues
-------------
id              BIGINT PK AUTO_INCREMENT
project_id      BIGINT (FK → projects.id)
title           VARCHAR(255) NOT NULL
description     TEXT
status          ENUM('TODO','IN_PROGRESS','DONE') DEFAULT 'TODO'
priority        ENUM('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM'
assigned_to     BIGINT (FK → users.id)
created_by      BIGINT (FK → users.id)
due_date        DATE NULL
version         INT DEFAULT 0   (Optimistic Locking)
created_at      TIMESTAMP
updated_at      TIMESTAMP
is_deleted      BOOLEAN DEFAULT FALSE

INDEXES:
- INDEX(project_id, status)
- INDEX(assigned_to)
- INDEX(priority)

--------------------------------------------

TABLE: comments
---------------
id              BIGINT PK AUTO_INCREMENT
issue_id        BIGINT (FK → issues.id)
user_id         BIGINT (FK → users.id)
message         TEXT NOT NULL
created_at      TIMESTAMP
is_deleted      BOOLEAN DEFAULT FALSE

INDEXES:
- INDEX(issue_id)

--------------------------------------------

TABLE: attachments
------------------
id              BIGINT PK AUTO_INCREMENT
issue_id        BIGINT (FK → issues.id)
file_name       VARCHAR(255)
file_url        VARCHAR(500)
uploaded_by     BIGINT (FK → users.id)
created_at      TIMESTAMP

INDEXES:
- INDEX(issue_id)

--------------------------------------------

TABLE: activity_logs
--------------------
id              BIGINT PK AUTO_INCREMENT
entity_type     VARCHAR(50)
entity_id       BIGINT
action          VARCHAR(50)
performed_by    BIGINT
metadata        JSON
created_at      TIMESTAMP

INDEXES:
- INDEX(entity_type, entity_id)

--------------------------------------------

4. RELATIONSHIPS
----------------
users ↔ projects (via project_members)
projects → issues
issues → comments
issues → attachments

--------------------------------------------

5. PERFORMANCE DESIGN
---------------------
- Index all foreign keys
- Composite index (project_id, status) for Kanban
- Use pagination for all list APIs
- Avoid SELECT *
- Use lazy loading where possible

--------------------------------------------

6. SECURITY DESIGN
------------------
- Password ONLY in tenant DB
- Master DB contains NO sensitive data
- Backend enforces tenant isolation
- Never trust frontend for tenant selection

--------------------------------------------

7. RUNTIME FLOW
---------------
LOGIN:
1. Query Master DB → get tenant_id
2. Switch datasource → tenant DB
3. Validate user credentials
4. Generate JWT (tenant_id + role)

POST LOGIN:
- Use JWT for tenant routing
- All queries go to tenant DB

--------------------------------------------

8. FUTURE SCALING
-----------------
- DB sharding for tenants
- Read replicas
- Redis caching
- Elasticsearch for search̥
- Archive old data

--------------------------------------------

END OF DOCUMENT
==============================̥