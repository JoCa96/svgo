'use strict';

const { detachNodeFromParent } = require('../lib/xast.js');
const { attrsGroups } = require('./_collections.js');

exports.name = 'removeScriptElement';
exports.description = 'removes scripts (disabled by default)';

/** Union of all event attributes. */
const eventAttrs = [
  ...attrsGroups.animationEvent,
  ...attrsGroups.graphicalEvent,
  ...attrsGroups.documentEvent,
];

/**
 * Remove scripts.
 *
 * https://www.w3.org/TR/SVG11/script.html
 *
 * @author Patrick Klingemann
 * @type {import('./plugins-types').Plugin<'removeScriptElement'>}
 */
exports.fn = () => {
  return {
    element: {
      enter: (node, parentNode) => {
        if (node.name === 'script') {
          detachNodeFromParent(node, parentNode);
          return;
        }

        for (const attr of eventAttrs) {
          if (node.attributes[attr] != null) {
            delete node.attributes[attr];
          }
        }
      },
      exit: (node, parentNode) => {
        if (node.name !== 'a') {
          return;
        }

        for (const attr of ['href', 'xlink:href']) {
          if (
            node.attributes[attr] == null ||
            !node.attributes[attr].trimStart().startsWith('javascript:')
          ) {
            continue;
          }

          detachNodeFromParent(node, parentNode);
          const index = parentNode.children.indexOf(node);
          parentNode.children.splice(index, 1, ...node.children);

          // TODO remove legacy parentNode in v4
          for (const child of node.children) {
            Object.defineProperty(child, 'parentNode', {
              writable: true,
              value: parentNode,
            });
          }
        }
      },
    },
  };
};
