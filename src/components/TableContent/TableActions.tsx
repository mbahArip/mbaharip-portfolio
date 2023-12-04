import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from '@nextui-org/react';
import { icons } from 'lucide-react';
import { Key, useMemo } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import Icon from 'components/Icons';

import { DbColor } from 'types/Supabase';

export type TableAction = {
  key: string;
  label: string;
  disabled?: boolean;
  icon?: keyof typeof icons;
  description?: string;
  color?: DbColor;
  className?: string;
  onAction: () => void;
};
interface TableActionsProps {
  onAction?: (key: Key) => void;
  disabledKeys?: string[];
  actions: TableAction[];
}
export default function TableActions(props: TableActionsProps) {
  const { onAction, actions, disabledKeys } = props;

  const disabled = useMemo(() => {
    return actions.filter((action) => action.disabled).map((action) => action.key);
  }, [actions]);

  return (
    <Dropdown aria-label='Actions'>
      <DropdownTrigger>
        <Button
          variant='light'
          isIconOnly
          size='sm'
        >
          <Icon
            name='MoreVertical'
            size={'sm'}
          />
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label='Actions menu'
        disabledKeys={disabled}
        onAction={(key) => {
          const action = actions.find((action) => action.key === key);
          if (!action || !action.onAction) {
            toast.error(`Action ${key} not found`);
            return;
          }
          action.onAction();
        }}
      >
        {actions.map((action) => (
          <DropdownItem
            aria-label={action.label}
            key={action.key}
            startContent={
              action.icon ? (
                <Icon
                  name={action.icon}
                  size={'sm'}
                />
              ) : undefined
            }
            color={action.color || undefined}
            className={twMerge(action.className)}
            textValue={action.label}
          >
            {action.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
