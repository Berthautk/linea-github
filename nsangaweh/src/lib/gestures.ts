import React, { useCallback, useRef, useState } from 'react';
import { triggerHaptic } from './haptics';

const SWIPE_TRIGGER = 64;
const MOVE_TOLERANCE = 8;
const LONG_PRESS_MS = 480;

/**
 * Tap, long-press and horizontal swipe on a row. Vertical scrolling stays
 * native (touch-action: pan-y). A swipe or long-press never also fires the tap.
 */
export function useRowGestures(opts: {
  onTap?: () => void;
  onLongPress?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}) {
  const [dx, setDx] = useState(0);
  const st = useRef({ x: 0, y: 0, active: false, horizontal: false, moved: false, fired: false, id: -1 });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    st.current = { x: e.clientX, y: e.clientY, active: true, horizontal: false, moved: false, fired: false, id: e.pointerId };
    clear();
    if (opts.onLongPress) {
      timer.current = setTimeout(() => {
        if (!st.current.moved && st.current.active) {
          st.current.fired = true;
          triggerHaptic('medium');
          opts.onLongPress!();
        }
      }, LONG_PRESS_MS);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const s = st.current;
    if (!s.active) return;
    const mx = e.clientX - s.x;
    const my = e.clientY - s.y;
    if (!s.moved && (Math.abs(mx) > MOVE_TOLERANCE || Math.abs(my) > MOVE_TOLERANCE)) {
      s.moved = true;
      clear();
      s.horizontal = Math.abs(mx) > Math.abs(my) && (!!opts.onSwipeLeft || !!opts.onSwipeRight);
      if (s.horizontal) (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    }
    if (s.horizontal) {
      const min = opts.onSwipeLeft ? -96 : 0;
      const max = opts.onSwipeRight ? 96 : 0;
      setDx(Math.max(min, Math.min(max, mx)));
    }
  };

  const end = () => {
    const s = st.current;
    clear();
    if (!s.active) return;
    s.active = false;
    if (s.horizontal) {
      s.fired = true;
      if (dx >= SWIPE_TRIGGER && opts.onSwipeRight) {
        triggerHaptic('medium');
        opts.onSwipeRight();
      } else if (dx <= -SWIPE_TRIGGER && opts.onSwipeLeft) {
        triggerHaptic('medium');
        opts.onSwipeLeft();
      }
    }
    setDx(0);
  };

  const onClick = (e: React.MouseEvent) => {
    if (st.current.fired) {
      st.current.fired = false;
      e.preventDefault();
      return;
    }
    opts.onTap?.();
  };

  return {
    dx,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: end,
      onPointerCancel: end,
      onClick,
      onContextMenu: (e: React.MouseEvent) => opts.onLongPress && e.preventDefault(),
    },
    style: {
      transform: dx ? `translateX(${dx}px)` : undefined,
      transition: dx ? 'none' : 'transform 160ms ease',
      touchAction: 'pan-y' as const,
    },
  };
}

/**
 * Drag handles to reorder a list of equal-height rows. The list re-renders in
 * the live order under the finger, with a haptic tick on every position change.
 */
export function useDragReorder(ids: string[], onDrop: (ids: string[]) => void) {
  const [live, setLive] = useState<string[] | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const els = useRef(new Map<string, HTMLElement>());
  const st = useRef({ y: 0, tops: [] as number[], heights: [] as number[], from: 0, order: [] as string[] });

  const register = useCallback(
    (id: string) => (el: HTMLElement | null) => {
      if (el) els.current.set(id, el);
      else els.current.delete(id);
    },
    []
  );

  const handleProps = (id: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      const rects = ids.map((x) => els.current.get(x)?.getBoundingClientRect());
      st.current = {
        y: e.clientY,
        tops: rects.map((r) => r?.top ?? 0),
        heights: rects.map((r) => r?.height ?? 0),
        from: ids.indexOf(id),
        order: ids,
      };
      setDragId(id);
      setLive(ids);
      setOffset(0);
      triggerHaptic('medium');
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (dragId !== id) return;
      const s = st.current;
      const dy = e.clientY - s.y;
      const center = s.tops[s.from] + s.heights[s.from] / 2 + dy;
      let to = 0;
      s.tops.forEach((t, i) => {
        if (i !== s.from && t + s.heights[i] / 2 < center) to++;
      });
      const others = ids.filter((x) => x !== id);
      const order = [...others.slice(0, to), id, ...others.slice(to)];
      if (order.join() !== s.order.join()) {
        triggerHaptic('light');
        s.order = order;
        setLive(order);
      }
      setOffset(s.tops[s.from] + dy - s.tops[to]);
    },
    onPointerUp: () => {
      if (dragId !== id) return;
      const order = st.current.order;
      setDragId(null);
      setLive(null);
      setOffset(0);
      if (order.join() !== ids.join()) {
        triggerHaptic('success');
        onDrop(order);
      }
    },
    onPointerCancel: () => {
      setDragId(null);
      setLive(null);
      setOffset(0);
    },
    style: { touchAction: 'none' as const, cursor: 'grab' },
  });

  const rowStyle = (id: string): React.CSSProperties =>
    dragId === id
      ? { transform: `translateY(${offset}px)`, zIndex: 10, position: 'relative', boxShadow: 'var(--shadow-raised)' }
      : { transition: 'transform 120ms ease' };

  return { order: live || ids, dragging: dragId, register, handleProps, rowStyle };
}
