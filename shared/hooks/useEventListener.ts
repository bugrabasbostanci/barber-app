/**
 * useEventListener hook for adding event listeners
 */

'use client';

import { useRef, useEffect } from 'react';

export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: undefined,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement = HTMLDivElement>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: React.RefObject<T>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: React.RefObject<Document>,
  options?: boolean | AddEventListenerOptions
): void;

export function useEventListener<
  KW extends keyof WindowEventMap,
  KH extends keyof HTMLElementEventMap,
  KD extends keyof DocumentEventMap,
  T extends HTMLElement | Document = HTMLElement
>(
  eventName: KW | KH | KD,
  handler: (
    event:
      | WindowEventMap[KW]
      | HTMLElementEventMap[KH] 
      | DocumentEventMap[KD]
      | Event
  ) => void,
  element?: React.RefObject<T>,
  options?: boolean | AddEventListenerOptions
) {
  // Create a ref that stores handler
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Define the listening target
    const targetElement: T | Window = element?.current ?? window;

    if (!(targetElement && targetElement.addEventListener)) return;

    // Create event listener that calls handler function stored in ref
    const eventListener: typeof handler = event => {
      savedHandler.current(event);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    // Remove event listener on cleanup
    return () => {
      targetElement.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

// Specialized hooks for common events
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  ref: React.RefObject<T>,
  handler: (event: MouseEvent) => void
) {
  useEventListener(
    'mousedown',
    (event) => {
      const element = ref?.current;
      if (!element || element.contains(event.target as Node)) {
        return;
      }
      handler(event);
    }
  );
}

export function useKeyPress(
  targetKey: string,
  handler: (event: KeyboardEvent) => void,
  options?: { 
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
  }
) {
  useEventListener('keydown', (event) => {
    if (event.key !== targetKey) return;
    
    const { ctrl, shift, alt, meta } = options || {};
    
    if (ctrl && !event.ctrlKey) return;
    if (shift && !event.shiftKey) return;
    if (alt && !event.altKey) return;
    if (meta && !event.metaKey) return;
    
    handler(event);
  });
}

export function useEscapeKey(handler: (event: KeyboardEvent) => void) {
  useKeyPress('Escape', handler);
}

export function useEnterKey(handler: (event: KeyboardEvent) => void) {
  useKeyPress('Enter', handler);
}

export function useWindowResize(handler: (event: UIEvent) => void) {
  useEventListener('resize', handler);
}

export function useWindowScroll(handler: (event: Event) => void) {
  useEventListener('scroll', handler);
}

export function useDocumentVisibility(
  onVisible: () => void,
  onHidden: () => void
) {
  useEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      onVisible();
    } else {
      onHidden();
    }
  }, { current: document });
}

export function useOnlineStatus(
  onOnline: () => void,
  onOffline: () => void
) {
  useEventListener('online', onOnline);
  useEventListener('offline', onOffline);
}

export function useBeforeUnload(handler: (event: BeforeUnloadEvent) => void) {
  useEventListener('beforeunload', handler);
}