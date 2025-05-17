# VoteVision

A modern, secure, and scalable electronic voting system with face recognition capabilities. VoteVision combines a robust backend with a beautiful frontend to provide a seamless and secure voting experience.

## 🌟 Features

- 🔐 Secure JWT-based authentication
- 👤 Comprehensive user management with role-based access
- 🎥 Advanced face recognition for secure voter verification
- 📊 Complete election management system
- 🗳️ Secure and transparent voting process
- 📝 Detailed audit logging
- 📱 Responsive design for all devices
- 🎨 Modern and intuitive user interface
- 🔄 Real-time updates and notifications

## 🏗️ Architecture

VoteVision is built using a modern tech stack with separate frontend and backend services:

### Backend
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy
- Alembic
- Face Recognition
- JWT Authentication

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Query
- React Router

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 13+
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd votevision
```

2. Set up the backend
```bash
cd backend
poetry install
# Create .env file with required configurations
poetry run alembic upgrade head
poetry run uvicorn app.main:app --reload
```

3. Set up the frontend
```bash
cd frontend
bun install
# Create .env file with required configurations
bun run dev
```

4. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📁 Project Structure

```
votevision/
├── backend/           # FastAPI backend service
│   ├── app/
│   ├── alembic/
│   └── pyproject.toml
├── frontend/         # React frontend application
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## 🛠️ Development

### Backend Development
- API documentation available at `/docs` (Swagger UI)
- Database migrations managed with Alembic
- Poetry for dependency management

### Frontend Development
- Hot reload enabled for development
- TypeScript for type safety
- ESLint for code quality
- Tailwind CSS for styling

## 🔒 Security Features

- JWT-based authentication
- Face recognition for voter verification
- Role-based access control
- Secure password hashing
- Audit logging for all actions
- Protected API endpoints

## 🐳 Docker Support

Both frontend and backend services can be containerized using Docker:

```bash
# Build and run backend
cd backend
docker build -t votevision-backend .
docker run -p 8000:8000 votevision-backend

# Build and run frontend
cd frontend
docker build -t votevision-frontend .
docker run -p 5173:5173 votevision-frontend
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers. 