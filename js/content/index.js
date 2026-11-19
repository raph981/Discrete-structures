/**
 * Registry of all lectures covered so far.
 *
 * To add a lecture:
 *   1. create js/content/lectureNN.js (see lecture01.js for the structure)
 *   2. import it here and append it to LECTURES
 *
 * @typedef {Object} Section
 * @property {string} id      anchor (unique within the lecture)
 * @property {string} title
 * @property {string} body    HTML (see content/blocks.js)
 *
 * @typedef {Object} Lecture
 * @property {string} id
 * @property {number} number
 * @property {string} title
 * @property {string} summary
 * @property {Section[]} sections
 */
import lecture01 from './lecture01.js';
import lecture02 from './lecture02.js';
import lecture03 from './lecture03.js';
import lecture04 from './lecture04.js';
import lecture05 from './lecture05.js';
import lecture06 from './lecture06.js';
import lecture07 from './lecture07.js';

/** @type {Lecture[]} */
export const LECTURES = [lecture01, lecture02, lecture03, lecture04, lecture05, lecture06, lecture07];

/** @returns {Lecture | undefined} */
export function findLecture(id) {
  return LECTURES.find((l) => l.id === id);
}
