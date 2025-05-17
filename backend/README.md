# Voting System Backend

A secure and scalable backend for the voting system built with FastAPI, PostgreSQL, and face recognition capabilities.

## Features

- 🔐 JWT-based authentication
- 👤 User management with roles
- 🎥 Face recognition for secure voting
- 📊 Election management
- 🗳️ Secure voting process
- 📝 Audit logging
- 🔒 Role-based access control
- 🐳 Docker support

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- Pydantic
- Face Recognition (face_recognition)
- JWT
- Docker

## Getting Started

### Prerequisites

- Python 3.9+
- PostgreSQL 13+
- Docker (optional)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd voting-system/backend
```

2. Install dependencies using pip 
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/voting_system
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

4. Set up the database
```bash
poetry run alembic upgrade head
```

5. Start the development server
```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Docker Setup

1. Build the Docker image
```bash
docker build -t voting-system-backend .
```

2. Run the container
```bash
docker run -p 8000:8000 voting-system-backend
```

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── app/
│   ├── api/v1/endpoints     # API routes
│   ├── core/                # Core functionality
│   ├── db/                  # Database models and migrations
│   ├── services/            # Business logic
│   ├── schemas/             # Pydantic models
│   ├── utils/               # Utility functions
│   └── main.py              # Application entry point
├── main.py/                 # Main application file 
├── alembic/                 # Database migrations
└── pyproject.toml           # Project dependencies
```

## Available Scripts

- `uvicorn app.main:app --reload` - Start development server

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
