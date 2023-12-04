import { IconType } from '@icons-pack/react-simple-icons';
import { icons } from 'lucide-react';

export type State = 'idle' | 'loading' | 'disabled' | 'success' | 'error';
export type HandlerState<T = unknown> = {
  get: T;
  set: React.Dispatch<React.SetStateAction<T>>;
};

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
export interface DataWorkspace {
  title: string;
  value: string;
  url?: string;
}

export type ApiResponseSuccess<T = undefined> = {
  message: string;
  data: Partial<T>;
  pagination?: {
    page: number;
    itemsPerPage: number;
    totalData: number;
    totalPages: number;
    isNextPage: boolean;
    isPrevPage: boolean;
  };
};
export type ApiResponseError = {
  message: string;
  error?: string;
};
