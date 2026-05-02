import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jqnxljokfebvyekkqukw.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_Eh4ZMazMFOnLxLL9HtzZPg_M9eN6yEY'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Feature flags
export const features = {
  googleAuth: import.meta.env.VITE_ENABLE_GOOGLE_AUTH === 'true',
  emailAuth: import.meta.env.VITE_ENABLE_EMAIL_AUTH === 'true'
}