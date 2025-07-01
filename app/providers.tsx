// app/providers.tsx
'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { supabase } from '@/app/lib/supabase';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      {children}
    </SessionContextProvider>
  );
}
