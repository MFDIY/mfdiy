import type { ReactNode } from 'react';

import { useState } from 'react';

import { Sheet } from '../Sheet/Sheet.js';

import { usePanelForm } from './PanelLayout.js';

export type Task = {
  content: ReactNode;
  /** Names the sheet for assistive technology. */
  title: string;
};

export type PanelTaskProps = {
  /** The panel's own content. */
  children: ReactNode;
  /** Fires when the user closes the task's sheet; the task should offer its own way back too, such as Back. */
  onClose: () => void;
  /** The side task, or null for none. */
  task: Task | null;
};

/**
 * A side task inside a panel, like choosing a widget's data (0008): in a sidebar, it takes the
 * panel's place until it's done; on a sheet, it opens as a modal sheet stacked on top. Either way,
 * the task shows its own way back, as the sheet has no buttons of its own. Put it in a
 * `PanelLayout` panel, around the panel's content.
 */
export function PanelTask({ children, onClose, task }: PanelTaskProps) {
  const form = usePanelForm();
  const [last, setLast] = useState(task);

  if (task !== null && task !== last) {
    setLast(task);
  }

  if (form === 'sidebars') {
    return task ? task.content : children;
  }

  const shown = task ?? last;

  return (
    <>
      {children}
      <Sheet modal onClose={onClose} open={task !== null} title={shown?.title ?? ''}>
        {shown?.content}
      </Sheet>
    </>
  );
}
