import { getSession } from '../lib/session';
import AdminClient from './AdminClient';

export default async function AdminPage() {
  const session = await getSession();
  return <AdminClient session={session} />;
}
