import type { TokenValues } from '@mfdiy/schema';

import { widgetManifests } from '@mfdiy/instruments';
import { Box, Button, Popover, Stack, Text, TextField, type PopoverPosition } from '@mfdiy/ui/components';
import { useState } from 'react';

import * as styles from './Palette.css.js';
import { WidgetPreview } from './WidgetPreview.js';
import { groupChoices, listChoices, type Catalogue, type NewWidget } from './choices.js';

export type PaletteProps = {
  catalogue: Catalogue;
  documentTokens?: TokenValues | undefined;
  pageTokens?: TokenValues | undefined;
  position: PopoverPosition;
  /** The widget type being added; null while it's still to be picked. */
  type: string | null;
  onAdd: (widget: NewWidget) => void;
  onClose: () => void;
  onTypeChange: (type: string | null) => void;
};

/** Adds a widget: pick one by its looks, then what it shows or does (0006). */
export function Palette({
  catalogue,
  documentTokens,
  pageTokens,
  position,
  type,
  onAdd,
  onClose,
  onTypeChange
}: PaletteProps) {
  const [search, setSearch] = useState('');

  const manifest = type === null ? undefined : widgetManifests[type];
  const choices = manifest && listChoices(manifest, catalogue);

  if (!manifest || !choices) {
    return (
      <Popover onClose={onClose} position={position} title='Add a widget'>
        <Box className={styles.tiles} display='grid' gap='4x'>
          {Object.values(widgetManifests).map(candidate => (
            <Box borderRadius='2x' key={candidate.type} overflow='hidden' position='relative'>
              <WidgetPreview documentTokens={documentTokens} manifest={candidate} pageTokens={pageTokens} />
              <Box backgroundColor='elevation.raised' padding='3x'>
                <Text variant='body'>{candidate.label}</Text>
              </Box>
              {/* Covers the preview, which can contain a button of its own. */}
              <Box
                appearance='none'
                aria-label={candidate.label}
                backgroundColor='transparent'
                borderStyle='hidden'
                cursor='pointer'
                height='full'
                inset='none'
                onClick={() => {
                  if (listChoices(candidate, catalogue)) {
                    setSearch('');
                    onTypeChange(candidate.type);
                  } else {
                    onAdd({ type: candidate.type });
                  }
                }}
                outlineColor='focus-ring'
                outlineOffset='none'
                outlineStyle={{ default: 'none', focusVisible: 'solid' }}
                outlineWidth='focus-ring'
                padding='none'
                position='absolute'
                tagName='button'
                title={candidate.description}
                type='button'
                width='full'
              />
            </Box>
          ))}
        </Box>
      </Popover>
    );
  }

  const groups = groupChoices(choices, search);
  const [input] = Object.values(manifest.inputs);

  return (
    <Popover
      action={
        <Button aria-label='Back to widgets' onClick={() => onTypeChange(null)} size='large' variant='transparent'>
          ‹
        </Button>
      }
      onClose={onClose}
      position={position}
      title={manifest.label}
    >
      <TextField label={input ? input.label : 'Does'} onChange={setSearch} placeholder='Search' value={search} />
      <Box>
        <Button onClick={() => onAdd({ type: manifest.type })} size='large'>
          Skip, choose later
        </Button>
      </Box>
      {groups.length === 0 ? (
        <Text variant='body'>
          {choices.length === 0 ? 'The bridge hasn’t sent anything to choose from yet.' : 'Nothing found.'}
        </Text>
      ) : null}
      {groups.map(group => (
        <Stack key={group.name} spacing='2x' tagName='section'>
          <Text tagName='h3' variant='panel.header'>
            {group.name}
          </Text>
          {group.choices.map(choice => (
            <Button
              justifyContent='flex-start'
              key={choice.id}
              onClick={() => onAdd(choice.widget)}
              size='large'
              width='full'
            >
              {choice.label}
            </Button>
          ))}
        </Stack>
      ))}
    </Popover>
  );
}
