export const pseudoConditions = {
  active: {
    selector: `&:active:not(.disabled, :disabled)`
  },
  checked: {
    selector: `&:checked:not(.disabled, :disabled)`
  },
  disabled: {
    selector: `&.disabled, &:disabled`
  },
  focus: {
    selector: `&:focus:not(:active, .disabled, :disabled)`
  },
  focusWithin: {
    selector: `&:focus-within:not(:active, .disabled, :disabled)`
  },
  focusVisible: {
    selector: `&:focus-visible:not(:active, .disabled, :disabled)`
  },
  fullscreen: {
    selector: `&:fullscreen`
  },
  hover: {
    selector: `&:hover:not(:active, .disabled, :disabled)`
  },
  placeholder: {
    selector: `&::placeholder`
  }
} as const;
