import { defaultBlockSchema } from '@blocknote/core';
import '@blocknote/core/style.css';
import { BlockNoteView, Theme, darkDefaultTheme, getDefaultReactSlashMenuItems, useBlockNote } from '@blocknote/react';
import c_blocks from 'constant/blocks';

import Icon from 'components/Icons';

import getNextUIColor from 'utils/nextui-color-var';
import uploadFile from 'utils/uploadFile';

import { CustomBlockData } from 'types/Blocks';

import { Alert, Blockquote, CodeBlock, EmbedURL, File, HorizontalLine, Image, Snippet } from './Blocks';

interface MarkdownEditorProps {
  mode: 'edit' | 'view';
  content: string;
  onContentChange: (content: string) => void;
  markdownContent?: (md: string) => void;
}

const theme = {
  ...darkDefaultTheme,
  colors: {
    ...darkDefaultTheme.colors,
    editor: {
      background: 'transparent',
      text: getNextUIColor('foreground'),
    },
  },
  componentStyles: (theme) => ({
    Editor: {
      'minHeight': '50vh',
      'a': {
        color: getNextUIColor('primary'),
        cursor: 'pointer',
      },
      '[data-node-type="blockContainer"] *': {
        fontFamily: 'var(--font-geist)',
      },
    },
  }),
} satisfies Theme;

const customBlockSchema = {
  ...defaultBlockSchema,
  img: Image.blockSchema('dark'),
  file: File.blockSchema('dark'),
  embed_url: EmbedURL.blockSchema('dark'),
  alert: Alert.blockSchema('dark'),
  blockquote: Blockquote.blockSchema('dark'),
  snippet: Snippet.blockSchema('dark'),
  codeblock: CodeBlock.blockSchema('dark'),
  hr: HorizontalLine.blockSchema('dark'),
};

