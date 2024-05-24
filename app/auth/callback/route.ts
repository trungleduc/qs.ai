import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { cookies } from 'next/headers';
import { QSAI_COOKIE_NAME } from '@/utils/auth-helpers/settings';
import { createUserStorage } from '@/utils/storage/create_user_folder';
export async function GET(request: NextRequest) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        getErrorRedirect(
          `${requestUrl.origin}/signin`,
          error.name,
          "Sorry, we weren't able to log you in. Please try again."
        )
      );
    }
    const cookieStore = cookies();
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
      cookieStore.set(QSAI_COOKIE_NAME.accessToken, data.session.access_token, {
        maxAge,
        sameSite: 'lax',
        secure: true,
        path: '/'
      });
      cookieStore.set(
        QSAI_COOKIE_NAME.refreshToken,
        data.session.refresh_token,
        {
          maxAge,
          sameSite: 'lax',
          secure: true,
          path: '/'
        }
      );
    }

    await createUserStorage({ supabase, session: data.session });
  }
  // URL to redirect to after sign in process completes
  return NextResponse.redirect(
    getStatusRedirect(
      `${requestUrl.origin}/account`,
      'Success!',
      'You are now signed in.'
    )
  );
}
