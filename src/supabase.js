import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jqnxljokfebvyekkqukw.supabase.co'
const supabaseKey = 'sb_publishable_Eh4ZMazMFOnLxLL9HtzZPg_M9eN6yEY'

export const supabase = createClient(supabaseUrl, supabaseKey)