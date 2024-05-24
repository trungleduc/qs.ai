import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getErrorRedirect, getStatusRedirect } from '@/utils/helpers';
import { cookies } from 'next/headers';
import { QSAI_COOKIE_NAME } from '@/utils/auth-helpers/settings';
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

    const userId = data.session?.user.id;
    const authorization = data.session?.access_token;
    if (userId && authorization) {
      const filePath = `${userId}/.emptyFolderPlaceholder`;
      const checkPath = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/qsai/${filePath}`;
      const response = await fetch(checkPath, {
        method: 'HEAD',
        headers: {
          authorization: authorization
        }
      });
      const status = await response.status;
      if (status === 400) {
        supabase.storage.from('qsai').upload(filePath, new Blob([]), {
          cacheControl: '3600',
          upsert: false
        });
      }
    }
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
