// Require Node modules in the browser thanks to Browserify: http://browserify.org
var bespoke = require('bespoke'),
  classes = require('bespoke-classes'),
  state = require('bespoke-state'),
  keys = require('bespoke-keys'),
  touch = require('bespoke-touch'),
  bullets = require('bespoke-bullets'),
  backdrop = require('bespoke-backdrop'),
  scale = require('bespoke-scale'),
  hash = require('bespoke-hash');

var codeSteps = require('./plugin-code-steps');

// Bespoke.js
bespoke.from('article', [
  classes(),
  state(),
  keys(),
  touch(),
  bullets('.bullet, .single-bullet'),
  codeSteps(),
  backdrop(),
  scale(),
  hash()
]);

// Prism syntax highlighting
// This is actually loaded from "bower_components" thanks to
// debowerify: https://github.com/eugeneware/debowerify
require('prism');

