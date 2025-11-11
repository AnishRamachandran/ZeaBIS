/*
  # Project and Billing Management System Schema

  ## Overview
  This migration creates a comprehensive database schema for managing projects, billing, and invoicing with automatic calculations and alerts.

  ## 1. New Tables

  ### `projects`
  Core project information table containing:
  - `id` (uuid, primary key) - Unique project identifier
  - `project_name` (text) - Name of the project
  - `project_group` (text) - Project grouping/category
  - `project_lead` (text) - Lead person for the project
  - `team_members` (text[]) - Array of team member names
  - `client_manager` (text) - Client relationship manager
  - `service_type` (text) - Type of service being provided
  - `project_status` (text) - Current status (Active, On Hold, Completed, Cancelled)
  - `po_number` (text) - Purchase order number
  - `po_status` (text) - PO status (Pending, Approved, Rejected)
  - `po_hours` (numeric) - Total hours allocated in PO
  - `approved_hours` (numeric) - Hours approved for billing
  - `bill_rate` (numeric) - Default billing rate per hour
  - `po_value` (numeric) - Total PO value in currency
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `proposals`
  Supports multiple proposals per project:
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key) - Links to projects table
  - `proposal_number` (text) - Unique proposal identifier
  - `quote_amount` (numeric) - Quoted amount
  - `proposal_status` (text) - Status of proposal
  - `proposal_date` (date) - Date of proposal
  - `created_at` (timestamptz)

  ### `bill_rates`
  Supports multiple billing rates per project:
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key) - Links to projects table
  - `rate_type` (text) - Type/description of rate
  - `rate_amount` (numeric) - Billing rate amount
  - `effective_from` (date) - When this rate becomes effective
  - `effective_to` (date) - When this rate expires
  - `created_at` (timestamptz)

  ### `billing_data`
  Monthly/yearly billing records:
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key) - Links to projects table
  - `billing_period` (date) - Month/year of billing
  - `hours_billed` (numeric) - Hours billed in this period
  - `bill_rate_used` (numeric) - Rate used for this billing period
  - `invoice_amount` (numeric, computed) - Calculated amount
  - `cumulative_hours` (numeric) - Running total of hours
  - `utilization_percentage` (numeric) - Percentage of PO hours used
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `invoices`
  Invoice tracking and calculations:
  - `id` (uuid, primary key)
  - `project_id` (uuid, foreign key) - Links to projects table
  - `billing_data_id` (uuid, foreign key) - Links to billing_data table
  - `invoice_number` (text) - Unique invoice number
  - `invoice_date` (date) - Date of invoice
  - `invoice_amount` (numeric) - Invoice amount
  - `cumulative_invoiced` (numeric) - Running total invoiced
  - `remaining_balance` (numeric) - Remaining PO balance
  - `invoice_status` (text) - Status (Draft, Sent, Paid, Overdue)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## 2. Security
  - Enable Row Level Security (RLS) on all tables
  - Create policies for authenticated users to manage their accessible data
  - Implement read access for all authenticated users
  - Implement write access for authenticated users

  ## 3. Indexes
  - Add indexes on foreign keys for optimal query performance
  - Add indexes on frequently queried fields (project_status, billing_period)

  ## 4. Functions
  - Create trigger functions to automatically update cumulative calculations
  - Auto-update timestamps on record modifications
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name text NOT NULL,
  project_group text,
  project_lead text,
  team_members text[] DEFAULT '{}',
  client_manager text,
  service_type text,
  project_status text DEFAULT 'Active' CHECK (project_status IN ('Active', 'On Hold', 'Completed', 'Cancelled')),
  po_number text,
  po_status text DEFAULT 'Pending' CHECK (po_status IN ('Pending', 'Approved', 'Rejected')),
  po_hours numeric DEFAULT 0 CHECK (po_hours >= 0),
  approved_hours numeric DEFAULT 0 CHECK (approved_hours >= 0),
  bill_rate numeric DEFAULT 0 CHECK (bill_rate >= 0),
  po_value numeric DEFAULT 0 CHECK (po_value >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  proposal_number text NOT NULL,
  quote_amount numeric DEFAULT 0 CHECK (quote_amount >= 0),
  proposal_status text DEFAULT 'Draft' CHECK (proposal_status IN ('Draft', 'Sent', 'Accepted', 'Rejected')),
  proposal_date date DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

-- Bill rates table
CREATE TABLE IF NOT EXISTS bill_rates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  rate_type text NOT NULL,
  rate_amount numeric NOT NULL CHECK (rate_amount >= 0),
  effective_from date DEFAULT CURRENT_DATE,
  effective_to date,
  created_at timestamptz DEFAULT now()
);

-- Billing data table
CREATE TABLE IF NOT EXISTS billing_data (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  billing_period date NOT NULL,
  hours_billed numeric DEFAULT 0 CHECK (hours_billed >= 0),
  bill_rate_used numeric DEFAULT 0 CHECK (bill_rate_used >= 0),
  invoice_amount numeric GENERATED ALWAYS AS (hours_billed * bill_rate_used) STORED,
  cumulative_hours numeric DEFAULT 0,
  utilization_percentage numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(project_id, billing_period)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  billing_data_id uuid REFERENCES billing_data(id) ON DELETE SET NULL,
  invoice_number text NOT NULL UNIQUE,
  invoice_date date DEFAULT CURRENT_DATE,
  invoice_amount numeric DEFAULT 0 CHECK (invoice_amount >= 0),
  cumulative_invoiced numeric DEFAULT 0,
  remaining_balance numeric DEFAULT 0,
  invoice_status text DEFAULT 'Draft' CHECK (invoice_status IN ('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_created ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_proposals_project ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_bill_rates_project ON bill_rates(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_data_project ON billing_data(project_id);
CREATE INDEX IF NOT EXISTS idx_billing_data_period ON billing_data(billing_period DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(invoice_status);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_data_updated_at BEFORE UPDATE ON billing_data
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate cumulative hours and utilization
CREATE OR REPLACE FUNCTION update_billing_cumulative()
RETURNS TRIGGER AS $$
DECLARE
  project_po_hours numeric;
  total_hours numeric;
BEGIN
  -- Get project PO hours
  SELECT po_hours INTO project_po_hours
  FROM projects
  WHERE id = NEW.project_id;

  -- Calculate cumulative hours
  SELECT COALESCE(SUM(hours_billed), 0) INTO total_hours
  FROM billing_data
  WHERE project_id = NEW.project_id
    AND billing_period <= NEW.billing_period;

  NEW.cumulative_hours := total_hours;

  -- Calculate utilization percentage
  IF project_po_hours > 0 THEN
    NEW.utilization_percentage := (total_hours / project_po_hours) * 100;
  ELSE
    NEW.utilization_percentage := 0;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_billing_data_cumulative BEFORE INSERT OR UPDATE ON billing_data
  FOR EACH ROW EXECUTE FUNCTION update_billing_cumulative();

-- Function to calculate invoice cumulative and remaining balance
CREATE OR REPLACE FUNCTION update_invoice_cumulative()
RETURNS TRIGGER AS $$
DECLARE
  project_po_value numeric;
  total_invoiced numeric;
BEGIN
  -- Get project PO value
  SELECT po_value INTO project_po_value
  FROM projects
  WHERE id = NEW.project_id;

  -- Calculate cumulative invoiced
  SELECT COALESCE(SUM(invoice_amount), 0) INTO total_invoiced
  FROM invoices
  WHERE project_id = NEW.project_id
    AND invoice_date <= NEW.invoice_date
    AND invoice_status != 'Cancelled';

  NEW.cumulative_invoiced := total_invoiced;

  -- Calculate remaining balance
  NEW.remaining_balance := project_po_value - total_invoiced;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_invoice_cumulative BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_invoice_cumulative();

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view all projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for proposals
CREATE POLICY "Users can view all proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update proposals"
  ON proposals FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete proposals"
  ON proposals FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for bill_rates
CREATE POLICY "Users can view all bill rates"
  ON bill_rates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert bill rates"
  ON bill_rates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update bill rates"
  ON bill_rates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete bill rates"
  ON bill_rates FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for billing_data
CREATE POLICY "Users can view all billing data"
  ON billing_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert billing data"
  ON billing_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update billing data"
  ON billing_data FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete billing data"
  ON billing_data FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for invoices
CREATE POLICY "Users can view all invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert invoices"
  ON invoices FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update invoices"
  ON invoices FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete invoices"
  ON invoices FOR DELETE
  TO authenticated
  USING (true);