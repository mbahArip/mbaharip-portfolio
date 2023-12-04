import { Environment } from 'types/Environment';

export default function env(key: keyof Environment) {
  return process.env[key];
}
