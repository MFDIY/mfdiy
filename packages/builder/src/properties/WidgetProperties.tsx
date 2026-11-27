import type { PickItem } from './PickList.js';
import type { Merge } from './fields.js';
import type { Catalogue } from '../palette/choices.js';
import type { Area, Layout, Page, TokenValues, WidgetInstance } from '@mfdiy/schema';

import { acceptsSignal, widgetManifests, type OptionSpec, type WidgetManifest } from '@mfdiy/instruments';
import { bindingFor, duplicateWidget, removeWidget } from '@mfdiy/schema';
import {
  Accordion,
  Bleed,
  Box,
  Button,
  Columns,
  Dialog,
  Group,
  IconButton,
  NumberField,
  PanelTask,
  Stack,
  Switch,
  Text,
  TextField,
  usePanelForm,
  type PanelTaskContent
} from '@mfdiy/ui/components';
import { useState } from 'react';

import { WidgetPreview } from '../palette/WidgetPreview.js';

import { InputFields } from './InputFields.js';
import { PickList } from './PickList.js';
import { placeWidget, swapType, updateWidget, withAction, withBinding, withOption, type TypeSwap } from './editing.js';
import { OpensRow, Section, Typing, useTyping } from './fields.js';
import { inputSummary } from './inputs.js';
import { widgetTitle } from './title.js';

export type WidgetPropertiesProps = {
  catalogue: Catalogue;
  documentTokens: TokenValues | undefined;
  layout: Layout;
  manifest: WidgetManifest;
  onChange: (page: Page, merge?: string) => void;
  onSelect: (id: string | null) => void;
  page: Page;
  widget: WidgetInstance;
};

/** A side task that replaces the properties for a moment (0008). */
type Picking = { kind: 'action' } | { kind: 'signal'; input: string } | { kind: 'type' };

const manifests = Object.values(widgetManifests).sort((a, b) => a.label.localeCompare(b.label));

const NO_ACTION = 'none';

