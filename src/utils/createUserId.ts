export default function createUserId(name: string, email?: string | null): string {
  const formattedName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
  return `user/${formattedName}@${email ? 'google' : 'github'}`;
}
