# Real-Time Multiplayer Lobby System (Multi-Tenant)

## Overview

This project is a **real-time, event-driven, multi-tenant system** inspired by multiplayer game lobbies and matchmaking platforms.

## Getting Started

### Prerequisites

- [.NET SDK](https://dotnet.microsoft.com/download) (.NET SDK 10)
- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/) (package manager)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

### Running the Project

Run both the backend API and frontend client concurrently:

```bash
pnpm dev
```

This will start:

- **Backend API** (ASP.NET Core) - `http://localhost:5046`
- **Frontend Client** (React + Vite) - `http://localhost:5173`

The backend uses `dotnet watch` for hot-reload, and the frontend uses Vite's dev server for hot module replacement.

### API Documentation

Once the backend is running, you can access:

- **Scalar API Docs**: `http://localhost:5046/scalar/v1`
- **OpenAPI Spec**: `http://localhost:5046/openapi/v1.json`
