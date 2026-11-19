/**
 * Mounting interactive widgets into content pages.
 *
 * Content contains placeholders of the form
 *   <div data-widget="name" data-props='{"…": …}'></div>
 * After a page is rendered, they are looked up and filled by the matching
 * widget module (loaded lazily).
 */
import { WIDGETS } from '../widgets/index.js';
import { renderMath } from './math.js';

/**
 * @param {HTMLElement} root
 * @returns {Promise<void>}
 */
export async function mountWidgets(root) {
  const placeholders = [...root.querySelectorAll('[data-widget]')];
  await Promise.all(placeholders.map(async (el) => {
    const name = el.dataset.widget;
    const loader = WIDGETS[name];
    if (!loader) {
      el.textContent = `Unknown widget: ${name}`;
      return;
    }
    try {
      const props = el.dataset.props ? JSON.parse(el.dataset.props) : {};
      const { default: mount } = await loader();
      mount(el, props);
      renderMath(el);
    } catch (error) {
      console.error(`Widget "${name}" failed to load`, error);
      el.textContent = `Widget "${name}" failed to load.`;
    }
  }));
}
