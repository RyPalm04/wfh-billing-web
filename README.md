  # wfh-billing-web

  React frontend for the Wright Funeral Home billing statement generator. Provides a web interface for creating, viewing, editing, and downloading billing statements.

  ## Features
  
  - Create and edit billing statements with services, merchandise, special charges, and cash advances
  - View full statement detail with itemized totals and balance due
  - Apply down payments with inline editing
  - Download statements as PDF
  - First-time user guided tour on the New Statement form
  - Fully responsive with mobile navigation

  ## Tech Stack
  
  - React 19 + Vite
  - React Router v7
  - Axios
  - react-hot-toast
  - react-error-boundary
  - Shepherd.js (guided tour)
  - Vitest + React Testing Library

  ## Getting Started
  
  ### Prerequisites

  - Node.js 18+
  - [wfh-billing-api](https://github.com/RyPalm04/wfh-billing-api) running locally or accessible via URL

  ### Installation

  ```bash
  npm install

  Environment

  Copy .env and set your values:

  VITE_API_KEY=your_api_key
  VITE_API_BASE_URL=http://localhost:18080

  Running
  
  npm run dev

  Testing

  npm test

  Deployment

  Deployed to Vercel. The master branch deploys to production automatically on push.

  Adjust the deployment section if the Vercel setup is branch/tag triggered rather than push to master.