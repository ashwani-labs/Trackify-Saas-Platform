# DOCUMENT 1: PRODUCT REQUIREMENT DOCUMENT (PRD) — ULTRA DETAILED

## 1. Product Overview

A multi-tenant SaaS platform for project and issue tracking (Jira-like). Supports Master (platform), Admin (tenant), and User roles. Each tenant has an isolated database. The system is designed for scalability, security, and extensibility using microservices.

## 2. Goals & Success Metrics

* Fast onboarding of tenants (< 5 mins)
* Secure tenant isolation (0 data leakage)
* Handle 10k+ users per tenant
* API latency < 200ms (p95 for core APIs)
* Uptime 99.9%

## 3. Personas

* Master: Platform owner
* Admin: Team lead / manager in a company
* User: Developer / team member

## 4. High-Level User Journeys

### 4.1 Tenant Onboarding (Master)

1. Master logs into Master App
2. Creates tenant (name, domain, plan)
3. System provisions DB + stores connection in master DB
4. Admin user created
5. Email sent with activation link

### 4.2 Admin Activation

1. Admin clicks email link
2. Sets password
3. Logs into tenant app

### 4.3 User Registration & Approval

1. User signs up (tenant app)
2. Status = PENDING
3. Admin receives notification
4. Admin approves/rejects
5. User becomes ACTIVE and can login

### 4.4 Project & Issue Flow

1. Admin creates project
2. Admin/User creates issues
3. Assign issues to users
4. Move issues across statuses (Kanban)
5. Add comments/attachments

## 5. Functional Requirements

### 5.1 Authentication & Authorization

* JWT-based authentication
* Refresh tokens (optional)
* Role-based access (MASTER, ADMIN, USER)
* Password reset via email

### 5.2 Tenant Management (Master App)

* Create tenant
* Update tenant
* Deactivate tenant
* View tenant usage (future)

### 5.3 User Management (Tenant App)

* Register user
* Approve/reject user
* Assign roles
* Deactivate user

### 5.4 Project Management

* Create/update/delete project
* Assign users to project
* Project visibility control

### 5.5 Issue Management

* Create issue
* Update issue
* Delete issue (soft delete)
* Fields: title, description, status, priority, assignee
* Status workflow: TODO → IN_PROGRESS → DONE

### 5.6 Kanban Board

* Drag & drop issues
* Column-based status view
* Real-time updates (future via WebSocket)

### 5.7 Comments & Attachments

* Add comments to issues
* Upload attachments (S3-like storage later)

### 5.8 Notifications

* Email notifications:

  * User approval
  * Task assignment
* In-app notifications (future)

## 6. Non-Functional Requirements

### 6.1 Scalability

* Microservices architecture
* Horizontal scaling supported
* Stateless services

### 6.2 Security

* JWT validation on every request
* Tenant isolation via DB-per-tenant
* No sensitive data in master DB

### 6.3 Performance

* Index critical fields (user_id, project_id)
* Pagination for all list APIs
* Caching layer (Redis future)

### 6.4 Reliability

* Retry for async jobs
* Circuit breakers (future)

### 6.5 Observability

* Centralized logging
* Metrics (Prometheus)
* Tracing (future)

## 7. API Requirements (Sample)

### Auth

POST /auth/login
Request:
{
"email": "",
"password": ""
}
Response:
{
"token": "",
"tenant_id": "",
"role": ""
}

### Project

POST /projects
GET /projects

### Issues

POST /issues
PUT /issues/{id}
GET /issues?projectId=

## 8. Edge Cases

* Duplicate email across tenants
* Admin deletes project with issues
* Concurrent updates on same issue
* Tenant DB unavailable

## 9. UI/UX Guidelines

* Clean dashboard
* Kanban board with drag-drop
* Role-based UI visibility
* Responsive design

## 10. Future Enhancements

* Sprint management
* Analytics dashboard
* AI suggestions
* Integration (Slack, GitHub)

## 11. Constraints

* MySQL for DB
* Spring Boot backend
* React frontend

## 12. Development Strategy

* Phase 1: Auth + Tenant
* Phase 2: Project + Issue
* Phase 3: Board + Notifications
* Phase 4: Scaling + Optimization
