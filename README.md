# Gradient Circus

A presentation about the inner workings of CSS gradients for [SydCSS](http://sydcss.com).
View the slides at <http://gilmoreorless.github.io/sydcss-preso-gradient-circus>.

## Links and references

* [If I Ran the Circus](https://amazon.com/???), by Dr Seuss
* [Browser support for gradients](http://caniuse.com/#feat=css-gradients) at Can I use...
* [Lea Verou’s CSS3 Patterns](http://lea.verou.me/css3patterns/)
* [Bennett Feely’s gradient gallery](http://bennettfeely.com/gradients/)
* [A single div](http://a.singlediv.com/)
* [Gradient Inspector Chrome extension](https://chrome.google.com/webstore/detail/css-gradient-inspector/blklpjonlhpakchaahdnkcjkfmccmdik)
* [`conic-gradient` polyfill](https://leaverou.github.io/conic-gradient/)
* [Do you really know CSS linear-gradients?](https://medium.com/@patrickbrosset/do-you-really-understand-css-linear-gradients-631d9a895caf)
* [Patrick Brossett’s `linear-gradient` tool on CodePen](http://codepen.io/captainbrosset/pen/ByqRMB)

### Specs

* [W3C: CSS Image Values and Replaced Content Module Level 3](http://dev.w3.org/csswg/css-images/) (current)
* [W3C: CSS Image Values and Replaced Content Module Level 4](http://dev.w3.org/csswg/css-images-4/) (proposed)
* [W3C: Compositing and Blending Level 1](http://dev.w3.org/fxtf/compositing-1/)
* [Lea Verou’s draft conic gradient spec](http://lea.verou.me/specs/conical-gradient/)


## Slide tech

The slide deck was built using [Bespoke.js](http://markdalgleish.com/projects/bespoke.js) with some custom plugins.

### View slides locally

First, ensure you have the following installed:

1. [Node.js](http://nodejs.org)
2. [Bower](http://bower.io): `$ npm install -g bower`
3. [Gulp](http://gulpjs.com): `$ npm install -g gulp`

Then, install dependencies and run the preview server:

```bash
$ npm install && bower install
$ gulp serve
```
