// Auto-generated from Supabase CLI: supabase gen types typescript
// Re-run after each migration: npx supabase gen types typescript --local > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["roles"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["roles"]["Row"]>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role_id: string;
          is_active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["users"]["Row"], "id" | "created_at" | "updated_at"> & { id: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      locations: {
        Row: {
          id: string;
          name: string;
          type: string;
          address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locations"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["locations"]["Row"]>;
      };
      departments: {
        Row: {
          id: string;
          name: string;
          code: string;
          location_id: string | null;
          strike_policy_id: string | null;
          pto_policy_id: string | null;
          default_shift_hours: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["departments"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["departments"]["Row"]>;
      };
      department_managers: {
        Row: {
          id: string;
          department_id: string;
          user_id: string;
          is_primary: boolean;
          assigned_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["department_managers"]["Row"], "id" | "assigned_at"> & { id?: string; assigned_at?: string };
        Update: Partial<Database["public"]["Tables"]["department_managers"]["Row"]>;
      };
      job_titles: {
        Row: {
          id: string;
          title: string;
          department_id: string | null;
          pay_grade: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["job_titles"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["job_titles"]["Row"]>;
      };
      employees: {
        Row: {
          id: string;
          user_id: string | null;
          employee_number: string;
          first_name: string;
          last_name: string;
          preferred_name: string | null;
          date_of_birth: string | null;
          ssn_last4: string | null;
          gender: string | null;
          ethnicity: string | null;
          personal_email: string | null;
          personal_phone: string | null;
          work_email: string | null;
          work_phone: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_rel: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          department_id: string | null;
          job_title_id: string | null;
          location_id: string | null;
          manager_id: string | null;
          employment_type: string;
          status: string;
          hire_date: string;
          termination_date: string | null;
          termination_reason: string | null;
          rehire_eligible: boolean | null;
          is_driver: boolean;
          cdl_expiry: string | null;
          created_by: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employees"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["employees"]["Row"]>;
      };
      compensation_records: {
        Row: {
          id: string;
          employee_id: string;
          pay_type: string;
          amount: number;
          currency: string;
          effective_date: string;
          end_date: string | null;
          change_reason: string | null;
          approved_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["compensation_records"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["compensation_records"]["Row"]>;
      };
      benefits_records: {
        Row: {
          id: string;
          employee_id: string;
          benefit_type: string;
          plan_name: string | null;
          enrollment_date: string | null;
          end_date: string | null;
          employee_contribution: number | null;
          employer_contribution: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["benefits_records"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["benefits_records"]["Row"]>;
      };
      document_types: {
        Row: {
          id: string;
          name: string;
          is_sensitive: boolean;
          requires_ack: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["document_types"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["document_types"]["Row"]>;
      };
      employee_documents: {
        Row: {
          id: string;
          employee_id: string;
          document_type_id: string | null;
          name: string;
          storage_path: string;
          file_size: number | null;
          mime_type: string | null;
          is_sensitive: boolean;
          expiry_date: string | null;
          uploaded_by: string | null;
          deleted_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employee_documents"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["employee_documents"]["Row"]>;
      };
      acknowledgements: {
        Row: {
          id: string;
          document_id: string;
          employee_id: string;
          acknowledged_at: string;
          ip_address: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["acknowledgements"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["acknowledgements"]["Row"]>;
      };
      onboarding_templates: {
        Row: {
          id: string;
          name: string;
          department_id: string | null;
          job_title_id: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["onboarding_templates"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["onboarding_templates"]["Row"]>;
      };
      onboarding_tasks: {
        Row: {
          id: string;
          template_id: string;
          title: string;
          description: string | null;
          task_type: string;
          document_type_id: string | null;
          assigned_to_role: string | null;
          due_days_from_hire: number;
          order_index: number;
          is_required: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["onboarding_tasks"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["onboarding_tasks"]["Row"]>;
      };
      employee_onboarding_progress: {
        Row: {
          id: string;
          employee_id: string;
          task_id: string;
          status: string;
          completed_at: string | null;
          completed_by: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["employee_onboarding_progress"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["employee_onboarding_progress"]["Row"]>;
      };
      performance_review_cycles: {
        Row: {
          id: string;
          name: string;
          cycle_type: string;
          start_date: string;
          end_date: string;
          status: string;
          department_id: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["performance_review_cycles"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["performance_review_cycles"]["Row"]>;
      };
      performance_review_templates: {
        Row: {
          id: string;
          name: string;
          department_id: string | null;
          questions: Json;
          scale_min: number;
          scale_max: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["performance_review_templates"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["performance_review_templates"]["Row"]>;
      };
      performance_reviews: {
        Row: {
          id: string;
          cycle_id: string;
          employee_id: string;
          reviewer_id: string;
          template_id: string | null;
          status: string;
          overall_rating: number | null;
          responses: Json;
          manager_notes: string | null;
          employee_notes: string | null;
          acknowledged_at: string | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["performance_reviews"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["performance_reviews"]["Row"]>;
      };
      goals: {
        Row: {
          id: string;
          employee_id: string;
          review_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          status: string;
          progress_pct: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["goals"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["goals"]["Row"]>;
      };
      recognition_categories: {
        Row: {
          id: string;
          name: string;
          icon: string | null;
          points: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["recognition_categories"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["recognition_categories"]["Row"]>;
      };
      recognition_events: {
        Row: {
          id: string;
          recipient_id: string;
          giver_id: string;
          category_id: string;
          message: string | null;
          points: number;
          is_public: boolean;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["recognition_events"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["recognition_events"]["Row"]>;
      };
      strike_categories: {
        Row: {
          id: string;
          name: string;
          code: string;
          description: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["strike_categories"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["strike_categories"]["Row"]>;
      };
      strike_rules: {
        Row: {
          id: string;
          department_id: string | null;
          category_id: string | null;
          level: number;
          trigger_count: number;
          window_days: number | null;
          action_required: string | null;
          notify_roles: string[];
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["strike_rules"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["strike_rules"]["Row"]>;
      };
      strike_events: {
        Row: {
          id: string;
          employee_id: string;
          category_id: string;
          incident_date: string;
          description: string;
          level: number;
          issued_by: string;
          approved_by: string | null;
          approved_at: string | null;
          voided: boolean;
          voided_reason: string | null;
          voided_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["strike_events"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["strike_events"]["Row"]>;
      };
      disciplinary_actions: {
        Row: {
          id: string;
          strike_event_id: string | null;
          employee_id: string;
          action_type: string;
          effective_date: string;
          end_date: string | null;
          details: string | null;
          document_path: string | null;
          issued_by: string;
          employee_acknowledged_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["disciplinary_actions"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["disciplinary_actions"]["Row"]>;
      };
      attendance_events: {
        Row: {
          id: string;
          employee_id: string;
          event_date: string;
          event_type: string;
          minutes_late: number | null;
          hours_missed: number | null;
          notes: string | null;
          entered_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attendance_events"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["attendance_events"]["Row"]>;
      };
      pto_policies: {
        Row: {
          id: string;
          name: string;
          department_id: string | null;
          accrual_type: string;
          annual_hours: number | null;
          carry_over_hours: number;
          max_accrual_hours: number | null;
          waiting_period_days: number;
          requires_approval: boolean;
          advance_request_days: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pto_policies"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["pto_policies"]["Row"]>;
      };
      pto_balances: {
        Row: {
          id: string;
          employee_id: string;
          policy_id: string | null;
          pto_type: string;
          balance_hours: number;
          used_hours: number;
          accrued_hours: number;
          year: number;
          last_accrual: string | null;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pto_balances"]["Row"], "id" | "updated_at"> & { id?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["pto_balances"]["Row"]>;
      };
      pto_requests: {
        Row: {
          id: string;
          employee_id: string;
          pto_type: string;
          start_date: string;
          end_date: string;
          hours_requested: number;
          status: string;
          notes: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          review_notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["pto_requests"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["pto_requests"]["Row"]>;
      };
      shift_templates: {
        Row: {
          id: string;
          name: string;
          department_id: string | null;
          start_time: string;
          end_time: string;
          break_minutes: number;
          days_of_week: number[];
          color: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["shift_templates"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["shift_templates"]["Row"]>;
      };
      schedules: {
        Row: {
          id: string;
          employee_id: string;
          shift_template_id: string | null;
          scheduled_date: string;
          start_time: string;
          end_time: string;
          location_id: string | null;
          status: string;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["schedules"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["schedules"]["Row"]>;
      };
      surveys: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          questions: Json;
          target_audience: string;
          target_dept_id: string | null;
          is_anonymous: boolean;
          status: string;
          opens_at: string | null;
          closes_at: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["surveys"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["surveys"]["Row"]>;
      };
      survey_responses: {
        Row: {
          id: string;
          survey_id: string;
          respondent_id: string | null;
          answers: Json;
          submitted_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["survey_responses"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["survey_responses"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          type: string;
          title: string;
          body: string | null;
          link: string | null;
          is_read: boolean;
          read_at: string | null;
          entity_type: string | null;
          entity_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: number;
          user_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: Json | null;
          new_values: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["audit_logs"]["Row"], "id" | "created_at"> & { id?: number; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]>;
      };
      notes: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          content: string;
          is_private: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notes"]["Row"], "id" | "created_at" | "updated_at"> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Database["public"]["Tables"]["notes"]["Row"]>;
      };
      attachments: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          name: string;
          storage_path: string;
          mime_type: string | null;
          file_size: number | null;
          uploaded_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["attachments"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Row"]>;
      };
      trainings: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          department_id: string | null;
          is_required: boolean;
          renewal_months: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["trainings"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["trainings"]["Row"]>;
      };
      training_assignments: {
        Row: {
          id: string;
          training_id: string;
          employee_id: string;
          due_date: string | null;
          assigned_by: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["training_assignments"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["training_assignments"]["Row"]>;
      };
      training_completions: {
        Row: {
          id: string;
          assignment_id: string;
          completed_at: string;
          expires_at: string | null;
          score: number | null;
          certificate_path: string | null;
          verified_by: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["training_completions"]["Row"], "id"> & { id?: string };
        Update: Partial<Database["public"]["Tables"]["training_completions"]["Row"]>;
      };
      performance_ratings: {
        Row: {
          id: string;
          review_id: string;
          category: string;
          score: number;
          weight: number;
          comment: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["performance_ratings"]["Row"], "id" | "created_at"> & { id?: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["performance_ratings"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_employee_health_score: {
        Args: { p_employee_id: string };
        Returns: number;
      };
      auth_role: {
        Args: Record<string, never>;
        Returns: string;
      };
      auth_employee_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      auth_managed_dept_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
    Enums: Record<string, never>;
  };
}
