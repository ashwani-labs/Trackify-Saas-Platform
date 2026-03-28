==========================================
PROJECT STRUCTURE (MONOREPO)
==========================================

saas-jira-app/
│
├── backend/
│   │
│   ├── api-gateway/
│   │   └── src/
│   │
│   ├── auth-service/
│   │   └── src/
│   │
│   ├── tenant-service/
│   │   └── src/
│   │
│   ├── project-service/
│   │   └── src/
│   │
│   ├── notification-service/
│   │   └── src/
│   │
│   ├── common-lib/              (VERY IMPORTANT)
│   │   ├── security/
│   │   ├── utils/
│   │   ├── dto/
│   │   └── config/
│   │
│   └── pom.xml                  (parent pom)
│
├── frontend/
│   │
│   ├── web-app/                 (main React app)
│   │   ├── src/
│   │   └── package.json
│   │
│   └── admin-app/ (optional later)
│
├── database/
│   ├── master-db.sql
│   ├── tenant-schema.sql
│   └── migrations/
│
├── devops/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   └── Dockerfiles
│   │
│   ├── nginx/
│   └── k8s/ (future)
│
├── docs/                        (your documents)
│   ├── PRD.md
│   ├── DB.md
│   ├── APIs.md
│   └── Architecture.md
│
├── .env
├── README.md
└── .gitignore

==========================================