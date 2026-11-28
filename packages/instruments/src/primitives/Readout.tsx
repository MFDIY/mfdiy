import { Box } from '@mfdiy/ui/components';
import { useState } from 'react';

import { Frame } from './Frame.js';
import { Name } from './Name.js';
import * as styles from './Readout.css.js';

export const readoutStates = ['normal', 'warning', 'critical'] as const;

export type ReadoutState = (typeof readoutStates)[number];

/** A number split for display: its sign, the leading zeros drawn dim, then the digits that count (0022). */
export type ReadoutNumber = {
  digits: string;
  sign: string;
  value: number;
  zeros: string;
};

export type ReadoutProps = {
  label: string;
  /** Temporary: rolls each digit that changes into place, while ways to steady numbers are compared (0018). */
  rolling?: boolean | undefined;
  state?: ReadoutState | undefined;
  unit?: string | undefined;
  /** Text, left-aligned; or a number, right-aligned so its last digit and unit stay put (0022). */
  value: ReadoutNumber | string;
};

type Direction = 'down' | 'up';

function RollingCharacter({ character, direction, dim }: { character: string; dim: boolean; direction: Direction }) {
  const [roll, setRoll] = useState({ character, direction, previous: undefined as string | undefined, turn: 0 });

  if (roll.character !== character) {
    setRoll({ character, direction, previous: roll.character, turn: roll.turn + 1 });
  }

  return (
    <Box
      className={[styles.cell, dim ? styles.zeros : undefined]}
      data-direction={roll.direction}
      display='inline-block'
      overflow='hidden'
      position='relative'
      tagName='span'
    >
      {roll.previous === undefined ? null : (
        <Box
          aria-hidden
          className={styles.rollOut}
          inset='none'
          key={`out-${roll.turn}`}
          position='absolute'
          tagName='span'
        >
          {roll.previous}
        </Box>
      )}
      <Box
        className={roll.turn > 0 ? styles.rollIn : undefined}
        display='inline-block'
        key={`in-${roll.turn}`}
        tagName='span'
      >
        {roll.character}
      </Box>
    </Box>
  );
}

function RollingNumber({ number }: { number: ReadoutNumber }) {
  const [last, setLast] = useState({ direction: 'up' as Direction, value: number.value });
  const characters = [...(number.zeros + number.digits)];

  if (last.value !== number.value) {
    setLast({ direction: number.value > last.value ? 'up' : 'down', value: number.value });
  }

  return (
    <>
      {number.sign}
      {characters.map((character, index) => (
        <RollingCharacter
          character={character}
          dim={index < number.zeros.length}
          direction={last.direction}
          key={characters.length - index}
        />
      ))}
    </>
  );
}

/** A labelled value, e.g. speed or aUEC balance. */
export function Readout({ label, rolling = false, state = 'normal', unit, value }: ReadoutProps) {
  const number = typeof value === 'string' ? undefined : value;

  return (
    <Frame className={styles.readout} data-state={state} display='flex' flexDirection='column' justifyContent='center'>
      <Name className={styles.label}>{label}</Name>
      <Box
        className={styles.value}
        display='flex'
        justifyContent={number ? 'flex-end' : 'flex-start'}
        overflow='hidden'
      >
        {number === undefined ? (
          <Box overflow='hidden' tagName='span' textOverflow='ellipsis'>
            {value as string}
          </Box>
        ) : rolling ? (
          <RollingNumber number={number} />
        ) : (
          <>
            {number.sign}
            <Box className={styles.zeros} tagName='span'>
              {number.zeros}
            </Box>
            {number.digits}
          </>
        )}
        {unit ? (
          <Box className={styles.unit} flexShrink='0' tagName='span'>
            {unit}
          </Box>
        ) : null}
      </Box>
    </Frame>
  );
}
