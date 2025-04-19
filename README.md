# Data Science Job Network Platform

A specialized mini LinkedIn-like platform connecting data science professionals with recruiters. This application also features a comprehensive dashboard for visualizing job data analytics.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Dashboard Features](#dashboard-features)
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

The application includes a **Data Dashboard** that provides analytics and visualizations based on the job postings data, offering insights into trends, distributions, and key metrics.

## Features

- **Job Posting** - Recruiters can create detailed job listings with information such as job title, description, salary, location, and required skills
- **Job Search & Filtering** - Job seekers can perform dynamic searches using filters like job type, salary range, and location
- **Application Management** - Enables candidates to apply for jobs and track application statuses (e.g., Pending, Accepted, Rejected) along with recruiter feedback
- **User Profiles** - Professionals can create and manage profiles, upload resumes, and highlight their skills and work experiences
- **Networking** - Facilitates sending and receiving connection requests and supports real-time messaging between users
- **Data Dashboard** - Visualizes job data through various interactive charts and key metric cards.

## Dashboard Features

- **Key Metric Cards:** Displays summary statistics like Total Jobs, Remote Jobs, Average Salary, and New Jobs (Last 7 Days).
- **Interactive Charts:** Includes visualizations for:
  - Monthly Job Posting Trends (Area Chart)
  - Jobs by Schedule Type (Donut Chart)
  - Top 10 Job Locations (Bar Chart)
  - Top 5 Companies (Bar Chart)
  - Remote vs. Office Distribution (Donut Chart)
  - Health Insurance Mentioned (Donut Chart)
  - "No Degree" Mentioned (Donut Chart)
  - Schedule Type / WFH Split (Stacked Bar Chart)
  - Average Yearly Salary Trend (Line Chart)
- **Paginated Data Table:** Shows detailed job data with server-side pagination and column visibility controls.

## Tech Stack

- **Framework:** Next.js (v14+, App Router)
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui
- **Charting:** Recharts
- **Backend:** Next.js API routes (Route Handlers)
- **Database:** PostgreSQL
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

4. Database Schema:
   Ensure your PostgreSQL database has the `data_jobs` table. You can use the schema defined in `migrations/2025-05-18.sql`:
   ```sql
   -- (Include CREATE TABLE statement here or reference the file)
   CREATE TABLE IF NOT EXISTS data_jobs (
       id SERIAL PRIMARY KEY,
       job_title_short VARCHAR(50),
       job_title TEXT,
       job_location TEXT,
       job_via TEXT,
       job_schedule_type VARCHAR(50),
       job_work_from_home BOOLEAN NOT NULL,
       search_location TEXT NOT NULL,
       job_posted_date TIMESTAMP NOT NULL,
       job_no_degree_mention BOOLEAN NOT NULL,
       job_health_insurance BOOLEAN NOT NULL,
       job_country VARCHAR(100),
       salary_rate VARCHAR(20),
       salary_year_avg FLOAT,
       salary_hour_avg FLOAT,
       company_name TEXT,
       job_skills TEXT,
       job_type_skills TEXT
   );
   ```
   _Note: You might need to populate this table with your dataset._

### Project Structure

```bash
job-network-app/
├─ app/
│  ├─ api/               # Backend API routes (Route Handlers)
│  │  ├─ cards/
│  │  ├─ chart/
│  │  ├─ charts/         # Grouped chart APIs
│  │  └─ datatable/
│  ├─ dashboard/         # Dashboard page component
│  ├─ (lib)/             # Helper functions, DB connection
│  ├─ layout.tsx
│  └─ page.tsx           # Main entry/landing page (if any)
├─ components/           # Reusable React components (UI, Charts, Table)
│  ├─ ui/                # shadcn/ui components
│  └─ ... (other components)
├─ migrations/           # SQL migration files
├─ public/
├─ styles/
├─ tailwind.config.ts
├─ tsconfig.json
├─ package.json
├─ next.config.mjs
└─ README.md
```

## Usage

To run the application in development mode:

```bash
yarn dev
```

The application will be available at `http://localhost:3000`. Navigate to `/dashboard` to view the data visualizations.

## System Architecture

- **Framework:** Next.js App Router for routing, server components, and client components.
- **Frontend:** React components built with shadcn/ui and Tailwind CSS for styling. Recharts for data visualization.
- **Backend:** Next.js Route Handlers process API requests, interact with the database using `node-postgres` (or your chosen library).
- **Database:** PostgreSQL stores the job data.

## Database Design

The primary table used for the dashboard is `data_jobs` (schema detailed in Installation section).

## API Endpoints

Key API endpoints for the dashboard include:

- `GET /api/datatable?page={page}&limit={limit}` - Retrieves paginated job data for the table.
- `GET /api/cards` - Fetches aggregated data for the summary cards.
- `GET /api/chart` - Gets monthly job posting counts for the main area chart.
- `GET /api/charts/schedule-types` - Gets job counts grouped by schedule type.
- `GET /api/charts/top-locations` - Gets top 10 job locations by count.
- `GET /api/charts/top-companies` - Gets top 5 companies by job count.
- `GET /api/charts/wfh-distribution` - Gets counts for remote vs. office jobs.
- `GET /api/charts/health-insurance` - Gets counts for jobs mentioning health insurance.
- `GET /api/charts/no-degree` - Gets counts for jobs mentioning no degree requirement.
- `GET /api/charts/avg-salary-trend` - Gets the monthly average salary trend.
- `GET /api/charts/schedule-wfh-split` - Gets remote/office counts grouped by schedule type.

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
