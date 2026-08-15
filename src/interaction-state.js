export const INITIAL_STATE = Object.freeze({ hovered: null, selected: null });

function assertOptionalId(id) {
  if (id !== null && (typeof id !== 'string' || id.length === 0)) {
    throw new Error('Expected a non-empty province id or null');
  }
}

export function transition(state, event) {
  switch (event.type) {
    case 'hover':
      assertOptionalId(event.id);
      return Object.freeze({ ...state, hovered: event.id });
    case 'select':
      assertOptionalId(event.id);
      return Object.freeze({ ...state, selected: event.id });
    case 'reset':
      return INITIAL_STATE;
    default:
      throw new Error(`Unknown interaction event: ${event.type}`);
  }
}

export function activeProvinceId(state) {
  return state.hovered ?? state.selected;
}

export function isClickGesture(start, end, threshold = 6) {
  return Math.hypot(end.x - start.x, end.y - start.y) <= threshold;
}
