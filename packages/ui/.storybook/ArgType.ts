export type ArgType = {
  description: string;
  control: 'select';
  options: (undefined | string)[];
  table: {
    category?: 'Style Props';
    type: { summary: string };
  };
};
