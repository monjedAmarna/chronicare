# Chronicare Frontend

A standalone React frontend application for the Chronicare health management system.

## Features

- Modern React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui components
- Responsive design
- Mock data for demonstration
- **Health Metrics Tracking** - Log and visualize blood glucose, blood pressure, and weight
- **Medication Management** - CRUD operations for medication tracking
- **Care Plans** - Personalized daily recommendations for meals, exercise, and insulin
- **Health Reports** - Comprehensive analysis and visualization of health trends
- **User Authentication** - Sign up, sign in, and profile management
- **Interactive Charts** - SVG-based charts for health data visualization

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Project Structure

```
├── src/
│   ├── components/     # React components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and configurations
│   ├── types.ts       # TypeScript type definitions
│   ├── App.tsx        # Main app component
│   ├── main.tsx       # App entry point
│   └── index.css      # Global styles
├── index.html         # HTML template
├── package.json       # Dependencies and scripts
├── tailwind.config.ts # Tailwind CSS configuration
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## Mock Data

This standalone version includes mock data for demonstration purposes. The app will work without a backend and display sample user information, medications, and health metrics.

## Health Metrics

The Health Metrics page (`/health`) allows users to:
- Log daily health measurements (blood glucose, blood pressure, weight)
- View interactive charts showing trends over time
- See summary statistics and status indicators
- Track progress with visual indicators for normal/elevated/critical values
- Add notes to each measurement for context

### Data Validation
- Blood glucose: 0-1000 mg/dL
- Blood pressure: 50-300 mmHg (systolic), 30-200 mmHg (diastolic)
- Weight: 20-500 kg
- All fields include proper validation with error messages

## Care Plans

The Care Plans page (`/care-plans`) provides personalized daily recommendations including:
- **Meal Plans**: 6 daily meals with nutritional information, insulin dosages, and dietary tags
- **Exercise Routines**: 3 daily exercises with duration, intensity, and health benefits
- **Insulin Schedule**: 4 daily insulin injections with timing and dosage instructions
- **Daily Tips**: Personalized health tips and reminders
- **Progress Tracking**: Visual progress indicators and completion checkboxes
- **Goal Setting**: Daily calorie, carb, exercise, and insulin adherence targets

### Features
- Collapsible sections for easy navigation
- Interactive completion tracking
- Nutritional breakdown (calories, carbs, protein, fat)
- Exercise intensity and type categorization
- Insulin type and dosage management
- Priority-based daily tips
- Motivational messaging and progress encouragement

## Health Reports

The Reports page (`/reports`) provides comprehensive health data analysis including:
- **Period Filtering**: Analyze data for 7, 30, or 90 days
- **Summary Cards**: Overall health rating, glucose, blood pressure, and weight summaries
- **Interactive Charts**: Visual trends for all health metrics with hover tooltips
- **Insight Analysis**: Detailed breakdowns with trend analysis and classifications
- **Raw Data Table**: Expandable table showing all underlying data points
- **Export & Share**: Mock functionality for PDF export and doctor sharing

### Analysis Features
- **Health Rating System**: Excellent, Good, Stable, Concerning, Critical classifications
- **Trend Analysis**: Improving, Stable, Worsening trends for each metric
- **Range Monitoring**: Days in healthy range vs. total days tracked
- **Risk Alerts**: Automatic warnings for concerning values
- **Progress Tracking**: Weight change and goal progress visualization

## Full Stack Development with Docker Compose

To start the entire stack (frontend, backend, MySQL, phpMyAdmin) with one command:

```bash
docker-compose up
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:4000](http://localhost:4000)
- phpMyAdmin: [http://localhost:8080](http://localhost:8080)

The frontend uses Vite's dev server and supports hot reload via volume mounts.

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Query** - Data fetching (mocked)
- **React Hook Form** - Form handling
- **Zod** - Schema validation 