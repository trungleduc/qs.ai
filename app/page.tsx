import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function PricingPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center justify-center">
          <Link
            href="/jupyterlite"
            className="flex items-center flex-initial font-bold md:mr-24"
          >
            <span>JupyterLite</span>
          </Link>
    </div>
  );
}
