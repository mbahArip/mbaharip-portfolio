import { BlockNoteEditor, BlockSpec, SpecificBlock } from '@blocknote/core';
import { ReactSlashMenuItem, createReactBlockSpec } from '@blocknote/react';
import {
  Button,
  Divider,
  Input,
  Listbox,
  ListboxItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollShadow,
} from '@nextui-org/react';
import c_blocks from 'constant/blocks';
import { motion as m } from 'framer-motion';
import hljs from 'highlight.js';
import { Key, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import Icon from 'components/Icons';

import { CustomBlockData, ExtendBlockSchema } from 'types/Blocks';
import { State } from 'types/Common';

const PropSchema = {
  code: {
    default: '' as const,
  },
  language: {
    default: 'plaintext' as const,
    value: [...hljs.listLanguages()] as const,
  },
};

export type CodeBlockSchema = ExtendBlockSchema<{
  codeblock: BlockSpec<'codeblock', typeof PropSchema, false>;
}>;

const defaultLang = hljs.listLanguages();
interface RenderProps {
  block: SpecificBlock<CodeBlockSchema, 'codeblock'>;
  editor: BlockNoteEditor<CodeBlockSchema>;
  theme: 'light' | 'dark';
}
function Render(props: RenderProps) {
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);
  const [isFocus, setIsFocus] = useState<boolean>(false);
  const [value, setValue] = useState<string>('');
  const [highlightValue, setHighlightValue] = useState<string>('');
  // const [language, setLanguage] = useState<Selection>(new Set([props.block.props.language ?? 'plaintext']));
  const [language, setLanguage] = useState<Key | null>(props.block.props.language ?? 'plaintext');

  useEffect(() => {
    if (textareaRef && isFocus) {
      textareaRef.focus();
    }
  }, [isFocus, textareaRef]);

  useEffect(() => {
    const isOutOfFocus = props.editor.getTextCursorPosition().block !== props.block;
    setIsFocus(!isOutOfFocus);
  }, [props]);

  useEffect(() => {
    // if (isFocus) return;
    const highlight = hljs.highlight(value, { language: language as string });
    setHighlightValue(highlight.value);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocus, props.block, value, language]);

  function Toolbar() {
    const [languages, setLanguages] = useState<Key[]>(defaultLang);
    const [languageFilter, setLanguageFilter] = useState<string>('');
    const [copyState, setCopyState] = useState<State>('idle');

    useEffect(() => {
      if (copyState === 'idle') return;

      const timeout = setTimeout(() => {
        setCopyState('idle');
      }, 2500);

      return () => clearTimeout(timeout);
    }, [copyState]);

    useEffect(() => {
      if (!languageFilter) return setLanguages(defaultLang);
      const filtered = defaultLang.filter((lang) => lang.toLowerCase().includes(languageFilter.toLowerCase()));
      setLanguages(filtered);
    }, [languageFilter]);
    return (
      <div className='absolute right-2 top-2 flex items-center gap-1 opacity-25 transition hover:opacity-100'>
        {props.editor.isEditable && (
          <Popover
            aria-label='Language'
            placement='bottom'
          >
            <PopoverTrigger>
              <Button
                size='sm'
                startContent={
                  <Icon
                    name='Code2'
                    size='sm'
                  />
                }
                endContent={
                  <Icon
                    name='ChevronDown'
                    size='sm'
                  />
                }
              >
                {language as string}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='flex flex-col gap-2'>
              <Input
                size='sm'
                variant='flat'
                placeholder='Search language'
                value={languageFilter}
                onValueChange={setLanguageFilter}
              />
              <Divider />
              <ScrollShadow className='max-h-[360px] w-full'>
                <Listbox
                  aria-label='Language list'
                  onAction={(key) => {
                    setLanguage(key as string);
                  }}
                >
                  {languages.map((lang) => (
                    <ListboxItem
                      key={lang}
                      textValue={lang as string}
                      className='capitalize'
                    >
                      {lang as string}
                    </ListboxItem>
                  ))}
                </Listbox>
              </ScrollShadow>
            </PopoverContent>
          </Popover>
        )}
        {navigator.clipboard && (
          <Button
            size='sm'
            color={copyState === 'idle' ? 'default' : copyState === 'success' ? 'success' : 'danger'}
            isIconOnly
            onPress={() => {
              if (copyState !== 'idle') return;
              try {
                if (!value) throw new Error('Nothing to copy');
                navigator.clipboard.writeText(value);
                setCopyState('success');
                toast.success('Copied to clipboard');
              } catch (error: any) {
                console.error(error);
                toast.error('Failed to copy to clipboard, check console for more info');
                setCopyState('error');
              }
            }}
          >
            <Icon
              name={copyState === 'idle' ? 'Copy' : copyState === 'success' ? 'Check' : 'X'}
              size='sm'
            />
          </Button>
        )}
      </div>
    );
  }

  if (!isFocus)
    return (
      <m.div
        initial={{
          opacity: 0,
          x: -40,
        }}
        animate={{
          opacity: 1,
          x: 0,
        }}
        exit={{
          opacity: 0,
        }}
        className='grid min-h-unit-24'
      >
        <div className='relative rounded-medium bg-background/25 px-4 py-3'>
          <Toolbar />
          <pre>
            <code
              className='whitespace-pre-wrap'
              dangerouslySetInnerHTML={{
                __html: highlightValue,
              }}
            />
          </pre>
        </div>
      </m.div>
    );

  return (
    <m.div
      initial={{
        opacity: 0,
        x: -40,
      }}
      animate={{
        opacity: 1,
        x: 0,
      }}
      exit={{
        opacity: 0,
      }}
      className='h-full min-h-unit-24 flex-grow'
    >
      <div className='relative h-full flex-grow rounded-medium bg-background/25 p-2'>
        <Toolbar />
        <div className='grid h-full max-h-[350px] flex-grow grid-cols-2 gap-2 overflow-auto'>
          <textarea
            value={value}
            ref={setTextareaRef}
            onChange={(e) => setValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                if (e.shiftKey) {
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const target = e.currentTarget;
                  const value = target.value;
                  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
                  const lineEnd = value.indexOf('\n', end);
                  const line = value.substring(lineStart, lineEnd);
                  if (line.startsWith('\t')) {
                    target.value = value.substring(0, lineStart) + line.substring(1) + value.substring(lineEnd);
                    target.selectionStart = target.selectionEnd = start - 1;
                    setValue(target.value);
                  }
                } else {
                  const start = e.currentTarget.selectionStart;
                  const end = e.currentTarget.selectionEnd;
                  const target = e.currentTarget;
                  const value = target.value;
                  target.value = value.substring(0, start) + '\t' + value.substring(end);
                  target.selectionStart = target.selectionEnd = start + 1;
                  setValue(target.value);
                }
              }
              if (e.shiftKey && e.key === 'Enter') {
                const block = props.editor.getTextCursorPosition();
                props.editor.setTextCursorPosition(block.nextBlock!);
                props.editor.focus();
              }
            }}
            placeholder='Enter code here...'
            className='h-full w-full flex-grow resize-none overflow-hidden rounded-medium bg-content1 px-2 py-1 outline-none'
          ></textarea>
          <pre className='h-full w-full resize-none bg-transparent px-2 py-1 outline-none'>
            <code
              contentEditable
              className='whitespace-pre-wrap'
              dangerouslySetInnerHTML={{
                __html: highlightValue,
              }}
            />
          </pre>
        </div>
      </div>
    </m.div>
  );

  // const listLanguages = useMemo(() => {
  //   const languages = hljs.listLanguages();
  //   const data = new Set(languages);
  //   return [...data];
  // }, []);
  // const [filterInput, setFilterInput] = useState<string>('');
  // const [filteredLanguages, setFilteredLanguages] = useState<string[]>(listLanguages);
  // const [filterOpen, setFilterOpen] = useState<boolean>(false);

  // const [language, setLanguage] = useState<string>(props.block.props.language ?? 'plaintext');
  // // const [language, setLanguage] = useState<Selection>(new Set([props.block.props.language, 'plaintext']));
  // const [codeRef, setCodeRef] = useState<HTMLElement | null>(null);

  // useEffect(() => {
  //   if (!codeRef) return;
  //   const highlight = async () => {
  //     if (!props.block.content?.length) return;
  //     const markdown = `${props.block.content
  //       .map((block) => {
  //         if (block.type === 'text') return block.text;
  //         return '';
  //       })
  //       .join('\n')}`;
  //     const highlight = hljs.highlight(language, markdown);
  //   };

  //   highlight();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [language, codeRef, props.block.content]);

  // useEffect(() => {
  //   if (!filterInput) return setFilteredLanguages(listLanguages);
  //   const filtered = listLanguages.filter((lang) => lang.includes(filterInput));
  //   setFilteredLanguages(filtered);
  // }, [filterInput, listLanguages]);

  // return (
  //   <m.div
  //     initial={{ opacity: 0, x: -40 }}
  //     animate={{ opacity: 1, x: 0 }}
  //     exit={{ opacity: 0 }}
  //     transition={{
  //       duration: 0.25,
  //       ease: 'easeInOut',
  //       type: 'tween',
  //     }}
  //     className='relative w-full flex-grow rounded-medium border-medium border-divider px-3 py-2'
  //   >
  //     <Popover
  //       placement='bottom'
  //       aria-label='Code language'
  //       classNames={{
  //         trigger: 'absolute top-2 right-2',
  //         base: 'px-3 py-2',
  //       }}
  //       isOpen={filterOpen}
  //       onOpenChange={setFilterOpen}
  //     >
  //       <PopoverTrigger>
  //         <Button
  //           variant='faded'
  //           size='sm'
  //           endContent={
  //             <Icon
  //               name='ChevronDown'
  //               size='sm'
  //             />
  //           }
  //           className='capitalize'
  //         >
  //           {language}
  //         </Button>
  //       </PopoverTrigger>
  //       <PopoverContent>
  //         <Input
  //           placeholder='Search language'
  //           value={filterInput}
  //           onChange={(e) => setFilterInput(e.target.value)}
  //         />
  //         <ScrollShadow className='max-h-[512px] w-full py-4'>
  //           <Listbox
  //             aria-label='Language-item'
  //             onAction={(key) => {
  //               setLanguage(key as string);
  //               setFilterOpen(false);
  //             }}
  //           >
  //             {filteredLanguages.map((lang) => (
  //               <ListboxItem
  //                 key={lang}
  //                 textValue={lang}
  //                 className='capitalize'
  //               >
  //                 {lang}
  //               </ListboxItem>
  //             ))}
  //           </Listbox>
  //         </ScrollShadow>
  //       </PopoverContent>
  //     </Popover>
  //     <pre id='code-wrapper'>
  //       <code
  //         id='highlight'
  //         ref={setCodeRef}
  //         className={`min-h-unit-24 whitespace-pre-wrap language-${language}`}
  //       >
  //         <InlineContent className='flex-grow' />
  //       </code>
  //     </pre>
  //   </m.div>
  // );
}

