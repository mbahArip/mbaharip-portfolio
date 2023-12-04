import { BlockNoteEditor, BlockSpec, SpecificBlock, defaultProps } from '@blocknote/core';
import { InlineContent, ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger } from '@nextui-org/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';
import { icons } from 'lucide-react';

import Icon from 'components/Icons';

import getNextUIColor from 'utils/nextui-color-var';

import type { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';
import { DbColor } from 'types/Supabase';

type AlertLevel = 'default' | 'info' | 'success' | 'warning' | 'danger';
const alertTypes: Record<
  AlertLevel,
  {
    icon: keyof typeof icons;
    color: string;
    backgroundColor: string;
    borderColor: string;
  }
> = {
  default: {
    icon: 'Info',
    color: getNextUIColor('foreground'),
    backgroundColor: getNextUIColor('content1'),
    borderColor: getNextUIColor('content2'),
  },
  info: {
    icon: 'Info',
    color: 'hsl(var(--nextui-secondary))',
    backgroundColor: 'hsl(var(--nextui-secondary)/0.175)',
    borderColor: 'hsl(var(--nextui-secondary)/0.4)',
  },
  success: {
    icon: 'CheckCircle2',
    color: 'hsl(var(--nextui-success))',
    backgroundColor: 'hsl(var(--nextui-success)/0.175)',
    borderColor: 'hsl(var(--nextui-success)/0.4)',
  },
  warning: {
    icon: 'AlertTriangle',
    color: 'hsl(var(--nextui-warning))',
    backgroundColor: 'hsl(var(--nextui-warning)/0.175)',
    borderColor: 'hsl(var(--nextui-warning)/0.4)',
  },
  danger: {
    icon: 'AlertCircle',
    color: 'hsl(var(--nextui-danger))',
    backgroundColor: 'hsl(var(--nextui-danger)/0.175)',
    borderColor: 'hsl(var(--nextui-danger)/0.4)',
  },
} as const;

const PropSchema = {
  ...defaultProps,
  type: {
    default: 'default' as const,
    values: ['default', 'info', 'success', 'warning', 'danger'] as const,
  },
};

export type AlertSchema = ExtendBlockSchema<{
  alert: BlockSpec<'alert', typeof PropSchema, true>;
}>;

interface RenderProps {
  block: SpecificBlock<AlertSchema, 'alert'>;
  editor: BlockNoteEditor<AlertSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  return (
    <m.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
        type: 'tween',
      }}
      className='mb-2 flex w-full flex-grow items-start gap-2 rounded-medium border-medium px-3 py-2'
      style={{
        backgroundColor: alertTypes[props.block.props.type as keyof typeof alertTypes].backgroundColor,
        borderColor: alertTypes[props.block.props.type as keyof typeof alertTypes].borderColor,
      }}
    >
      <Dropdown
        aria-label='Alert type'
        placement='bottom'
      >
        <DropdownTrigger>
          <Button
            isIconOnly
            variant='light'
            color={props.block.props.type === 'info' ? 'secondary' : (props.block.props.type as DbColor)}
            size='sm'
            isDisabled={!props.editor.isEditable}
            className='opacity-100'
          >
            <Icon name={alertTypes[props.block.props.type as keyof typeof alertTypes].icon} />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          onAction={(key) => {
            props.editor.updateBlock(props.block, {
              type: 'alert',
              props: { type: key as keyof typeof alertTypes },
            });
          }}
        >
          <DropdownSection title={'Alert type'}>
            {Object.entries(alertTypes).map(([key, value]) => (
              <DropdownItem
                key={key}
                classNames={{
                  base: 'capitalize',
                }}
              >
                {key}
              </DropdownItem>
            ))}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>

      <InlineContent
        className='flex-grow py-1'
        style={{
          color: alertTypes[props.block.props.type as keyof typeof alertTypes].color,
        }}
      />
    </m.div>
  );
}

const shortcut: CustomBlockData['shortcuts'] = {
  key: 'a',
  ctrlKey: true,
  shiftKey: true,
} as const;
const keyword = '!> ' as const;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'alert', typeof PropSchema, true, AlertSchema>({
    type: 'alert' as const,
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      backgroundColor: defaultProps.backgroundColor,
      type: {
        default: 'default' as const,
        values: ['default', 'info', 'success', 'warning', 'danger'] as const,
      },
    } as const,
    containsInlineContent: true,
    render: (props) => (
      <Render
        {...props}
        theme={theme}
      />
    ),
  });
}
const createSlashMenu: ReactSlashMenuItem<AlertSchema> = {
  name: 'Alert',
  execute: (editor: BlockNoteEditor<AlertSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'alert' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'alert',
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
      editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
    }
  },
  aliases: ['alert', 'info', 'success', 'warning', 'danger'],
  group: c_blocks.Blocks as const,
  icon: <Icon name='AlertCircle' />,
  hint: 'Used to emphasize important information',
  shortcut: `${shortcut.ctrlKey ? 'Ctrl+' : ''}${shortcut.shiftKey ? 'Shift+' : ''}${shortcut.key}`,
};

const blockData: CustomBlockData = {
  propSchema: PropSchema,
  components: Render,
  blockSchema: createBlock,
  slashMenu: createSlashMenu,
  shortcuts: shortcut,
  keywords: keyword,
};

export default blockData;
