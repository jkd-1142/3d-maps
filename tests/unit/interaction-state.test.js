import { describe, expect, it } from 'vitest';
import { INITIAL_STATE, activeProvinceId, isClickGesture, transition } from '../../src/interaction-state.js';

describe('interaction state machine', () => {
  it('S06 gives hover precedence without losing selection', () => {
    const selected = transition(INITIAL_STATE, { type: 'select', id: 'taipei' });
    const hovered = transition(selected, { type: 'hover', id: 'keelung' });
    expect(hovered).toEqual({ hovered: 'keelung', selected: 'taipei' });
    expect(activeProvinceId(hovered)).toBe('keelung');
    expect(activeProvinceId(transition(hovered, { type: 'hover', id: null }))).toBe('taipei');
  });

  it('S09 reset clears hover and selection', () => {
    expect(INITIAL_STATE).toEqual({ hovered: null, selected: null });
    expect(transition({ hovered: 'taipei', selected: 'taipei' }, { type: 'reset' })).toEqual(INITIAL_STATE);
  });

  it('S08 distinguishes click at 6px from drag over 6px', () => {
    expect(isClickGesture({ x: 0, y: 0 }, { x: 6, y: 0 })).toBe(true);
    expect(isClickGesture({ x: 0, y: 0 }, { x: 6.01, y: 0 })).toBe(false);
    expect(isClickGesture({ x: 10, y: 20 }, { x: 16, y: 20 })).toBe(true);
    expect(isClickGesture({ x: 10, y: 20 }, { x: 10, y: 26.01 })).toBe(false);
  });

  it('rejects unknown events and invalid ids', () => {
    expect(() => transition(INITIAL_STATE, { type: 'select', id: '' })).toThrow('non-empty province id');
    expect(() => transition(INITIAL_STATE, { type: 'hover', id: '' })).toThrow('non-empty province id');
    expect(() => transition(INITIAL_STATE, { type: 'hover', id: 42 })).toThrow('non-empty province id');
    expect(() => transition(INITIAL_STATE, { type: 'unknown' })).toThrow('Unknown interaction event');
  });
});
