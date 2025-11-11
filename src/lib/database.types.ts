export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          project_name: string
          project_group: string | null
          project_lead: string | null
          team_members: string[]
          client_manager: string | null
          service_type: string | null
          project_status: 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
          po_number: string | null
          po_status: 'Pending' | 'Approved' | 'Rejected'
          po_hours: number
          approved_hours: number
          bill_rate: number
          po_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_name: string
          project_group?: string | null
          project_lead?: string | null
          team_members?: string[]
          client_manager?: string | null
          service_type?: string | null
          project_status?: 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
          po_number?: string | null
          po_status?: 'Pending' | 'Approved' | 'Rejected'
          po_hours?: number
          approved_hours?: number
          bill_rate?: number
          po_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_name?: string
          project_group?: string | null
          project_lead?: string | null
          team_members?: string[]
          client_manager?: string | null
          service_type?: string | null
          project_status?: 'Active' | 'On Hold' | 'Completed' | 'Cancelled'
          po_number?: string | null
          po_status?: 'Pending' | 'Approved' | 'Rejected'
          po_hours?: number
          approved_hours?: number
          bill_rate?: number
          po_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      proposals: {
        Row: {
          id: string
          project_id: string
          proposal_number: string
          quote_amount: number
          proposal_status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected'
          proposal_date: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          proposal_number: string
          quote_amount?: number
          proposal_status?: 'Draft' | 'Sent' | 'Accepted' | 'Rejected'
          proposal_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          proposal_number?: string
          quote_amount?: number
          proposal_status?: 'Draft' | 'Sent' | 'Accepted' | 'Rejected'
          proposal_date?: string
          created_at?: string
        }
      }
      bill_rates: {
        Row: {
          id: string
          project_id: string
          rate_type: string
          rate_amount: number
          effective_from: string
          effective_to: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          rate_type: string
          rate_amount: number
          effective_from?: string
          effective_to?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          rate_type?: string
          rate_amount?: number
          effective_from?: string
          effective_to?: string | null
          created_at?: string
        }
      }
      billing_data: {
        Row: {
          id: string
          project_id: string
          billing_period: string
          hours_billed: number
          bill_rate_used: number
          invoice_amount: number
          cumulative_hours: number
          utilization_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          billing_period: string
          hours_billed?: number
          bill_rate_used?: number
          cumulative_hours?: number
          utilization_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          billing_period?: string
          hours_billed?: number
          bill_rate_used?: number
          cumulative_hours?: number
          utilization_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          project_id: string
          billing_data_id: string | null
          invoice_number: string
          invoice_date: string
          invoice_amount: number
          cumulative_invoiced: number
          remaining_balance: number
          invoice_status: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          billing_data_id?: string | null
          invoice_number: string
          invoice_date?: string
          invoice_amount?: number
          cumulative_invoiced?: number
          remaining_balance?: number
          invoice_status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          billing_data_id?: string | null
          invoice_number?: string
          invoice_date?: string
          invoice_amount?: number
          cumulative_invoiced?: number
          remaining_balance?: number
          invoice_status?: 'Draft' | 'Sent' | 'Paid' | 'Overdue' | 'Cancelled'
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
