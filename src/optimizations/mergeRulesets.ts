/*

Merging Rulesets

Aside from simple adjacent combinations, it's sometimes possible to combine
sibling rulesets together (Nth into 1st). The rules for this are complicated,
however, because the ability to combine the rulesets is governed by many
different factors:

- Specificity of inner rulesets
- Use of !important
- The type of selectors for the rulesets being merged
- etc.

This file attempts to abstract those concepts into a single set of defined
rules.

*/

import {Node, Selector} from '../nodes/Node';
import * as objects from '../objects';

function anyBetween<T>(
  body: Array<T>,
  i: number,
  j: number,
  filter: (val: T) => boolean,
): boolean {
  for (let x = i + 1; x < j; x++) {
    if (filter(body[x])) {
      return true;
    }
  }
  return false;
}

function manySome<T>(
  arrX: Array<T>,
  arrY: Array<T>,
  func: (a: T, b: T) => boolean,
): boolean {
  for (let i = 0; i < arrX.length; i++) {
    if (!arrX[i]) continue;
    for (let j = 0; j < arrY.length; j++) {
      if (!arrY[j]) continue;
      if (func(arrX[i], arrY[j])) {
        return true;
      }
    }
  }
  return false;
}

const isRuleset = (item: Node) => item instanceof objects.Ruleset;
const isMediaQuery = (item: Node) => item instanceof objects.Media;
const isIDSelector = (item: Node) => item instanceof objects.IDSelector;
const isAttributeSelector = (item: Node) =>
  item instanceof objects.AttributeSelector;
const isPseudoElementSelector = (item: Node) =>
  item instanceof objects.PseudoElementSelector;
const isPseudoClassSelector = (item: Node) =>
  item instanceof objects.PseudoClassSelector;

function normalizeSelector(selector: objects.SelectorList | Selector) {
  return selector instanceof objects.SelectorList
    ? selector.selectors
    : [selector];
}

function getLastInSelectorChain(selector: objects.SelectorList | Selector) {
  if (selector instanceof objects.SimpleSelector) return selector;
  return getLastInSelectorChain(selector.descendant);
}

const mutuallyExclusiveAttrSelectors = ['=', '|=', '^=', '$='];

export function canSelectorsEverTouchSameElement(
  selX: Array<Selector>,
  selY: Array<Selector>,
) {
  selX = selX.map(getLastInSelectorChain);
  selY = selY.map(getLastInSelectorChain);

  // TODO: Look at ID usage elsewhere in the selector. You might find
  // something like this:
  //   #foo *
  //   bar#foo
  // This otherwise looks (based on the last element in the selector) like
  // they might match, but the #foo usage tells otherwise.

  return manySome(selX, selY, (x, y) => {
    x = x.conditions;
    y = y.conditions;

    const xFirst = x[0];
    const yFirst = y[0];
    if (
      xFirst instanceof objects.ElementSelector &&
      yFirst instanceof objects.ElementSelector
    ) {
      return xFirst.ident === yFirst.ident && xFirst.ns === yFirst.ns;
    }

    const xId = x.find(isIDSelector);
    const yId = x.find(isIDSelector);
    if (xId && yId) {
      return xId.ident !== yId.ident;
    }

    const attrTest = manySome(x, y, (x, y) => {
      if (!isAttributeSelector(x)) return false;
      if (!isAttributeSelector(y)) return false;

      if (!x.value || !y.value) return false;

      // TODO: There's a lot of other combinations that could be mutually
      // exclusive. `[x=abc]` and `[x^=b]` could be determined to never
      // match, for instance.
      return (
        x.ident.toString() === y.ident.toString() &&
        x.comparison === y.comparison &&
        mutuallyExclusiveAttrSelectors.includes(x.comparison) &&
        x.value.toString() !== y.value.toString()
      );
    });
    if (attrTest) return false;

    if (x.find(isPseudoElementSelector) ^ y.find(isPseudoElementSelector))
      return false;
    if (x.find(isPseudoClassSelector) ^ y.find(isPseudoClassSelector))
      return false;

    // TODO: not() support for classes, attributes

    return true;
  });
}

const supersetCache = new WeakMap<Array<Node>, Array<string>>();
function isSubset(
  subset: Array<objects.Declaration>,
  superset: Array<objects.Declaration>,
): boolean {
  let strSuperset: Array<string>;
  if (supersetCache.has(superset)) {
    strSuperset = supersetCache.get(superset)!;
  } else {
    strSuperset = superset.map(x => x.toString());
    supersetCache.set(superset, strSuperset);
  }
  return subset.every(stmt => strSuperset.includes(stmt.toString()));
}

export function canRulesetsBeCombined(
  parentBody: Array<objects.Ruleset>,
  xIdx: number,
  yIdx: number,
): boolean {
  const x = parentBody[xIdx];
  const y = parentBody[yIdx];
  if (!isRuleset(x) || !isRuleset(y)) return false;
  if (!isSubset(y.content, x.content)) {
    return false;
  }

  // You can't combine rulesets if there are media queries between the two.
  if (anyBetween(parentBody, xIdx, yIdx, isMediaQuery)) {
    return false;
  }

  // const xSelector = normalizeSelector(x.selector);
  const ySelector = normalizeSelector(y.selector);

  // Adjacent rulesets are fine to merge.
  if (xIdx === yIdx - 1) return true;

  for (let i = yIdx - 1; i > xIdx; i--) {
    if (!isRuleset(parentBody[i])) continue;

    const tempSelector = normalizeSelector(parentBody[i].selector);
    if (canSelectorsEverTouchSameElement(ySelector, tempSelector)) return false;
  }

  return true;
}