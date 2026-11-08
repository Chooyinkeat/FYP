# Lost and Found Management System

A web-based Lost and Found Management System developed to streamline the process of reporting, managing, and tracking lost and found items. The system aims to make it easier for users to communicate and manage item recovery through a centralized platform with real-time communication capabilities.

## Tech Stack

### Frontend & Backend
- **Next.js 15** – React framework using App Router
- **TypeScript** – Type-safe development
- **React** – User interface development

### Real-Time Communication
- **WebSocket (`ws`)** – Real-time communication between connected users

### Background Processing
- **Redis** – In-memory data store
- **BullMQ** – Background job and queue processing

### UI Components
- **Swiper** – Responsive sliders and carousels

## Key Features

- **Lost and Found Management** – Centralized management of lost and found item information.
- **Real-Time Communication** – WebSocket-powered communication between connected users.
- **User-Based Messaging** – Supports message delivery to specific connected users.
- **Background Job Processing** – Uses BullMQ and Redis for asynchronous background tasks.

> Additional features and modules will be documented as the system continues to develop.

## System Architecture

The application uses separate mechanisms for real-time communication and background processing.

| Component | Responsibility |
|---|---|
| Next.js | Application frontend and backend API |
| WebSocket (`ws`) | Real-time communication |
| Redis | Background job queue storage |
| BullMQ | Background job processing |

WebSocket handles persistent client connections and real-time messaging, while BullMQ handles background jobs independently.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- Redis
- Git

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
```

Navigate into the project directory:

```bash
cd <PROJECT_DIRECTORY>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root directory.

Configure the required environment variables according to your local development environment.

**Note:** Refer to `.env.example` for the required configuration, if available. Never commit actual credentials or secrets to GitHub.

### 4. Start Redis

Make sure your Redis server is running before starting services that depend on it.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for Production

```bash
npm run build
```

Start the production application using the configured production start script.

## Project Structure

```text
project/
├── app/                  # Next.js App Router
├── components/           # Reusable UI components
├── lib/                  # Shared utilities and services
├── public/               # Static assets
├── types/                # TypeScript type definitions
├── package.json
├── tsconfig.json
└── README.md
```

*The structure above is illustrative and should be adjusted to match the actual repository.*

## Environment Configuration

Environment variables are maintained separately from the source code to protect sensitive configuration and credentials.

- `.env.local` – Local development configuration.
- `.env.example` – Example configuration without actual credentials.

## Development Notes

- WebSocket and BullMQ are independent components with different responsibilities.
- WebSocket connections are used for real-time communication.
- BullMQ is used for asynchronous background job processing.
- Redis supports the BullMQ job queue.

## License

This project is currently maintained as a personal project. License details: **TODO**.

