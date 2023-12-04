import { Table, TableBody, TableCell, TableColumn, TableHeader, TableProps, TableRow } from '@nextui-org/react';
import { useId, useMemo } from 'react';

export type TableContentColumnProps<T> = {
  key: keyof T | 'actions';
  label: string;
  width?: number;
  allowSort?: boolean;
  align?: 'center' | 'start' | 'end';
  hide?: boolean;
};
export type TableContentRowProps<T> = {
  key: keyof T | 'actions';
  render: (item: T) => JSX.Element;
};

interface TableContentProps<Data> {
  tableProps?: TableProps;
  columns: TableContentColumnProps<Data>[];
  rows: TableContentRowProps<Data>[];
  items: Data[];
  isLoading?: boolean;
  emptyContent?: string;
  actions?: (item: Data) => JSX.Element;
}
export default function TableContent(props: TableContentProps<any>) {
  const { tableProps, columns: _columns, rows: _rows, items, isLoading, emptyContent, actions } = props;
  const id = useId();

  const columns = useMemo(() => {
    const colTemp = _columns;

    if (actions !== undefined) {
      colTemp.push({
        key: 'actions',
        label: 'ACTIONS',
        width: 24,
        allowSort: false,
        hide: true,
      });
    }

    const uniqueColumns = colTemp.filter(
      (column, index, self) => self.findIndex((c) => c.key === column.key) === index,
    );

    return uniqueColumns;
  }, [_columns, actions]);
  const rows = useMemo(() => {
    const rowTemp = _rows;

    if (actions !== undefined) {
      rowTemp.push({
        key: 'actions',
        render: (item) => actions(item),
      });
    }

    const uniqueRows = rowTemp.filter((row, index, self) => self.findIndex((r) => r.key === row.key) === index);

    return uniqueRows;
  }, [_rows, actions]);

  return (
    <Table
      id={id}
      key={id}
      {...tableProps}
    >
      <TableHeader key={`${id}-header`}>
        {columns.map((column) => (
          <TableColumn
            key={column.key as string}
            width={column.width || undefined}
            align={column.align}
            allowsSorting={column.allowSort}
            hideHeader={column.hide}
          >
            {column.label}
          </TableColumn>
        ))}
      </TableHeader>
      <TableBody
        key={`${id}-body`}
        items={items}
        isLoading={isLoading}
        emptyContent={emptyContent}
      >
        {(item) => (
          <TableRow
            key={item.id}
            aria-label={`row-${item.id}`}
            textValue={item.id}
          >
            {rows.map((row) => (
              <TableCell key={row.key as string}>{row.render(item)}</TableCell>
            ))}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
