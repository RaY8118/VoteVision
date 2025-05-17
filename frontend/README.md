# Voting System Frontend

A modern, secure frontend for the voting system built with React, TypeScript, and Tailwind CSS.

## Features

- 🔐 Secure authentication with JWT
- 📱 Responsive design for all devices
- 🎥 Face recognition for secure voting
- 🎨 Modern UI with Tailwind CSS
- 🔄 Real-time updates
- 📊 Interactive voting interface
- 🛡️ Protected routes and role-based access

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI Components
- React Router
- Axios
- React Query
- React Hot Toast

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn or bun
- Backend server running (see backend README)

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd voting-system/frontend
```

2. Install dependencies
```bash
bun install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

4. Start the development server
```bash
bun run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── contexts/      # Context providers
│   ├── services/      # API services
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── route/         # Routing configuration
│   └── App.tsx        # Root component
├── public/            # Static assets
└── App.css            # Global styles
└── index.html         # Entry HTML file
```

## Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run ESLint
- `bun run type-check` - Run TypeScript type checking

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
