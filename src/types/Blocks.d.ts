import { BlockSpec, DefaultBlockSchema, PropSchema } from '@blocknote/core';
import { ReactSlashMenuItem } from '@blocknote/react';

export type ExtendBlockSchema<T> = DefaultBlockSchema & T;

export interface CustomBlockData {
  propSchema: PropSchema;
  components: (props: any) => JSX.Element;
  blockSchema: (theme: 'light' | 'dark') => BlockSpec<any, any, any>;
  slashMenu: ReactSlashMenuItem<any>;
  shortcuts?: readonly {
    key: string;
    altKey?: boolean;
    ctrlKey?: boolean;
    shiftKey?: boolean;
  };
  keywords?: readonly string | readonly RegExp;
}

/**
 * Naming convention
 *
 * - PropSchema - The prop schema for the component
 * - [Component]Schema - The extended block schema for the component
 *
 * - RenderProps - The props for the component
 * - Render - The component itself
 *
 * - createBlock - The function that creates the block spec
 * - createSlashMenu - The slash command for the component
 * - shortcut - Array of keyboard shortcuts for the component
 * - keyword - Array of keywords for the component
 */
