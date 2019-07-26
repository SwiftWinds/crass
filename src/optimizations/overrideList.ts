export const overrideList: {[key: string]: Array<string>} = {
  'animation-delay': ['animation'],
  'animation-direction': ['animation'],
  'animation-duration': ['animation'],
  'animation-fill-mode': ['animation'],
  'animation-iteration-count': ['animation'],
  'animation-name': ['animation'],
  'animation-play-state': ['animation'],
  'animation-timing-function': ['animation'],
  '-moz-animation-delay': ['-moz-animation'],
  '-moz-animation-direction': ['-moz-animation'],
  '-moz-animation-duration': ['-moz-animation'],
  '-moz-animation-fill-mode': ['-moz-animation'],
  '-moz-animation-iteration-count': ['-moz-animation'],
  '-moz-animation-name': ['-moz-animation'],
  '-moz-animation-play-state': ['-moz-animation'],
  '-moz-animation-timing-function': ['-moz-animation'],
  '-o-animation-delay': ['-o-animation'],
  '-o-animation-direction': ['-o-animation'],
  '-o-animation-duration': ['-o-animation'],
  '-o-animation-fill-mode': ['-o-animation'],
  '-o-animation-iteration-count': ['-o-animation'],
  '-o-animation-name': ['-o-animation'],
  '-o-animation-play-state': ['-o-animation'],
  '-o-animation-timing-function': ['-o-animation'],
  '-webkit-animation-delay': ['-webkit-animation'],
  '-webkit-animation-direction': ['-webkit-animation'],
  '-webkit-animation-duration': ['-webkit-animation'],
  '-webkit-animation-fill-mode': ['-webkit-animation'],
  '-webkit-animation-iteration-count': ['-webkit-animation'],
  '-webkit-animation-name': ['-webkit-animation'],
  '-webkit-animation-play-state': ['-webkit-animation'],
  '-webkit-animation-timing-function': ['-webkit-animation'],
  'background-clip': ['background'],
  'background-origin': ['background'],
  'border-color': ['border'],
  'border-style': ['border'],
  'border-width': ['border'],
  'border-bottom': ['border'],
  'border-bottom-color': ['border-bottom', 'border-color', 'border'],
  'border-bottom-left-radius': ['border-radius'],
  'border-bottom-right-radius': ['border-radius'],
  'border-bottom-style': ['border-bottom', 'border-style', 'border'],
  'border-bottom-width': ['border-bottom', 'border-width', 'border'],
  'border-left': ['border'],
  'border-left-color': ['border-left', 'border-color', 'border'],
  'border-left-style': ['border-left', 'border-style', 'border'],
  'border-left-width': ['border-left', 'border-width', 'border'],
  'border-right': ['border'],
  'border-right-color': ['border-right', 'border-color', 'border'],
  'border-right-style': ['border-right', 'border-style', 'border'],
  'border-right-width': ['border-right', 'border-width', 'border'],
  'border-top': ['border'],
  'border-top-color': ['border-top', 'border-color', 'border'],
  'border-top-left-radius': ['border-radius'],
  'border-top-right-radius': ['border-radius'],
  'border-top-style': ['border-top', 'border-style', 'border'],
  'border-top-width': ['border-top', 'border-width', 'border'],
  'font-family': ['font'],
  'font-size': ['font'],
  'font-style': ['font'],
  'font-variant': ['font'],
  'font-weight': ['font'],
  'line-height': ['font'],
  'margin-bottom': ['margin'],
  'margin-left': ['margin'],
  'margin-right': ['margin'],
  'margin-top': ['margin'],
  'padding-bottom': ['padding'],
  'padding-left': ['padding'],
  'padding-right': ['padding'],
  'padding-top': ['padding'],
  'text-decoration-color': ['text-decoration'],
  'text-decoration-line': ['text-decoration'],
  'text-decoration-style': ['text-decoration'],
  'text-emphasis-color': ['text-emphasis'],
  'text-emphasis-style': ['text-emphasis'],
  'transition-delay': ['transition'],
  'transition-duration': ['transition'],
  'transition-property': ['transition'],
  'transition-timing-function': ['transition'],
  '-moz-transition-delay': ['-moz-transition'],
  '-moz-transition-duration': ['-moz-transition'],
  '-moz-transition-property': ['-moz-transition'],
  '-moz-transition-timing-function': ['-moz-transition'],
  '-o-transition-delay': ['-o-transition'],
  '-o-transition-duration': ['-o-transition'],
  '-o-transition-property': ['-o-transition'],
  '-o-transition-timing-function': ['-o-transition'],
  '-webkit-transition-delay': ['-webkit-transition'],
  '-webkit-transition-duration': ['-webkit-transition'],
  '-webkit-transition-property': ['-webkit-transition'],
  '-webkit-transition-timing-function': ['-webkit-transition'],
};
// TODO: This will be useful eventually.
// const invertedOverrideList = Object.keys(overrideList).reduce((acc, cur) => {
//     const overriders = overrideList[cur];
//     overriders.forEach(orr => {
//         if (!(orr in acc)) {
//             acc[orr] = [cur];
//         } else {
//             acc[orr].push(cur);
//         }
//     });
//     return acc;
// }, {});