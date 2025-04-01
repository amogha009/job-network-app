# Data Science Job Network Platform
A specialized mini LinkedIn-like platform connecting data science professionals with recruiters.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [System Architecture](#system-architecture)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Development Roadmap](#development-roadmap)
- [Contributing](#contributing)
- [License](#license)

## Overview
The Data Science Job Network Platform is a specialized mini LinkedIn-like application designed for data science professionals and recruiters. It streamlines the recruitment process by allowing recruiters to post job opportunities and enables job seekers to search, filter, and apply for these positions. Additionally, the platform supports professional networking through profile management, connection requests, and real-time messaging.

## Features
- **Job Posting** - Recruiters can create detailed job listings with information such as job title, description, salary, location, and required skills
- **Job Search & Filtering** - Job seekers can perform dynamic searches using filters like job type, salary range, and location
- **Application Management** - Enables candidates to apply for jobs and track application statuses (e.g., Pending, Accepted, Rejected) along with recruiter feedback
- **User Profiles** - Professionals can create and manage profiles, upload resumes, and highlight their skills and work experiences
- **Networking** - Facilitates sending and receiving connection requests and supports real-time messaging between users

## Tech Stack
- **Framework:** Next.js (Full-stack application)
- **Frontend:** React
- **Backend:** Next.js API routes
- **Database:** PostgreSQL
- **Authentication:** JSON Web Tokens (JWT)
- **Deployment:** Netlify
- **Roadmap & Project Management:** GitHub Projects

## Installation
### Prerequisites
- Node.js (v22.14.0)
- PostgreSQL (v16)
- npm or yarn

### Setup
1. Clone the repository:
```bash
git clone https://github.com/amogha009/job-network-app.git
cd job-network-app
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables:
```bash
# Create a .env.local file with the following variables
DATABASE_URL=postgresql://username:password@localhost:5432/job-app
JWT_SECRET=super-secure-secret
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### Project Structure
```bash
job-network-app/
├─ pages/
│  ├─ api/            # Backend API routes
│  ├─ index.js        # Home page
│  ├─ jobs/           # Job-related pages
│  ├─ profile/        # Profile pages
│  └─ networking/     # Networking features
├─ components/        # Reusable React components
├─ styles/            # CSS/SCSS styles
├─ lib/               # Utility functions and DB connection
├─ public/            # Static assets
├─ prisma/            # Database schema
├─ package.json
├─ next.config.js
└─ README.md
```

## Usage
To run the application in development mode:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`.

### Home Screen
Browse job listings with a search bar and categorized tabs (Discover, Saved, Applied, Closed).

### Filter Screen
Apply filters (job type, salary range, location) to narrow down job searches.

### Job Detail Screen
View comprehensive job details including description, requirements, and benefits; apply for jobs directly from this screen.

### Profile Screen
Manage personal information, upload resumes, and track job applications.

### Networking
Send and manage connection requests, and engage in real-time messaging with other professionals.

## System Architecture
- **Full-Stack Framework:**
  Next.js handles both frontend and backend in a single codebase.
- **Frontend:**
  React components render the UI and handle client-side interactions.
- **Backend:**
  Next.js API routes handle server-side logic and database operations.
- **Database:**
  PostgreSQL stores job postings, user profiles, applications, connections, and messages.
- **Authentication:**
  JWT secures API endpoints and manages user sessions.
- **Real-Time Messaging:**
  Implemented via WebSockets to support instant communication between connected users.

## Database Design
The platform's database schema includes the following key tables:
- **Users:** Stores user profile details, skills, work experience, and resume information.
- **Jobs:** Contains job posting data including title, description, salary, location, and required skills.
- **Applications:** Tracks job applications and their status.
- **User_Connections:** Manages connection requests and statuses.
- **Messages:** Logs messages exchanged between users.

## API Endpoints
Key API endpoints include:
- `POST /api/jobs` – Create a new job posting.
- `GET /api/jobs` – Retrieve job listings (supports filter query parameters).
- `POST /api/applications` – Submit a job application.
- `PUT /api/applications/:id` – Update the status of a job application.
- `GET /api/profile/:userId` – Fetch user profile details.
- `POST /api/profile/:userId` – Update user profile information.
- `POST /api/connections` – Handle connection requests.
- `POST /api/messages` – Send messages between connected users.

## Deployment
The application is deployed as a single Next.js project on Netlify:
1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `yarn build`
   - Publish directory: `.next`
3. Set up environment variables in the Netlify dashboard
4. Configure Netlify for serverless functions to support API routes

### Live Dashboard
Metrics can be viewed in the Netlify dashboard. Link will be provided soon.

## Development Roadmap
The project follows a 3-month development timeline with these key milestones:
1. **Foundation & Authentication (Mar 27, 2025):**
   Set up the initial Next.js project structure, database configuration, and implement JWT-based authentication.
2. **Job Management (Mar 28 - Apr 3, 2025):**
   Develop job posting and searching functionalities, including API endpoints and UI design.
3. **Application Processing (Apr 10, 2025):**
   Implement the job application workflow, including status updates and recruiter feedback.
4. **Profiles & Networking (Apr 17, 2025):**
   Build user profiles and networking features, including connection requests and real-time messaging.
5. **System Refinement & Launch (Apr 24 - May 15, 2025):**
   Optimize performance, finalize UI/UX, conduct testing, and deploy the final product to Netlify.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

## License
MIT License. See [LICENSE](LICENSE) for details.
