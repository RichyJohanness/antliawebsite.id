// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://kflsngexvniuqsakeuuo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmbHNuZ2V4dm5pdXFzYWtldXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2NTQ4MTEsImV4cCI6MjA2MzIzMDgxMX0.9mS7WqXUNPbhosop7Z0Dud1wrmSZ0t0Dv3fJO3FkDiQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);