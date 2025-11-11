# ProjectFlow - Billing & Management System

A comprehensive project and billing management application with automatic calculations, real-time alerts, and beautiful visualizations.

## Features

### Project Master Data Management
- Complete CRUD operations for projects
- Track project details including name, group, lead, team members, and client manager
- Manage PO information: number, status, hours, approved hours, bill rate, and PO value
- Support for multiple proposals/quotes per project
- Multiple bill rates within a single project
- Color-coded project status indicators

### Billing Data Management
- Input monthly/yearly hours billed per project
- Automatic calculations for cumulative billed hours
- Real-time PO utilization percentage tracking
- Invoice amount auto-calculation based on billing data and rates
- Period-based filtering and reporting
- Export billing data to Excel/CSV

### Invoice Management
- Create and track invoices with automatic numbering
- Link invoices to billing periods
- Auto-calculated cumulative invoiced amounts
- Real-time remaining PO balance tracking
- Invoice status management (Draft, Sent, Paid, Overdue, Cancelled)
- Export invoice data to Excel/CSV

### Alerts and Status Indicators
- Color-coded PO utilization alerts:
  - Green: <70% utilization
  - Yellow: 70-79% utilization
  - Red: 80%+ utilization (high alert)
- Visual alerts in project lists and dashboards
- Real-time status updates

### Dashboards and Reports
- Project summary dashboard showing:
  - Total projects and active projects
  - Total PO value across all projects
  - High utilization alerts count
- Recent projects overview
- Quick action buttons for common tasks
- Visual statistics with gradient cards
- Responsive design for all screen sizes

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom gradients
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **State Management**: React Hooks

## Database Schema

### Tables
- `projects` - Core project information
- `proposals` - Multiple proposals per project
- `bill_rates` - Multiple billing rates per project
- `billing_data` - Monthly/yearly billing records
- `invoices` - Invoice tracking and calculations

### Automatic Features
- Cumulative hours and invoice calculations via database triggers
- Utilization percentage auto-calculation
- Remaining balance tracking
- Row Level Security (RLS) for data protection

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Design Features

- Modern, colorful UI with Apple-inspired metallic themes
- Gradient backgrounds and buttons
- Smooth transitions and hover effects
- Responsive grid layouts
- Card-based information display
- Color-coded status badges
- Clean typography and spacing

## Data Export

Both Billing and Invoice sections support exporting data to CSV format, which can be opened in Excel or any spreadsheet application.

## Security

- Row Level Security enabled on all tables
- Authentication required for all operations
- Secure data validation and error handling
- No data loss with proper constraints
