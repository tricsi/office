export default {
  size: [{{config.imageWidth}}, {{config.imageHeight}}],
  frames: {
{{#rects}}
    {{{name}}}: [{{frame.x}}, {{frame.y}}]{{^last}},{{/last}}
{{/rects}}
  }
}
