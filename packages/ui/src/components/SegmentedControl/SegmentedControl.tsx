import { Button } from '../Button/Button.js';
import { ButtonGroup } from '../ButtonGroup/ButtonGroup.js';

export type SegmentedControlOptionProps<T = string> = {
  label: string;
  value: T;
};

type Props<T> = {
  /** Fires with the selected option value. */
  onChange: (value: T) => void;
  /** The list of options to display. */
  options: ReadonlyArray<SegmentedControlOptionProps<T>>;
  /** The currently selected option value. */
  value: T;
};

export function SegmentedControl<T extends string>({ onChange, options, value }: Props<T>) {
  return (
    <ButtonGroup elevation='depressed'>
      {options.map(option => (
        <Button
          aria-pressed={option.value === value}
          key={option.value}
          onClick={() => onChange(option.value)}
          size='large'
          variant={option.value === value ? undefined : 'transparent'}
        >
          {option.label}
        </Button>
      ))}
    </ButtonGroup>
  );
}
