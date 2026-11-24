import * as v from 'valibot';

/**
 * Signals are MFDIY's game-agnostic view of telemetry. A game adapter maps the game's own data
 * to these, so widgets never depend on a specific game or patch.
 */
export const signalKinds = ['number', 'boolean', 'enum', 'string'] as const;

export type SignalKind = (typeof signalKinds)[number];

/** Dot-separated, lowercase identifier, e.g. `shields.front` or `fuel.quantum`. */
export const IdSchema = v.pipe(v.string(), v.regex(/^[a-z0-9]+(?:[.-][a-z0-9]+)*$/), v.maxLength(64));

const SignalBaseSchema = {
  id: IdSchema,
  label: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  /** Used to group signals in the builder's signal picker, e.g. `Shields`. */
  group: v.pipe(v.string(), v.minLength(1), v.maxLength(64))
};

export const NumberSignalSchema = v.object({
  ...SignalBaseSchema,
  kind: v.literal('number'),
  min: v.number(),
  max: v.number(),
  unit: v.optional(v.pipe(v.string(), v.maxLength(16)))
});

export const BooleanSignalSchema = v.object({
  ...SignalBaseSchema,
  kind: v.literal('boolean')
});

export const EnumSignalSchema = v.object({
  ...SignalBaseSchema,
  kind: v.literal('enum'),
  options: v.pipe(v.array(v.object({ value: IdSchema, label: v.pipe(v.string(), v.maxLength(64)) })), v.minLength(1))
});

export const StringSignalSchema = v.object({
  ...SignalBaseSchema,
  kind: v.literal('string')
});

export const SignalDefinitionSchema = v.variant('kind', [
  NumberSignalSchema,
  BooleanSignalSchema,
  EnumSignalSchema,
  StringSignalSchema
]);

export type SignalDefinition = v.InferOutput<typeof SignalDefinitionSchema>;

export type NumberSignal = v.InferOutput<typeof NumberSignalSchema>;

/** `null` means the game currently has no value for the signal (e.g. not seated in a ship). */
export const SignalValueSchema = v.union([v.number(), v.boolean(), v.string(), v.null()]);

export type SignalValue = v.InferOutput<typeof SignalValueSchema>;

export const SignalValuesSchema = v.record(IdSchema, SignalValueSchema);

export type SignalValues = v.InferOutput<typeof SignalValuesSchema>;

/** Something the MFD can ask the game to do, e.g. toggle landing gear. */
export const ActionDefinitionSchema = v.object({
  id: IdSchema,
  label: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  group: v.pipe(v.string(), v.minLength(1), v.maxLength(64)),
  /** Whether the action supports being held for a duration (`holdMs`). */
  holdable: v.boolean()
});

export type ActionDefinition = v.InferOutput<typeof ActionDefinitionSchema>;

export const GameInfoSchema = v.object({
  id: IdSchema,
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(64))
});

export type GameInfo = v.InferOutput<typeof GameInfoSchema>;
