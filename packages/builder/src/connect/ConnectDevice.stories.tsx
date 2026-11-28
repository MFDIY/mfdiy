import type { Meta, StoryObj } from '@storybook/react-vite';

import { Box } from '@mfdiy/ui/components';
import { useState, type ComponentProps } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ConnectDevice } from './ConnectDevice.js';

const phone = { viewport: { value: 'mobile2', isRotated: false } };

const profiles = [
  { id: 'k3j9x2m4', name: 'Cockpit left' },
  { id: 'p7q1z8w2', name: 'Shields and power' }
];

/** ConnectDevice is controlled; in a story, something has to hold the choices, like a page would. */
function Connect({
  address,
  onAddressChange,
  onProfileChange,
  profile,
  ...rest
}: ComponentProps<typeof ConnectDevice>) {
  const [chosenAddress, setChosenAddress] = useState(address);
  const [chosenProfile, setChosenProfile] = useState(profile);

  return (
    <ConnectDevice
      {...rest}
      address={chosenAddress}
      onAddressChange={next => {
        setChosenAddress(next);
        onAddressChange(next);
      }}
      onProfileChange={next => {
        setChosenProfile(next);
        onProfileChange(next);
      }}
      profile={chosenProfile}
    />
  );
}

const meta = {
  title: 'Builder/ConnectDevice',
  component: ConnectDevice,
  argTypes: {
    addresses: { control: false },
    profile: { control: { type: 'select' }, options: [null, ...profiles.map(profile => profile.id)] },
    profiles: { control: false }
  },
  args: {
    address: undefined,
    addresses: [],
    onAddressChange: fn(),
    onProfileChange: fn(),
    profile: null,
    profiles: []
  },
  // Keyed on the controls, so changing one in the controls panel starts the choices over.
  render: args => (
    <Box backgroundColor='surface' padding='6x'>
      <Connect {...args} key={`${args.address}-${args.profile}`} />
    </Box>
  )
} satisfies Meta<typeof ConnectDevice>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A gaming PC that isn't on a network has no address to show. */
export const Default = {} satisfies Story;

/** The usual case: one address on a home network, opening the list of profiles. */
export const HomeNetwork = {
  args: { addresses: ['http://192.168.1.20'], profiles }
} satisfies Story;

/** Opening a profile straight away, as from its own header. */
export const OpensAProfile = {
  args: { addresses: ['http://192.168.1.20'], profile: 'k3j9x2m4', profiles }
} satisfies Story;

/** A PC on more than one network (here a virtual machine's switch too) offers each address. */
export const MoreThanOneAddress = {
  args: { addresses: ['http://192.168.1.20:8420', 'http://172.20.0.1:8420'], profiles }
} satisfies Story;

export const Phone = {
  args: { addresses: ['http://192.168.1.20'], profiles },
  globals: phone
} satisfies Story;

/** Choosing a profile puts it in the code and the address. */
export const ChoosingAProfile = {
  args: { addresses: ['http://192.168.1.20'], profiles },
  tags: ['!dev', '!visual'],
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('combobox', { name: 'Opens' }));
    await userEvent.click(
      await within(canvasElement.ownerDocument.body).findByRole('option', { name: 'Shields and power' })
    );
    await expect(args.onProfileChange).toHaveBeenCalledWith('p7q1z8w2');
    await expect(canvas.getByText('http://192.168.1.20/p7q1z8w2')).toBeVisible();
    await expect(canvas.getByRole('img', { name: 'QR code that opens http://192.168.1.20/p7q1z8w2' })).toBeVisible();
  }
} satisfies Story;
