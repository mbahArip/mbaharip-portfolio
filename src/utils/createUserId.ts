import { Session } from 'next-auth';

export default function createUserId(session: Session | null): string | null {
  if (!session || !session.user) return null;
  const { email, name } = session.user;
  const isme = email === 'admin@mbaharip.com' && name === 'mbaharip';
  const formattedName = (name ?? 'guest').replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `user/${formattedName}@${isme ? 'admin' : email ? 'google' : 'github'}`;
}
