import {
  SiAdobeillustrator,
  SiAdobeillustratorHex,
  SiAdobephotoshop,
  SiAdobephotoshopHex,
  SiAstro,
  SiAstroHex,
  SiBlender,
  SiBlenderHex,
  SiExpress,
  SiExpressHex,
  SiJavascript,
  SiJavascriptHex,
  SiMongodb,
  SiMongodbHex,
  SiMui,
  SiMuiHex,
  SiMysql,
  SiMysqlHex,
  SiNextdotjs,
  SiNextdotjsHex,
  SiNodedotjs,
  SiNodedotjsHex,
  SiPocketbase,
  SiPocketbaseHex,
  SiReact,
  SiReactHex,
  SiSupabase,
  SiSupabaseHex,
  SiTailwindcss,
  SiTailwindcssHex,
  SiTypescript,
  SiTypescriptHex,
} from '@icons-pack/react-simple-icons';

import createContrastForeground from 'utils/createContrastForeground';

import { DataSkills } from 'types/Common';

const dataSkills: DataSkills[] = [
  {
    name: 'Languages',
    description: 'Programming languages that I use',
    icon: 'Code',
    skills: [
      {
        name: 'Javascript',
        icon: SiJavascript,
        color: SiJavascriptHex,
        foreground: createContrastForeground(SiJavascriptHex),
      },
      {
        name: 'Typescript',
        icon: SiTypescript,
        color: SiTypescriptHex,
        foreground: createContrastForeground(SiTypescriptHex),
      },
    ],
  },
  {
    name: 'Frontend',
    description: 'Frontend technologies that I have used',
    icon: 'Laptop2',
    skills: [
      {
        name: 'React',
        icon: SiReact,
        color: SiReactHex,
        foreground: createContrastForeground(SiReactHex),
      },
      {
        name: 'Next.js',
        icon: SiNextdotjs,
        color: SiNextdotjsHex,
        foreground: createContrastForeground(SiNextdotjsHex),
      },
      {
        name: 'Astro',
        icon: SiAstro,
        color: SiAstroHex,
        foreground: createContrastForeground(SiAstroHex),
      },
      {
        name: 'Tailwind CSS',
        icon: SiTailwindcss,
        color: SiTailwindcssHex,
        foreground: createContrastForeground(SiTailwindcssHex),
      },
      {
        name: 'Material UI',
        icon: SiMui,
        color: SiMuiHex,
        foreground: createContrastForeground(SiMuiHex),
      },
    ],
  },
  {
    name: 'Backend',
    description: 'Backend technologies that I have used',
    icon: 'Database',
    skills: [
      {
        name: 'Node.js',
        icon: SiNodedotjs,
        color: SiNodedotjsHex,
        foreground: createContrastForeground(SiNodedotjsHex),
      },
      {
        name: 'Express',
        icon: SiExpress,
        color: SiExpressHex,
        foreground: createContrastForeground(SiExpressHex),
      },
      {
        name: 'MySQL',
        icon: SiMysql,
        color: SiMysqlHex,
        foreground: createContrastForeground(SiMysqlHex),
      },
      {
        name: 'MongoDB',
        icon: SiMongodb,
        color: SiMongodbHex,
        foreground: createContrastForeground(SiMongodbHex),
      },
      {
        name: 'Supabase',
        icon: SiSupabase,
        color: SiSupabaseHex,
        foreground: createContrastForeground(SiSupabaseHex),
      },
      {
        name: 'Pocketbase',
        icon: SiPocketbase,
        color: SiPocketbaseHex,
        foreground: createContrastForeground(SiPocketbaseHex),
      },
    ],
  },
  {
    name: 'Others',
    description: 'My skills that are not related to programming',
    icon: 'Layers',
    skills: [
      {
        name: 'Blender',
        icon: SiBlender,
        color: SiBlenderHex,
        foreground: createContrastForeground(SiBlenderHex),
      },
      {
        name: 'Adobe Photoshop',
        icon: SiAdobephotoshop,
        color: SiAdobephotoshopHex,
        foreground: createContrastForeground(SiAdobephotoshopHex),
      },
      {
        name: 'Adobe Illustrator',
        icon: SiAdobeillustrator,
        color: SiAdobeillustratorHex,
        foreground: createContrastForeground(SiAdobeillustratorHex),
      },
    ],
  },
];

export default dataSkills;
