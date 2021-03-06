# Gradient Circus

A presentation about the inner workings of CSS gradients. There are a few variations, each with a different set of interactive slides viewable online:

* [SydCSS](http://sydcss.com/) (2015) – [Slides](http://gilmoreorless.github.io/preso-gradient-circus/sydcss/) | [Video](https://www.youtube.com/watch?v=y_GT0mOmiE0)
* [Decompress](http://2016.decompress.com.au/) (2016) — [Slides](http://gilmoreorless.github.io/preso-gradient-circus/decompress16/)


## Links and references

* [If I Ran the Circus](http://www.amazon.com/If-Ran-Circus-Classic-Seuss/dp/039480080X), by Dr Seuss
* [Browser support for gradients](http://caniuse.com/#feat=css-gradients) at Can I use...
* [Lea Verou’s CSS3 Patterns](http://lea.verou.me/css3patterns/)
* [Bennett Feely’s gradient gallery](http://bennettfeely.com/gradients/)
* [A single div](http://a.singlediv.com/)
* [My open source project showcase](https://gilmoreorless.github.io/)
* [Gradient Inspector Chrome extension](https://chrome.google.com/webstore/detail/css-gradient-inspector/blklpjonlhpakchaahdnkcjkfmccmdik)
* [`conic-gradient` polyfill](https://leaverou.github.io/conic-gradient/)
* [Do you really know CSS linear-gradients?](https://medium.com/@patrickbrosset/do-you-really-understand-css-linear-gradients-631d9a895caf)
* [Patrick Brossett’s `linear-gradient` tool on CodePen](http://codepen.io/captainbrosset/pen/ByqRMB)
* [PostCSS gradient transparency fix](https://github.com/gilmoreorless/postcss-gradient-transparency-fix)

### Specs

* [W3C: CSS Image Values and Replaced Content Module Level 3](http://dev.w3.org/csswg/css-images/) (current)
* [W3C: CSS Image Values and Replaced Content Module Level 4](http://dev.w3.org/csswg/css-images-4/) (proposed)
* [W3C: Compositing and Blending Level 1](http://dev.w3.org/fxtf/compositing-1/)
* [Lea Verou’s draft conic gradient spec](http://lea.verou.me/specs/conical-gradient/)

### Demos

* [How background image layering works](http://ecssplain.github.io/background-image-layers/) (standalone demo extracted from this presentation, [plus source code](https://github.com/ecssplain/background-image-layers))


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
