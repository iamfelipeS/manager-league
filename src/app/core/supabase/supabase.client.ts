import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../enviroments/enviroment';

export const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
