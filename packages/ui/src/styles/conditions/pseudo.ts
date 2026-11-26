/**
 * Later conditions win when several match, so the order matters: a focused field that is also
 * hovered keeps its focus style.
 */
export const pseudoConditions = {
  active: {
    selector: `&:active:not(.disabled, :disabled)`
  },
  disabled: {
    selector: `&.disabled, &:disabled`
  },
  hover: {
    selector: `&:hover:not(:active, .disabled, :disabled)`
  },
  focusWithin: {
    selector: `&:focus-within:not(:active, .disabled, :disabled)`
  },
  focusVisible: {
    selector: `&:focus-visible:not(:active, .disabled, :disabled)`
  },
  placeholder: {
    selector: `&::placeholder`
  }
} as const;