const shortcut: CustomBlockData['shortcuts'] = {
  key: 'c',
  ctrlKey: true,
  altKey: true,
  shiftKey: true,
} as const;
const keyword = '``` ' as const;
function createBlock(theme: 'light' | 'dark') {
  return createReactBlockSpec<'codeblock', typeof PropSchema, false, CodeBlockSchema>({
    type: 'codeblock' as const,
    propSchema: {
      code: {
        default: '' as const,
      },
      language: {
        default: 'plaintext' as const,
        value: [...hljs.listLanguages()] as const,
      },
    } as const,
    containsInlineContent: false,
    render: (props) => (
      <Render
        theme={theme}
        {...props}
      />
    ),
  });
}
const createSlashMenu: ReactSlashMenuItem<CodeBlockSchema> = {
  name: 'Code Block',
  execute: (editor: BlockNoteEditor<CodeBlockSchema>) => {
    const block = editor.getTextCursorPosition().block;
    const blockIsEmpty = block.content!.length === 0;

    if (blockIsEmpty) {
      editor.updateBlock(block, { type: 'codeblock' });
    } else {
      editor.insertBlocks(
        [
          {
            type: 'codeblock',
            // content: [{ type: 'text', text: '', styles: {} }],
          },
        ],
        editor.getTextCursorPosition().block,
        'after',
      );
      editor.setTextCursorPosition(editor.getTextCursorPosition().nextBlock!);
    }
  },
  aliases: ['code', 'code block', 'codeblock', 'code-block'],
  group: c_blocks.Blocks as const,
  icon: <Icon name='Code2' />,
  hint: 'Embed a code block with syntax highlighting',
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
