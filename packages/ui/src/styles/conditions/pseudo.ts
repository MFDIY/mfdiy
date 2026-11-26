export const pseudoConditions = {
  active: {
    selector: `&:active:not(.disabled, :disabled)`
  },
  disabled: {
    selector: `&.disabled, &:disabled`
  },
  focusWithin: {
    selector: `&:focus-within:not(:active, .disabled, :disabled)`
  },
  focusVisible: {
    selector: `&:focus-visible:not(:active, .disabled, :disabled)`
  },
  hover: {
    selector: `&:hover:not(:active, .disabled, :disabled)`
  },
  placeholder: {
    selector: `&::placeholder`
  }
} as const;
