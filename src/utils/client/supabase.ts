import { createClient } from '@supabase/supabase-js';

import { Database } from 'types/SupabaseSchema';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_KEY as string,
  {
    auth: {
      storageKey: 'mbaharip-auth',
    },
    db: {
      schema: 'public',
    },
  },
);

export default supabase;
