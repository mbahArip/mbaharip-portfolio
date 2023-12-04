import { BlockNoteEditor, BlockSpec, SpecificBlock, defaultProps } from '@blocknote/core';
import { InlineContent, ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import { Checkbox } from '@nextui-org/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';

const PropSchema = {
  ...defaultProps,
  checked: {
    default: false,
    type: Boolean,
  },
};

export type TaskListSchema = ExtendBlockSchema<{
  tasklist: BlockSpec<'tasklist', typeof PropSchema, true>;
}>;

interface RenderProps {
  block: SpecificBlock<TaskListSchema, 'tasklist'>;
  editor: BlockNoteEditor<TaskListSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  const [isChecked, setIsChecked] = useState<boolean>(props.block.props.checked ?? false);

  useEffect(() => {
    props.editor.updateBlock(props.block, {
      type: 'tasklist',
      props: {
        checked: isChecked,
      },
    });
  }, [isChecked, props.block, props.editor]);

  return (
    <m.li
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.25,
        ease: 'easeInOut',
        type: 'tween',
      }}
      className='flex w-full items-center gap-2'
    >
      <div
        className='flex items-center rounded-sm'
        style={{
          justifyContent:
            props.block.props.textAlignment === 'center'
              ? 'center'
              : props.block.props.textAlignment === 'left'
              ? 'start'
              : 'end',
        }}
      >
        <Checkbox
          color='success'
          isSelected={isChecked}
          onChange={() => setIsChecked(!isChecked)}
        ></Checkbox>
        <InlineContent
          className={twMerge(
            props.block.props.checked && 'line-through opacity-50',
            'w-fit cursor-pointer select-none',
          )}
          style={{
            color: props.block.props.textColor,
          }}
          onClick={() => setIsChecked(!isChecked)}
        />
      </div>
    </m.li>
  );
}

const shortcut = undefined;
const keyword = '-[] ' as const;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'tasklist', typeof PropSchema, true, TaskListSchema>({
    type: 'tasklist' as const,
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      backgroundColor: defaultProps.backgroundColor,
      checked: {
        default: false,
        type: Boolean,
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
const createSlashMenu: ReactSlashMenuItem<TaskListSchema> = {
  name: 'Task List',
  execute: (editor: BlockNoteEditor<TaskListSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const isEmpty = (block.content! as any).length === 0;
    const isTaskList = block.type === 'tasklist';

    // if Empty, update the block to tasklist
    // if not empty, check if the block is tasklist
    // if tasklist, insert a new tasklist block, else update the block to tasklist
    if (isEmpty) {
      editor.updateBlock(block, {
        type: 'tasklist',
      });
    } else {
      if (isTaskList) {
        editor.insertBlocks(
          [
            {
              type: 'tasklist',
              props: {
                checked: false,
              },
              content: [],
            },
          ],
          editor.getTextCursorPosition().block,
          'after',
        );
        editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
      } else {
        editor.updateBlock(block, {
          type: 'tasklist',
        });
      }
    }

    // if (isEmpty) {
    //   editor.updateBlock(block, {
    //     type: 'tasklist',
    //     props: {
    //       checked: false,
    //     },
    //   });
    // } else {
    //   editor.insertBlocks(
    //     [
    //       {
    //         type: 'tasklist',
    //         props: {
    //           checked: false,
    //         },
    //         content: [],
    //       },
    //     ],
    //     editor.getTextCursorPosition().block,
    //     'after',
    //   );
    //   editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
    // }
  },
  aliases: ['tasklist', 'task'],
  group: c_blocks.List as const,
  icon: <Icon name='ListChecks' />,
  hint: 'Create a task list',
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
