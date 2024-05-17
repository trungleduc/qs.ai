import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function PricingPage() {
  const supabase = createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <div className="flex items-center justify-center">
      <section className="bg-black">
        <div className="max-w-6xl px-4 py-8 mx-auto sm:py-24 sm:px-6 lg:px-8">
          <div className="sm:flex sm:flex-col sm:align-center"></div>
          <p className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Scaling <span className="text-orange-500">Jupyter</span>{' '}
            applications up to the millions.
          </p>
        </div>
      </section>
    </div>
  );
}
