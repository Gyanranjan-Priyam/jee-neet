import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const createClient = () => {
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'Content-Type': 'application/json',
      },
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

// For backwards compatibility
export const supabase = createClient()

export type Database = {
  public: {
    Tables: {
      email_otps: {
        Row: {
          id: string
          email: string
          otp: string
          purpose: string
          user_data: any
          attempts: number
          created_at: string
          expires_at: string
          verified_at: string | null
        }
        Insert: {
          id?: string
          email: string
          otp: string
          purpose: string
          user_data?: any
          attempts?: number
          created_at?: string
          expires_at: string
          verified_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          otp?: string
          purpose?: string
          user_data?: any
          attempts?: number
          created_at?: string
          expires_at?: string
          verified_at?: string | null
        }
      }
      student_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone: string | null
          class_type: '11th' | '12th' | 'dropper'
          exam_preference: 'jee' | 'neet' | 'both'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          email: string
          phone?: string | null
          class_type: '11th' | '12th' | 'dropper'
          exam_preference: 'jee' | 'neet' | 'both'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string | null
          class_type?: '11th' | '12th' | 'dropper'
          exam_preference?: 'jee' | 'neet' | 'both'
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          id: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          role: string
          permissions: any
          is_active: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          role?: string
          permissions?: any
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          permissions?: any
          is_active?: boolean
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          name: string
          parent_id: string | null
          category: 'jee' | 'neet'
          class_type: '11th' | '12th' | 'dropper'
          color: string
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          parent_id?: string | null
          category: 'jee' | 'neet'
          class_type: '11th' | '12th' | 'dropper'
          color?: string
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          parent_id?: string | null
          category?: 'jee' | 'neet'
          class_type?: '11th' | '12th' | 'dropper'
          color?: string
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      files: {
        Row: {
          id: string
          name: string
          path: string
          folder_id: string | null
          category: 'jee' | 'neet'
          class_type: '11th' | '12th' | 'dropper'
          file_size: number | null
          file_type: string | null
          storage_path: string
          is_from_drive: boolean
          drive_link: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          name: string
          path: string
          folder_id?: string | null
          category: 'jee' | 'neet'
          class_type: '11th' | '12th' | 'dropper'
          file_size?: number | null
          file_type?: string | null
          storage_path: string
          is_from_drive?: boolean
          drive_link?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          name?: string
          path?: string
          folder_id?: string | null
          category?: 'jee' | 'neet'
          class_type?: '11th' | '12th' | 'dropper'
          file_size?: number | null
          file_type?: string | null
          storage_path?: string
          is_from_drive?: boolean
          drive_link?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      questions: {
        Row: {
          id: string
          title: string
          content: string
          solution: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          category: 'jee' | 'neet'
          class_type: '11th' | '12th' | 'dropper'
          subject: string
          topic: string
          folder_id: string | null
          is_ai_generated: boolean
          pdf_url: string | null
          drive_link: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          solution?: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          category: 'jee' | 'neet'
          class_type: '11th' | '12th' | 'dropper'
          subject: string
          topic: string
          folder_id?: string | null
          is_ai_generated?: boolean
          pdf_url?: string | null
          drive_link?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          solution?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: 'jee' | 'neet'
          class_type?: '11th' | '12th' | 'dropper'
          subject?: string
          topic?: string
          folder_id?: string | null
          is_ai_generated?: boolean
          pdf_url?: string | null
          drive_link?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          user_id: string
          subject: string
          chapter: string
          exam_type: string
          total_questions: number
          status: string
          time_limit: number
          pdf_generated: boolean
          pdf_generation_status: string
          pdf_generated_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          chapter: string
          exam_type: string
          total_questions: number
          status?: string
          time_limit?: number
          pdf_generated?: boolean
          pdf_generation_status?: string
          pdf_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          chapter?: string
          exam_type?: string
          total_questions?: number
          status?: string
          time_limit?: number
          pdf_generated?: boolean
          pdf_generation_status?: string
          pdf_generated_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_session_id: string
          question_number: number
          question_text: string
          options: string[]
          correct_answer: number
          explanation: string
          difficulty: string
          subtopic: string
          concepts: string[]
          time_estimate: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_session_id: string
          question_number: number
          question_text: string
          options: string[]
          correct_answer: number
          explanation: string
          difficulty?: string
          subtopic?: string
          concepts?: string[]
          time_estimate?: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_session_id?: string
          question_number?: number
          question_text?: string
          options?: string[]
          correct_answer?: number
          explanation?: string
          difficulty?: string
          subtopic?: string
          concepts?: string[]
          time_estimate?: number
          created_at?: string
        }
      }
      quiz_answers: {
        Row: {
          id: string
          quiz_session_id: string
          question_id: string
          selected_option: number | null
          is_correct: boolean
          time_taken: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_session_id: string
          question_id: string
          selected_option?: number | null
          is_correct: boolean
          time_taken: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_session_id?: string
          question_id?: string
          selected_option?: number | null
          is_correct?: boolean
          time_taken?: number
          created_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          quiz_session_id: string
          score: number
          total_correct: number
          total_incorrect: number
          total_skipped: number
          time_taken: number
          created_at: string
        }
        Insert: {
          id?: string
          quiz_session_id: string
          score: number
          total_correct: number
          total_incorrect: number
          total_skipped: number
          time_taken: number
          created_at?: string
        }
        Update: {
          id?: string
          quiz_session_id?: string
          score?: number
          total_correct?: number
          total_incorrect?: number
          total_skipped?: number
          time_taken?: number
          created_at?: string
        }
      }
      quiz_pdfs: {
        Row: {
          id: string
          quiz_session_id: string
          pdf_type: string
          file_path: string
          file_size: number
          storage_url: string
          created_at: string
          expires_at: string
          download_count: number
          last_downloaded_at: string | null
        }
        Insert: {
          id?: string
          quiz_session_id: string
          pdf_type: string
          file_path: string
          file_size?: number
          storage_url: string
          created_at?: string
          expires_at: string
          download_count?: number
          last_downloaded_at?: string | null
        }
        Update: {
          id?: string
          quiz_session_id?: string
          pdf_type?: string
          file_path?: string
          file_size?: number
          storage_url?: string
          created_at?: string
          expires_at?: string
          download_count?: number
          last_downloaded_at?: string | null
        }
      }
      temp_quiz_questions: {
        Row: {
          id: string
          quiz_session_id: string
          question_data: any
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          quiz_session_id: string
          question_data: any
          created_at?: string
          expires_at: string
        }
        Update: {
          id?: string
          quiz_session_id?: string
          question_data?: any
          created_at?: string
          expires_at?: string
        }
      }
    }
    Functions: {
      cleanup_expired_otps: {
        Args: Record<string, never>
        Returns: undefined
      }
      create_email_otp: {
        Args: {
          p_email: string
          p_otp: string
          p_purpose: string
          p_user_data: any
        }
        Returns: {
          success: boolean
          otp_id: string | null
          message: string
        }
      }
      verify_email_otp: {
        Args: {
          p_email: string
          p_otp: string
          p_purpose: string
        }
        Returns: {
          success: boolean
          user_data: any
          message: string
        }
      }
      cleanup_expired_data: {
        Args: Record<string, never>
        Returns: undefined
      }
      increment_download_count: {
        Args: {
          pdf_id: string
        }
        Returns: number
      }
    }
  }
}