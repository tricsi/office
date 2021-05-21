{
  "size": [{{config.imageWidth}}, {{config.imageHeight}}],
  "margin": 1,
  "frames": {
{{#rects}}
    "{{{name}}}": [{{frame.x}}, {{frame.y}}]{{^last}},{{/last}}
{{/rects}}
  }
}
