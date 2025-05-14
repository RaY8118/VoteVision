# 📚 Voting System Frontend Guide (React + Vite + TailwindCSS + React Query)

This is a modern frontend setup for the **Online Voting System** using:
- ⚛️ React.js (with Vite for fast bundling)
- 🎨 TailwindCSS for utility-first styling
- 💅 Shadcn/UI (Radix-based headless UI components)
- 🔗 React Router for routing
- 🔄 React Query for state management and API caching
- 🔧 Axios as a service layer for API calls

---

## 🔥 Project Structure Overview

src/
├── components/ # Reusable UI components (buttons, cards, inputs)
├── pages/ # Route-specific pages (Login, Register, Vote, Status)
├── services/ # API service layer (axios instance, authService, voteService)
├── routes/ # Routing setup (using React Router)
├── utils/ # Optional utility/helper functions
└── App.tsx # Root component with layout

🗳️ Project Overview: Online Voting System (with Face Recognition and Secure Authentication)
This project is a Secure Online Voting System designed to ensure transparent and verifiable voting processes with strict user identity verification mechanisms. The system allows users to register and login using either traditional email-password authentication or face recognition. Before voting, users are required to verify their identity again via face recognition for an added layer of security. The application prevents multiple votes, ensures that only eligible voters can participate, and provides a simple interface to view voting status and results. The backend is built using FastAPI, PostgreSQL, while the frontend is developed using React.js, TailwindCSS, Shadcn/UI, React Query, and Axios, following modern web development best practices. This project aims to provide a real-world simulation of secure voting workflows integrated with face recognition and API-driven architecture.
