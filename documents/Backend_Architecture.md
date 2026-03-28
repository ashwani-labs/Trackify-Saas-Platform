==========================================
BACKEND ARCHITECTURE DOCUMENT
(ULTRA DETAILED)
==========================================

1. OVERVIEW
-----------
Architecture: Microservices-based
Language: Java
Framework: Spring Boot
Communication: REST APIs (initial), Async via Queue (later)
Gateway: API Gateway (Spring Cloud Gateway)

--------------------------------------------

2. MICROSERVICES LIST
---------------------

1. API GATEWAY
2. AUTH SERVICE
3. TENANT SERVICE
4. PROJECT SERVICE
5. NOTIFICATION SERVICE

--------------------------------------------

3. API GATEWAY
--------------

RESPONSIBILITIES:
- Single entry point
- Route requests to services
- JWT validation
- Extract tenant_id
- Forward request with headers

FLOW:
Client → Gateway → Service

HEADERS FORWARDED:
- Authorization (JWT)
- X-Tenant-ID
- X-User-ID
- X-User-Role

--------------------------------------------

4. AUTH SERVICE
---------------

RESPONSIBILITIES:
- Login / Logout
- JWT generation
- Password hashing (BCrypt)
- Token validation

LOGIN FLOW:
1. Receive email + password
2. Query Master DB → get tenant_id
3. Switch to tenant DB
4. Validate password
5. Generate JWT

JWT PAYLOAD:
{
  user_id,
  tenant_id,
  role
}

--------------------------------------------

5. TENANT SERVICE
-----------------

RESPONSIBILITIES:
- Create tenant
- Store DB configuration
- Create tenant database dynamically
- Create admin user
- Insert into user_lookup (master DB)

FLOW:
Master → Tenant Service → DB created → Admin created

--------------------------------------------

6. PROJECT SERVICE
------------------

RESPONSIBILITIES:
- Manage Projects
- Manage Issues (core logic)
- Manage Comments
- Manage Board state

FEATURES:
- Create Project
- Assign Users
- Create Issue
- Update Issue Status
- Add Comments

KANBAN FLOW:
TODO → IN_PROGRESS → DONE

--------------------------------------------

7. NOTIFICATION SERVICE
-----------------------

RESPONSIBILITIES:
- Send emails
- Handle async notifications

TRIGGERS:
- User approval
- Task assignment
- Password reset

TECH:
- Queue (RabbitMQ / Kafka)
- Email service (SMTP)

--------------------------------------------

8. DATABASE ROUTING
-------------------

KEY CONCEPT:
Dynamic DataSource Routing

FLOW:
1. Request arrives
2. JWT extracted
3. tenant_id read
4. DataSource switched

IMPLEMENTATION:
- ThreadLocal context
- AbstractRoutingDataSource (Spring)

--------------------------------------------

9. SECURITY ARCHITECTURE
------------------------

AUTHENTICATION:
- JWT-based

AUTHORIZATION:
- Role-based (ADMIN / USER)

SECURITY RULES:
- Every request must have valid JWT
- Tenant isolation enforced in backend
- No DB info from frontend

--------------------------------------------

10. INTER-SERVICE COMMUNICATION
------------------------------

SYNCHRONOUS:
- REST APIs (Feign Client)

ASYNC:
- Message Queue (Kafka/RabbitMQ)

USE CASES:
- Notifications
- Activity logs

--------------------------------------------

11. ERROR HANDLING
------------------

- Global Exception Handler
- Standard API response format:

{
  status,
  message,
  data
}

--------------------------------------------

12. LOGGING & MONITORING
------------------------

LOGGING:
- Logback / ELK Stack

METRICS:
- Prometheus

TRACING (future):
- Zipkin

--------------------------------------------

13. SCALING STRATEGY
--------------------

PHASE 1:
- Monolith deployment

PHASE 2:
- Split into microservices

PHASE 3:
- Kubernetes deployment
- Auto-scaling

--------------------------------------------

14. DEVOPS SETUP
----------------

- Docker for containerization
- CI/CD (GitHub Actions)
- Nginx (reverse proxy)

--------------------------------------------

15. FUTURE ENHANCEMENTS
-----------------------

- WebSocket (real-time updates)
- Rate limiting
- API versioning
- Circuit breaker (Resilience4j)

--------------------------------------------

END OF DOCUMENT
==========================================