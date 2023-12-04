import { colors, nextui } from '@nextui-org/react';
import type { Config } from 'tailwindcss';
import defaultColor from 'tailwindcss/colors';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  // Somehow these two are not generated, idk why
  safelist: ['col-span-2', 'col-span-4'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist)', 'var(--font-montserrat)', 'var(--font-kurenaido)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-jetbrains-mono)', ...defaultTheme.fontFamily.mono],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'login': 'url(/images/bg/login.svg)',
        'checked': 'url(/images/icon/checkmark.svg)',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    nextui({
      defaultTheme: 'dark',
      themes: {
        light: {
          colors: {
            primary: {
              DEFAULT: defaultColor.amber[400],
              50: defaultColor.amber[50],
              100: defaultColor.amber[100],
              200: defaultColor.amber[200],
              300: defaultColor.amber[300],
              400: defaultColor.amber[400],
              500: defaultColor.amber[500],
              600: defaultColor.amber[600],
              700: defaultColor.amber[700],
              800: defaultColor.amber[800],
              900: defaultColor.amber[900],
              foreground: colors.black,
            },
            secondary: {
              DEFAULT: defaultColor.blue[500],
              50: defaultColor.blue[50],
              100: defaultColor.blue[100],
              200: defaultColor.blue[200],
              300: defaultColor.blue[300],
              400: defaultColor.blue[400],
              500: defaultColor.blue[500],
              600: defaultColor.blue[600],
              700: defaultColor.blue[700],
              800: defaultColor.blue[800],
              900: defaultColor.blue[900],
              foreground: colors.white,
            },
            success: {
              DEFAULT: defaultColor.emerald[400],
            },
            warning: {
              DEFAULT: defaultColor.yellow[400],
            },
            danger: {
              DEFAULT: defaultColor.red[500],
            },
            focus: {
              DEFAULT: defaultColor.amber[400],
            },
          },
        },
        dark: {
          colors: {
            primary: {
              DEFAULT: defaultColor.orange[500],
              50: defaultColor.orange[900],
              100: defaultColor.orange[800],
              200: defaultColor.orange[700],
              300: defaultColor.orange[600],
              400: defaultColor.orange[500],
              500: defaultColor.orange[400],
              600: defaultColor.orange[300],
              700: defaultColor.orange[200],
              800: defaultColor.orange[100],
              900: defaultColor.orange[50],
              foreground: colors.black,
            },
            secondary: {
              DEFAULT: defaultColor.blue[600],
              50: defaultColor.blue[50],
              100: defaultColor.blue[100],
              200: defaultColor.blue[200],
              300: defaultColor.blue[300],
              400: defaultColor.blue[400],
              500: defaultColor.blue[500],
              600: defaultColor.blue[600],
              700: defaultColor.blue[700],
              800: defaultColor.blue[800],
              900: defaultColor.blue[900],
              foreground: colors.white,
            },
            success: {
              DEFAULT: defaultColor.emerald[400],
            },
            warning: {
              DEFAULT: defaultColor.yellow[400],
            },
            danger: {
              DEFAULT: defaultColor.red[500],
            },
            focus: {
              DEFAULT: defaultColor.orange[500],
            },
          },
        },
      },
    }),
    // Center max-width based on screen size
    function ({ addComponents, theme }: any) {
      const screens = theme('screens', {});
      const centerMax = Object.keys(screens).reduce((result: any, key: any) => {
        const value = screens[key];
        result[`.center-max-${key}`] = {
          width: '100%',
          maxWidth: value,
          marginLeft: 'auto',
          marginRight: 'auto',
        };
        return result;
      }, {});
      addComponents(centerMax);
    },
  ],
};
export default config;
