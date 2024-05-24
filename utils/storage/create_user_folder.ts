import { SupabaseClient, Session } from '@supabase/supabase-js';

export async function createUserStorage(options: {
  session: Session | null;
  supabase: SupabaseClient;
}): Promise<void> {
  const { session, supabase } = options;

  const userId = session?.user.id;
  const authorization = session?.access_token;
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
