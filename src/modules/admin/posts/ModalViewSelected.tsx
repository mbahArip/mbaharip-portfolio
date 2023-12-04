import { Button, Chip, Image, ModalBody, ModalFooter, ModalHeader } from '@nextui-org/react';
import c from 'constant';

import TableContent, { TableContentColumnProps, TableContentRowProps } from 'components/TableContent';

import { formatDate } from 'utils/dataFormatter';
import getNextUIColor from 'utils/nextui-color-var';
import { parseMediaUrl } from 'utils/parser';

import { DbSchemaPost } from 'types/Supabase';

interface AdminPost_ModalViewSelectedProps {
  data: DbSchemaPost[];
  isLoading: boolean;
  onClose: () => void;
}
const contentColumns: TableContentColumnProps<DbSchemaPost>[] = [
  {
    key: 'thumbnail_attachment',
    label: 'THUMBNAIL',
    width: 128,
  },
  {
    key: 'title',
    label: 'TITLE',
    allowSort: true,
  },
  {
    key: 'category',
    label: 'CATEGORY',
    allowSort: true,
  },
  {
    key: 'status',
    label: 'STATUS',
    allowSort: true,
  },
  {
    key: 'created_at',
    label: 'CREATED AT',
    allowSort: true,
  },
];
export default function mod_AdminPost_ModalViewSelected({
  data,
  isLoading,
  onClose,
}: AdminPost_ModalViewSelectedProps) {
  const contentRows: TableContentRowProps<DbSchemaPost>[] = [
    {
      key: 'thumbnail_attachment',
      render(item) {
        return (
          <Image
            src={item.thumbnail_attachment ? parseMediaUrl(item.thumbnail_attachment) : c.PLACEHOLDER_IMAGE}
            alt={item.thumbnail_attachment ? item.thumbnail_attachment.name : 'No thumbnail'}
            radius='sm'
            removeWrapper
            className='h-full max-h-14 w-full object-contain'
          />
        );
      },
    },
    {
      key: 'title',
      render(item) {
        return <span>{item.title}</span>;
      },
    },
    {
      key: 'category',
      render(item) {
        if (!item.category) return <span className='text-tiny text-default-500'>Uncategorized</span>;

        return (
          <Chip
            size='sm'
            key={item.category.id}
            variant='dot'
            classNames={{
              base: 'bg-[var(--chip-bg)] !border-transparent',
              dot: 'bg-[var(--chip-color)]',
            }}
            style={
              {
                '--chip-bg': item.category.color ? `${item.category.color}33` : getNextUIColor('default', 0.2),
                '--chip-color': item.category.color ?? getNextUIColor('default'),
              } as React.CSSProperties
            }
          >
            {item.category.title}
          </Chip>
        );
      },
    },
    {
      key: 'status',
      render(item) {
        let color: { bg: string; dot: string } = {
          bg: getNextUIColor('default', 0.2),
          dot: getNextUIColor('default'),
        };
        let text = 'Published';
        switch (item.status) {
          case 'published':
            color = {
              bg: getNextUIColor('success', 0.2),
              dot: getNextUIColor('success'),
            };
            text = 'Published';
            break;
          case 'draft':
            color = {
              bg: getNextUIColor('warning', 0.2),
              dot: getNextUIColor('warning'),
            };
            text = 'Draft';
            break;
          case 'unpublished':
            color = {
              bg: getNextUIColor('danger', 0.2),
              dot: getNextUIColor('danger'),
            };
            text = 'Archived';
            break;
          case 'flagged':
            color = {
              bg: getNextUIColor('danger', 0.2),
              dot: getNextUIColor('danger'),
            };
            text = 'Flagged';
            break;
        }

        return (
          <Chip
            size='sm'
            variant='dot'
            key={item.status}
            classNames={{
              base: 'bg-[var(--chip-bg)] !border-transparent',
              dot: 'bg-[var(--chip-color)]',
            }}
            style={
              {
                '--chip-bg': color.bg,
                '--chip-color': color.dot,
              } as React.CSSProperties
            }
          >
            {text}
          </Chip>
        );
      },
    },
    {
      key: 'created_at',
      render(item) {
        return (
          <span>
            {formatDate(item.updated_at, {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <ModalHeader>Selected posts</ModalHeader>
      <ModalBody>
        <TableContent
          columns={contentColumns}
          rows={contentRows}
          items={data}
          isLoading={isLoading}
          emptyContent={'No posts selected'}
          tableProps={{
            'aria-label': 'Selected posts',
            'removeWrapper': true,
            'isHeaderSticky': true,
            'classNames': {
              base: 'max-h-[480px] overflow-y-auto',
            },
          }}
        />
      </ModalBody>
      <ModalFooter>
        <Button
          variant='flat'
          color='default'
          onPress={onClose}
        >
          Close
        </Button>
      </ModalFooter>
    </>
  );
}
