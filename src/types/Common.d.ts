import { IconType } from '@icons-pack/react-simple-icons';
import { icons } from 'lucide-react';

export type State = 'idle' | 'loading' | 'disabled' | 'success' | 'error';

export interface DataSocials {
  name: string;
  icon: string | IconType;
  href: string;
  color?: string;
}
export interface DataSkills {
  name: string;
  description: string;
  icon: keyof typeof icons;
  skills: Skill[];
}
interface Skill {
  name: string;
  icon: IconType;
  color: string;
  foreground: string;
}
export interface Data404 {
  title: string;
  subtitle?: string;
}
export interface DataPCSpecs {
  title: string;
  value: string;
}

export interface APIResponse<T = undefined> {
  message: string;
  data?: T;
  error?:
    | string
    | {
        message: string;
        details?: string;
        hint?: string;
      };
}
