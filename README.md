# Frontend – Phish Outta Water

## Overview

The frontend for **Phish Outta Water** is built using React, JavaScript, and Vite. It provides the user interface where users can submit suspicious email text for analysis and view the results returned by the backend.

## Technologies

- React – User interface
- JavaScript – Frontend functionality
- Vite – Development server and build tool
- Tailwind CSS – Styling
- Fetch API – Communication with the Express backend

## Prerequisites

Before running the frontend, make sure you have:

- [Node.js](https://nodejs.org/) installed
- npm installed
- The project repository cloned to your computer

## Installation

1. Open a terminal.
2. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

## Running the Frontend

Start the Vite development server:

```bash
npm run dev
```

Once the server starts, open the local URL displayed in your terminal. By default, Vite uses:

```text
http://localhost:5173
```

The frontend should now be running in your browser.

## Running the Backend

The frontend requires the Express backend to be running so it can submit email text and receive analysis results.

1. Open a second terminal.
2. Navigate to the backend directory.
3. Install backend dependencies if you haven't already:

   ```bash
   npm install
   ```

4. Start the backend using its configured start command.

The backend must be running on the port configured for API requests from the frontend.

## Building for Production

To create a production build of the frontend, run:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Notes

- The frontend and backend run as separate development servers.
- Vite serves the frontend, while Express handles API requests and email analysis.
- Both servers need to be running for the complete application to work.
- The frontend communicates with the backend using HTTP requests.
