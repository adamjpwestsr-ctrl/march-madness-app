import { getSession } from '../lib/session';
import BracketClient from './BracketClient';

export default async function BracketPage() {
  const session = await getSession();
  return <BracketClient session={session} />;
}
