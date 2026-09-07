# Amplizo - AI-Powered Live Chat Platform

<div align="center">

![Amplizo Banner](https://img.shields.io/badge/Amplizo-AI%20Chat%20Platform-4f46e5?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBkPSJNMTMgMkwzIDE0aDZsLTEgOCA5LTEyaC02bDEtOHoiLz48L3N2Zz4=)

**Independent AI-Powered Customer Engagement Platform**

[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-ea2845?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2d3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

[Live Demo](https://amplizo.ai) · [Documentation](https://docs.amplizo.ai) · [Report Bug](https://github.com/amplizo/amplizo/issues)

</div>

---

## Overview

Amplizo is an **independent AI-powered live chat platform** designed for modern businesses. No WhatsApp. No Telegram. Pure independent communication with AI agents, real-time analytics, and multi-branch support.

## Features

### For Businesses (Client Dashboard)
- **AI Employees** - 6 specialized AI agents for different tasks
- **AI Customer Brain** - Intelligent customer insights
- **AI Decision Engine** - Automated decision making
- **AI Predictions** - Predictive analytics for customer behavior
- **WhatsApp Automation** - Automated WhatsApp messaging
- **Live Chats** - Real-time customer support
- **Smart CRM** - Customer relationship management
- **Lead Management** - AI-powered lead categorization
- **Sales Dashboard** - Real-time sales analytics
- **Inventory Management** - Stock tracking
- **Billing & Invoices** - Automated billing
- **Loyalty & Rewards** - Customer loyalty programs
- **Review Manager** - Customer review management
- **Multi-Branch Support** - Manage multiple locations
- **Integrations** - 12+ third-party integrations

### For Administrators
- **Client Management** - Full CRUD operations
- **Subscription Management** - Plan management
- **Agent Management** - Monitor AI and human agents
- **Real-time Analytics** - Live dashboard with metrics
- **Revenue Tracking** - Monthly revenue monitoring

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS 3
- **State Management:** Zustand
- **UI Components:** Radix UI, Lucide Icons
- **Real-time:** Socket.io Client

### Backend
- **Framework:** NestJS 10
- **Database:** PostgreSQL (Prisma ORM)
- **Authentication:** JWT, OAuth (Google, Facebook)
- **Real-time:** WebSocket (Socket.io)
- **Queue:** Bull (Redis - optional)

## Project Structure

```
amplizo/
├── frontend/               # Next.js frontend application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and API clients
│   │   └── store/         # Zustand state management
│   ├── public/            # Static assets
│   └── package.json
│
├── backend/               # NestJS backend application
│   ├── src/
│   │   ├── admin/         # Admin module
│   │   ├── auth/          # Authentication module
│   │   ├── chat/          # Chat module
│   │   ├── common/        # Shared services
│   │   ├── prisma/        # Database service
│   │   ├── upload/        # File upload module
│   │   ├── visitor/       # Visitor tracking
│   │   └── websocket/     # WebSocket gateway
│   ├── prisma/            # Database schema and migrations
│   └── package.json
│
├── docker-compose.yml     # Docker orchestration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amplizo/amplizo.git
   cd amplizo
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Setup database**
   ```bash
   # Ensure PostgreSQL is running and create the database:
   # psql -U postgres -c "CREATE DATABASE amplizo;"
   
   # Run migrations
   npx prisma migrate dev
   npm run seed
   ```

5. **Start backend server**
   ```bash
   npm run start:dev
   ```

6. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

7. **Setup frontend environment**
   ```bash
   cp .env.example .env.local
   ```

8. **Start frontend development server**
   ```bash
   npm run dev
   ```

### Default Credentials

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@amplizo.com   | admin123  |
| Client  | sarah@amplizo.com   | agent123  |

## Environment Variables

### Backend (.env)
```env
# Database (PostgreSQL required for production)
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# For local development with SQLite (optional):
# DATABASE_URL="file:./dev.db"
# Note: You must also change provider = "sqlite" in prisma/schema.prisma
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL="http://localhost:4000/api"
NEXT_PUBLIC_SOCKET_URL="ws://localhost:4000"
```

## API Documentation

API documentation is available at `/api/docs` when running the backend server.

### Key Endpoints

| Method | Endpoint                    | Description           |
|--------|-----------------------------|-----------------------|
| POST   | /api/auth/login             | User login            |
| POST   | /api/auth/google            | Google OAuth          |
| POST   | /api/auth/facebook          | Facebook OAuth        |
| GET    | /api/admin/stats            | Admin dashboard stats |
| GET    | /api/chats                  | Get all chats         |
| POST   | /api/chats                  | Create new chat       |

## Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@amplizo.ai or join our Discord community.

---

<div align="center">

Made with by [Amplizo Team](https://github.com/amplizo)

</div>
