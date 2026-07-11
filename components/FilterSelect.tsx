'use client';

import { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';

export type FilterOption = {
  value: string;
  label: string;
  /** ISO 3166-1 alpha-2 code — when set, a flag is shown before the label. */
  iso?: string | null;
};

export type FilterOptionGroup = {
  label: string;
  options: FilterOption[];
};

type Pos = { left: number; top: number; width: number; maxHeight: number; placement: 'down' | 'up' };

/**
 * A compact, custom-styled dropdown used for the table column filters. Unlike a
 * native <select>, it renders its own popover so we can (a) style the option
 * list, (b) cap its height and scroll instead of ballooning to fill the screen,
 * and (c) show a country flag next to each option.
 *
 * The popover is rendered in a portal with position: fixed, so it escapes the
 * table's scroll/overflow containers and can flip above the trigger when there
 * isn't enough room below. Closes on outside click, Escape, scroll, or resize.
 */
export function FilterSelect({
  value,
  onChange,
  options,
  groups,
  allLabel = 'All',
  ariaLabel,
  showFlags = false,
  name,
  placeholder,
  required = false,
  size = 'sm'
}: {
  value: string;
  onChange: (value: string) => void;
  options?: FilterOption[];
  groups?: FilterOptionGroup[];
  allLabel?: string;
  ariaLabel?: string;
  showFlags?: boolean;
  /** When set, a hidden input with this name carries the value in a <form>. */
  name?: string;
  /** Placeholder shown when nothing is selected (defaults to allLabel). */
  placeholder?: string;
  /** For form use: block submit when empty (paired with the hidden input). */
  required?: boolean;
  /** 'sm' matches the compact table filter row; 'lg' matches full form fields. */
  size?: 'sm' | 'lg';
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<Pos | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const flat = useMemo(() => {
    if (groups) return groups.flatMap((g) => g.options);
    return options ?? [];
  }, [options, groups]);

  const selected = flat.find((o) => o.value === value) ?? null;

  const GAP = 6;
  const MAX = 320;

  const reposition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const below = window.innerHeight - r.bottom - GAP;
    const above = r.top - GAP;
    // Prefer opening downward; flip up only if there's clearly more room above.
    const placement: 'down' | 'up' = below >= 180 || below >= above ? 'down' : 'up';
    const maxHeight = Math.min(MAX, Math.max(140, placement === 'down' ? below : above));
    setPos({
      left: r.left,
      top: placement === 'down' ? r.bottom + GAP : r.top - GAP,
      width: r.width,
      maxHeight,
      placement
    });
  }, []);

  useLayoutEffect(() => {
    if (open) reposition();
  }, [open, reposition]);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    // The table body scrolls, so close on any scroll to avoid the popover
    // drifting away from its trigger.
    function onScrollOrResize() {
      setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onScrollOrResize);
    window.addEventListener('scroll', onScrollOrResize, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onScrollOrResize);
      window.removeEventListener('scroll', onScrollOrResize, true);
    };
  }, [open]);

  function pick(v: string) {
    onChange(v);
    setOpen(false);
  }

  const renderOption = (o: FilterOption) => {
    const isActive = o.value === value;
    return (
      <li key={o.value}>
        <button
          type="button"
          role="option"
          aria-selected={isActive}
          className={`filter-option ${isActive ? 'is-active' : ''}`}
          onClick={() => pick(o.value)}
        >
          {showFlags &&
            (o.iso ? (
              <span className={`fi fi-${o.iso.toLowerCase()} filter-flag`} aria-hidden="true" />
            ) : (
              <span className="filter-flag filter-flag-empty" aria-hidden="true" />
            ))}
          <span className="filter-option-label">{o.label}</span>
          {isActive && <span className="filter-option-check" aria-hidden="true">✓</span>}
        </button>
      </li>
    );
  };

  const popover =
    open && pos ? (
      <div
        ref={popRef}
        className={`filter-pop filter-pop-${pos.placement}`}
        role="listbox"
        aria-label={ariaLabel}
        style={{
          position: 'fixed',
          left: pos.left,
          top: pos.placement === 'down' ? pos.top : undefined,
          bottom: pos.placement === 'up' ? window.innerHeight - pos.top : undefined,
          minWidth: pos.width,
          maxHeight: pos.maxHeight
        }}
      >
        <ul className="filter-list">
          <li>
            <button
              type="button"
              role="option"
              aria-selected={value === ''}
              className={`filter-option ${value === '' ? 'is-active' : ''}`}
              onClick={() => pick('')}
            >
              {showFlags && <span className="filter-flag filter-flag-empty" aria-hidden="true" />}
              <span className="filter-option-label filter-option-all">{allLabel}</span>
              {value === '' && <span className="filter-option-check" aria-hidden="true">✓</span>}
            </button>
          </li>

          {groups
            ? groups.map((g) => (
                <li key={g.label} className="filter-group">
                  <div className="filter-group-label">{g.label}</div>
                  <ul className="filter-sublist">{g.options.map(renderOption)}</ul>
                </li>
              ))
            : (options ?? []).map(renderOption)}
        </ul>
      </div>
    ) : null;

  return (
    <div className="filter-select">
      {name && <input type="hidden" name={name} value={value} required={required} />}
      <button
        ref={triggerRef}
        type="button"
        className={`filter-trigger filter-trigger-${size} ${open ? 'is-open' : ''} ${value ? 'has-value' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span className="filter-trigger-content">
          {showFlags && selected?.iso && (
            <span className={`fi fi-${selected.iso.toLowerCase()} filter-flag`} aria-hidden="true" />
          )}
          <span className={`filter-trigger-label ${!selected ? 'is-placeholder' : ''}`}>
            {selected ? selected.label : (placeholder ?? allLabel)}
          </span>
        </span>
        <span className="filter-chevron" aria-hidden="true" />
      </button>

      {mounted && popover ? createPortal(popover, document.body) : null}
    </div>
  );
}
