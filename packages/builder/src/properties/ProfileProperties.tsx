import type { MfdDocument, ScreenFit } from '@mfdiy/schema';

import { MAX_DOCUMENT_NAME_LENGTH } from '@mfdiy/schema';
import { Box, SegmentedControl, Stack, Text, TextField, usePanelForm } from '@mfdiy/ui/components';
import { useState } from 'react';

import { ShapeField } from './ShapeField.js';
import { Typing, useTyping } from './fields.js';

/** What the profile's settings change: its name and shape, and how displays use the shape (0006). */
export type ProfileSettings = Pick<MfdDocument, 'fit' | 'name' | 'shape'>;

const fitItems = [
  { label: 'Keep shape', value: 'contain' },
  { label: 'Stretch', value: 'stretch' }
] as const satisfies readonly { label: string; value: ScreenFit }[];

export type ProfilePropertiesProps = {
  /** `merge` names a run of typing in one field; changes with the same one are one undo step (0023). */
  onChange: (profile: ProfileSettings, merge?: string) => void;
  profile: ProfileSettings;
};

/**
 * What the panel shows after pressing the canvas's label (0006, 0023): the profile's name, its
 * shape, and what a display does on a screen of another shape. Changing the shape leaves every
 * page's grid as it is; pages added later get square-ish cells for the new shape.
 */
export function ProfileProperties({ onChange, profile }: ProfilePropertiesProps) {
  const typing = useTyping('profile', profile);
  const sidebar = usePanelForm() === 'sidebars';
  /** The name as typed; an empty one isn't saved, as a profile always has a name, and goes on leaving. */
  const [draft, setDraft] = useState<string | null>(null);

  return (
    <Box>
      {sidebar ? (
        <Box alignItems='center' display='flex' height='control' paddingBottom='4x'>
          <Text tagName='h2' truncate variant='heading'>
            Profile
          </Text>
        </Box>
      ) : null}
      <Stack spacing='5x'>
        <Box
          onBlur={event => {
            setDraft(null);
            typing.onBlur(event);
          }}
        >
          <TextField
            label='Name'
            maxLength={MAX_DOCUMENT_NAME_LENGTH}
            onChange={name => {
              setDraft(name);

              if (name.trim() !== '') {
                onChange({ ...profile, name }, typing.merge('name'));
              }
            }}
            placeholder={profile.name}
            value={draft ?? profile.name}
          />
        </Box>
        <Typing onBlur={typing.onBlur}>
          <ShapeField
            onChange={shape => onChange({ ...profile, shape }, typing.merge('shape'))}
            value={profile.shape}
          />
        </Typing>
        <SegmentedControl
          description='On a screen of another shape, a display keeps this shape with bars beside or above it, or stretches the pages to fill the screen.'
          items={fitItems}
          label='Other screens'
          onChange={fit => onChange({ ...profile, fit: fit === 'stretch' ? 'stretch' : 'contain' })}
          value={profile.fit}
        />
      </Stack>
    </Box>
  );
}