export default function MarkdownEditor(props: MarkdownEditorProps) {
  const slashMenuItems = () => {
    const defaultSlashMenuItems = getDefaultReactSlashMenuItems(customBlockSchema);
    const heading1Index = defaultSlashMenuItems.findIndex((item) => item.name === 'Heading');
    const heading2Index = defaultSlashMenuItems.findIndex((item) => item.name === 'Heading 2');
    const heading3Index = defaultSlashMenuItems.findIndex((item) => item.name === 'Heading 3');
    const paragraphIndex = defaultSlashMenuItems.findIndex((item) => item.name === 'Paragraph');
    const bulletListIndex = defaultSlashMenuItems.findIndex((item) => item.name === 'Bullet List');
    const numberedListIndex = defaultSlashMenuItems.findIndex((item) => item.name === 'Numbered List');
    const imageIndex = defaultSlashMenuItems.findIndex((item) => item.name === 'Image');

    // Update icon
    defaultSlashMenuItems[heading1Index].icon = <Icon name='Heading1' />;
    defaultSlashMenuItems[heading2Index].icon = <Icon name='Heading2' />;
    defaultSlashMenuItems[heading3Index].icon = <Icon name='Heading3' />;
    defaultSlashMenuItems[paragraphIndex].icon = <Icon name='Text' />;
    defaultSlashMenuItems[bulletListIndex].icon = <Icon name='List' />;
    defaultSlashMenuItems[numberedListIndex].icon = <Icon name='ListOrdered' />;
    defaultSlashMenuItems[imageIndex].icon = <Icon name='Image' />;

    // Update group
    defaultSlashMenuItems[heading1Index].group = c_blocks.Headings;
    defaultSlashMenuItems[heading2Index].group = c_blocks.Headings;
    defaultSlashMenuItems[heading3Index].group = c_blocks.Headings;
    defaultSlashMenuItems[paragraphIndex].group = c_blocks.Text;
    defaultSlashMenuItems[bulletListIndex].group = c_blocks.List;
    defaultSlashMenuItems[numberedListIndex].group = c_blocks.List;
    defaultSlashMenuItems[imageIndex].group = c_blocks.Media;

    // Hide item
    defaultSlashMenuItems.splice(imageIndex, 1);

    return defaultSlashMenuItems;
  };
  const editor = useBlockNote({
    initialContent: props.content ? JSON.parse(props.content) : undefined,
    enableBlockNoteExtensions: true,
    editable: props.mode === 'edit',
    domAttributes: {},
    onEditorReady(editor) {
      function createElement(
        shortcut: CustomBlockData['shortcuts'],
        event: KeyboardEvent,
        blocks: keyof typeof customBlockSchema,
      ) {
        if (!shortcut) return;
        const isCtrlOK = shortcut.ctrlKey ? event.ctrlKey : true;
        const isShiftOK = shortcut.shiftKey ? event.shiftKey : true;
        const isAltOK = shortcut.altKey ? event.altKey : true;
        const isKeyOK = shortcut.key ? event.key.toLowerCase() === shortcut.key.toLowerCase() : true;

        if (!isCtrlOK || !isShiftOK || !isAltOK || !isKeyOK) return;

        event.preventDefault();
        event.stopPropagation();

        const currentBlock = editor.getTextCursorPosition().block;
        const isEmpty = (currentBlock.content! as any).length === 0;

        if (isEmpty) {
          editor.updateBlock(currentBlock, { type: blocks });
        } else {
          editor.insertBlocks(
            [
              {
                type: blocks,
              },
            ],
            editor.getTextCursorPosition().block,
            'after',
          );
          editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
        }
      }
      editor.domElement.addEventListener('keydown', (e) => {
        createElement(Alert.shortcuts, e, 'alert');
        createElement(Blockquote.shortcuts, e, 'blockquote');
        createElement(Snippet.shortcuts, e, 'snippet');
        createElement(CodeBlock.shortcuts, e, 'codeblock');
      });
    },
    onEditorContentChange(editor) {
      props.onContentChange(JSON.stringify(editor.topLevelBlocks));

      function handleKeyword(
        keyword: string | RegExp,
        blockName: keyof typeof customBlockSchema,
        focusNext: boolean = false,
      ) {
        if (!keyword) return;
        const currentBlock = editor.getTextCursorPosition().block;
        // Check for the content of the current block
        if (currentBlock.type !== 'paragraph') return;
        const content = currentBlock.content?.length === 0 ? '' : (currentBlock.content?.[0] as any).text;

        if (content !== keyword) return;
        editor.updateBlock(currentBlock, {
          type: blockName,
          text: '',
          content: [],
        } as any);
        if (focusNext) {
          editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
        }
      }

      handleKeyword(Alert.keywords!, 'alert');
      handleKeyword(Blockquote.keywords!, 'blockquote');
      handleKeyword(Snippet.keywords!, 'snippet');
      handleKeyword(CodeBlock.keywords!, 'codeblock');
      handleKeyword(HorizontalLine.keywords!, 'hr', true);
    },
    uploadFile: async (file) => {
      return await uploadFile(file);
    },

    blockSchema: customBlockSchema,
    slashMenuItems: [
      ...slashMenuItems(),
      Image.slashMenu,
      File.slashMenu,
      EmbedURL.slashMenu,
      Alert.slashMenu,
      Blockquote.slashMenu,
      Snippet.slashMenu,
      CodeBlock.slashMenu,
      HorizontalLine.slashMenu,
    ],
  });
  return (
    <div className='w-full'>
      <BlockNoteView
        editor={editor}
        content={props.content ? JSON.parse(props.content) : []}
        theme={theme}
      >
        {/* <FormattingToolbarPositioner editor={editor} />
        <HyperlinkToolbarPositioner editor={editor} />
        <SlashMenuPositioner editor={editor} />
        <SideMenuPositioner
          editor={editor}
          sideMenu={CustomSideMenu as any}
        /> */}
      </BlockNoteView>
    </div>
  );
}
