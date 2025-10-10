
'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import * as React from 'react';
import { type SelectSingleEventHandler } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FormControl } from './form';

interface FormDatePickerProps {
  value?: Date;
  onSelect: SelectSingleEventHandler;
  disabled?: (date: Date) => boolean;
}

export const FormDatePicker = React.forwardRef<HTMLButtonElement, FormDatePickerProps>(
  ({ value, onSelect, disabled }, ref) => {
    return (
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              ref={ref}
              variant={'outline'}
              className={cn(
                'w-full pl-3 text-left font-normal',
                !value && 'text-muted-foreground'
              )}
            >
              {value ? format(value, 'PPP') : <span>Pick a date</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={value}
              onSelect={onSelect}
              disabled={disabled}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </FormControl>
    );
  }
);
FormDatePicker.displayName = 'FormDatePicker';
