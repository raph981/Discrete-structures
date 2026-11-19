/**
 * Step-through control for algorithm widgets: ⏮ reset, ← back, next →, run to end, plus a slider.
 *
 *   const stepper = createStepper({ onStep: (i) => draw(steps[i]) });
 *   stepper.setCount(steps.length);   // jumps to step 0 and calls onStep(0)
 *
 * The widget keeps the list of steps; the stepper only manages the current index.
 */
import { h, button } from './dom.js';

export function createStepper({ onStep, nextLabel = 'Next step →', autoplayDelay = 450 }) {
  let count = 0;
  let index = 0;
  let timer = null;

  const range = h('input', { type: 'range', min: 0, max: 0, value: 0, 'aria-label': 'Step', class: 'stepper__range' });
  const label = h('span', { class: 'stepper__label' });
  const reset = button('⏮', () => go(0), { secondary: true });
  const back = button('← Back', () => go(index - 1), { secondary: true });
  const next = button(nextLabel, () => go(index + 1));
  const play = button('▶ Play', togglePlay, { secondary: true });
  const end = button('End ⏭', () => go(count - 1), { secondary: true });
  reset.setAttribute('aria-label', 'Back to the start');
  range.addEventListener('input', () => go(Number(range.value)));

  function stop() {
    clearInterval(timer);
    timer = null;
    play.textContent = '▶ Play';
  }

  function togglePlay() {
    if (timer) return stop();
    if (index >= count - 1) go(0);
    play.textContent = '⏸ Pause';
    timer = setInterval(() => {
      if (index >= count - 1) stop();
      else go(index + 1, true);
    }, autoplayDelay);
  }

  function go(i, fromTimer = false) {
    if (!fromTimer) stop();
    index = Math.max(0, Math.min(i, count - 1));
    range.value = index;
    label.textContent = count ? `step ${index} of ${count - 1}` : '';
    reset.disabled = back.disabled = index === 0;
    next.disabled = end.disabled = index >= count - 1;
    play.disabled = count <= 1;
    onStep(index);
  }

  const element = h('div', { class: 'stepper' },
    h('div', { class: 'button-row' }, reset, back, next, play, end),
    h('div', { class: 'stepper__track' }, range, label),
  );

  return {
    element,
    get index() { return index; },
    /** Sets the number of steps and jumps to `start` (default: the first step). */
    setCount(n, start = 0) {
      count = n;
      range.max = Math.max(0, n - 1);
      go(start);
    },
    go,
    stop,
  };
}