/** The properties of one widget (0023), generated from its manifest. Key it by the widget's id. */
export function WidgetProperties({
  catalogue,
  documentTokens,
  layout,
  manifest,
  onChange,
  onSelect,
  page,
  widget
}: WidgetPropertiesProps) {
  const [picking, setPicking] = useState<Picking | null>(null);
  const [swap, setSwap] = useState<TypeSwap | null>(null);
  const area = layout.areas[widget.id];
  const typing = useTyping(widget.id, area);
  const title = widgetTitle(widget, catalogue);
  const sidebar = usePanelForm() === 'sidebars';
  const tokens = { documentTokens, pageTokens: page.tokens };

  function change(next: (current: WidgetInstance) => WidgetInstance, merge?: string) {
    onChange(updateWidget(page, widget.id, next), merge);
  }

  function duplicate() {
    const copy = duplicateWidget(page, layout, widget.id);

    onChange(copy.page);
    onSelect(copy.id);
  }

  function remove() {
    onChange(removeWidget(page, widget.id));
    onSelect(null);
  }

  function pickType(type: string) {
    const to = widgetManifests[type];

    setPicking(null);

    if (!to || to.type === widget.type) {
      return;
    }

    const next = swapType(widget, manifest, to, catalogue);

    if (next.lost.length > 0) {
      setSwap(next);
    } else {
      change(() => next.widget);
    }
  }

  function pickSignal(input: string, id: string) {
    const signal = catalogue.signals.find(candidate => candidate.id === id);

    setPicking(null);

    if (signal && widget.bindings?.[input]?.signal !== id) {
      change(current => withBinding(current, input, bindingFor(signal)));
    }
  }

  function pickAction(id: string) {
    setPicking(null);
    change(current => withAction(current, id === NO_ACTION ? undefined : id));
  }

  function pickTask(current: Picking): PanelTaskContent {
    if (current.kind === 'type') {
      const shown = catalogue.signals.find(
        candidate => candidate.id === Object.values(widget.bindings ?? {})[0]?.signal
      );
      const items = manifests.map((candidate): PickItem => {
        const { lost } = swapType(widget, manifest, candidate, catalogue);
        const fits = shown && Object.values(candidate.inputs).some(spec => acceptsSignal(spec, shown));

        return {
          id: candidate.type,
          label: candidate.label,
          description:
            candidate.type === widget.type ? 'Current' : lost.length > 0 ? `Drops ${lost.join(', ')}` : undefined,
          preview: (
            <WidgetPreview
              {...tokens}
              label={fits ? shown.label : undefined}
              manifest={candidate}
              signal={fits ? shown : undefined}
            />
          )
        };
      });

      return {
        title: 'Type',
        content: (
          <PickList
            back={title}
            emptyText='No widgets.'
            items={items}
            label='Widget type'
            onBack={() => setPicking(null)}
            onPick={pickType}
          />
        )
      };
    }

    if (current.kind === 'signal') {
      const spec = manifest.inputs[current.input];
      const items = catalogue.signals
        .filter(signal => spec !== undefined && acceptsSignal(spec, signal))
        .map((signal): PickItem => ({
          id: signal.id,
          label: signal.label,
          group: signal.group,
          preview: <WidgetPreview {...tokens} label={signal.label} manifest={manifest} signal={signal} />
        }));
      const input = current.input;

      return {
        title: spec?.label ?? 'Data',
        content: (
          <PickList
            back={title}
            emptyText='Nothing to connect this to. Is the bridge running?'
            items={items}
            label={spec?.label ?? 'Data'}
            onBack={() => setPicking(null)}
            onPick={id => pickSignal(input, id)}
          />
        )
      };
    }

    const optional = Object.keys(manifest.inputs).length > 0;
    const items: PickItem[] = [
      ...(optional ? [{ id: NO_ACTION, label: 'No action', description: 'Only shows its data' }] : []),
      ...catalogue.actions.map(({ id, label, group }) => ({ id, label, group }))
    ];

    return {
      title: 'Action',
      content: (
        <PickList
          back={title}
          emptyText='No actions to trigger. Is the bridge running?'
          items={items}
          label='Action'
          onBack={() => setPicking(null)}
          onPick={pickAction}
        />
      )
    };
  }

  const inputs = Object.entries(manifest.inputs);
  const options = Object.entries(manifest.options);
  const action = catalogue.actions.find(candidate => candidate.id === widget.action);
  const defaultLabel =
    catalogue.signals.find(candidate => candidate.id === Object.values(widget.bindings ?? {})[0]?.signal)?.label ??
    action?.label ??
    manifest.label;

  function optionField(key: string, spec: OptionSpec, merge: Merge) {
    const value = widget.options?.[key] ?? spec.default;

    switch (spec.type) {
      case 'boolean':
        return (
          <Switch
            checked={value === true}
            key={key}
            label={spec.label}
            onChange={checked => change(current => withOption(current, key, checked))}
          />
        );
      case 'number':
        return (
          <Typing key={key} onBlur={typing.onBlur}>
            <NumberField
              label={spec.label}
              max={spec.max}
              min={spec.min}
              onChange={next => change(current => withOption(current, key, next ?? undefined), merge(key))}
              value={typeof value === 'number' ? value : null}
            />
          </Typing>
        );
      case 'string':
        return (
          <Typing key={key} onBlur={typing.onBlur}>
            <TextField
              clearable
              label={spec.label}
              maxLength={64}
              onChange={next => change(current => withOption(current, key, next || undefined), merge(key))}
              placeholder={key === 'label' ? defaultLabel : undefined}
              value={typeof value === 'string' ? value : ''}
            />
          </Typing>
        );
    }
  }

  function placeField(field: keyof Area, label: string) {
    return (
      <Typing onBlur={typing.onBlur}>
        <NumberField
          label={label}
          max={field === 'column' || field === 'columnSpan' ? layout.grid.columns : layout.grid.rows}
          min={1}
          onChange={value => {
            const base = typing.base();

            if (value !== null && base) {
              onChange(placeWidget(page, layout, widget.id, { ...base, [field]: value }), typing.merge(field));
            }
          }}
          value={area?.[field] ?? null}
        />
      </Typing>
    );
  }

  return (
    <PanelTask onClose={() => setPicking(null)} task={picking ? pickTask(picking) : null}>
      <Box>
        <Box flexShrink='0' paddingBottom='4x'>
          {sidebar ? (
            <Box alignItems='center' display='flex' gap='2x' height='control'>
              <Box flexGrow='1' minWidth='none'>
                <Text tagName='h2' truncate variant='heading'>
                  {title}
                </Text>
              </Box>
              <IconButton icon='content_copy' label='Duplicate' onClick={duplicate} />
              <IconButton icon='delete' label='Remove' onClick={remove} />
            </Box>
          ) : (
            <Columns spacing='3x'>
              <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                <Button icon='content_copy' onClick={duplicate} width='full'>
                  Duplicate
                </Button>
              </Box>
              <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                <Button icon='delete' onClick={remove} width='full'>
                  Remove
                </Button>
              </Box>
            </Columns>
          )}
        </Box>
        <Stack dividers spacing='5x'>
          <OpensRow
            empty={widget.type}
            label='Type'
            onOpen={() => setPicking({ kind: 'type' })}
            value={manifest.label}
          />
          {inputs.length > 0 ? (
            <Group title='Data'>
              <Bleed bottom='3x' horizontal='3x'>
                <Accordion
                  defaultOpen={inputs.length === 1 ? inputs.map(([name]) => name) : []}
                  items={inputs.map(([name, spec]) => {
                    const binding = widget.bindings?.[name];
                    const signal = catalogue.signals.find(candidate => candidate.id === binding?.signal);

                    return {
                      content: (
                        <InputFields
                          binding={binding}
                          input={name}
                          merge={typing.merge}
                          onBlur={typing.onBlur}
                          onChange={(next, merge) => change(current => withBinding(current, name, next), merge)}
                          onPick={() => setPicking({ kind: 'signal', input: name })}
                          signal={signal}
                        />
                      ),
                      label: spec.label,
                      summary: inputSummary(binding, signal),
                      value: name
                    };
                  })}
                />
              </Bleed>
            </Group>
          ) : null}
          {manifest.actionable ? (
            <OpensRow
              description={inputs.length > 0 ? 'Pressing it triggers this.' : undefined}
              empty={inputs.length > 0 ? 'No action' : 'Not connected'}
              label='Action'
              onOpen={() => setPicking({ kind: 'action' })}
              value={action?.label ?? widget.action}
            />
          ) : null}
          {options.length > 0 ? (
            <Section title='Options'>{options.map(([key, spec]) => optionField(key, spec, typing.merge))}</Section>
          ) : null}
          {area ? (
            <Section title='Place'>
              <Columns spacing='3x'>
                <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                  {placeField('column', 'Column')}
                </Box>
                <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                  {placeField('row', 'Row')}
                </Box>
              </Columns>
              <Columns spacing='3x'>
                <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                  {placeField('columnSpan', 'Width')}
                </Box>
                <Box flexBasis='fluid' flexGrow='1' minWidth='none'>
                  {placeField('rowSpan', 'Height')}
                </Box>
              </Columns>
            </Section>
          ) : null}
        </Stack>
        {swap ? (
          <Dialog
            actions={
              <>
                <Button
                  onClick={() => {
                    change(() => swap.widget);
                    setSwap(null);
                  }}
                  variant='primary'
                >
                  Change to {widgetManifests[swap.widget.type]?.label}
                </Button>
                <Button onClick={() => setSwap(null)}>Cancel</Button>
              </>
            }
            onClose={() => setSwap(null)}
            title={`Change to ${widgetManifests[swap.widget.type]?.label ?? swap.widget.type}?`}
          >
            <Stack spacing='3x'>
              <Text variant='body'>It can&apos;t keep:</Text>
              {swap.lost.map(lost => (
                <Text key={lost} variant='body'>
                  {lost}
                </Text>
              ))}
              <Text color='text.dim' variant='body'>
                Undo brings it back.
              </Text>
            </Stack>
          </Dialog>
        ) : null}
      </Box>
    </PanelTask>
  );
}
