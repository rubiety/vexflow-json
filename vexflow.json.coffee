window.Vex or= {}
window.Vex.Flow or= {}

class Vex.Flow.JSON
  constructor: (@data)->
    @stave_offset = 0
    @stave_delta = 80
    @staves = {}
    this.interpret_data()

  interpret_data: ->
    if @data instanceof Array
      if @data[0] instanceof Array
        @clef = "treble"
        @notes = this.interpret_notes(@data)
      else if typeof @data[0] is "string"
        @clef = "treble"
        @notes = this.interpret_notes([{ keys: @data }])
    else if @data.keys
      @clef = "treble"
      @notes = this.interpret_notes([@data])
    else
      @clef = @data.clef
      @notes = this.interpret_notes(@data.notes)

  interpret_notes: (data)->
    self = this
    _(data).map (datum)->
      if typeof datum is "string"
        { duration: "q", keys: self.interpret_keys([datum]) }
      else if datum instanceof Array
        { duration: "q", keys: self.interpret_keys(datum) }
      else
        datum.keys = self.interpret_keys(datum.keys)
        datum.duration ||= "q"
        datum

  interpret_keys: (data)->
    _(data).map (datum)->
      [note_portion, octave_portion] = datum.split("/")
      octave_portion ||= "4"
      "#{note_portion}/#{octave_portion}"

  draw_canvas: (@canvas, options = {})->
    @canvas_width = options["width"] || 600
    @canvas_height = options["height"] || 110
    @renderer = new Vex.Flow.Renderer(@canvas, Vex.Flow.Renderer.Backends.CANVAS);
    @context  = @renderer.getContext()

  draw_stave: (clef = "treble", options = {})->
    @staves[clef] = new Vex.Flow.Stave(10, @stave_offset, @canvas_width - 20)
    @staves[clef].addClef(clef).setContext(@context).draw()
    @stave_offset += @stave_delta

  draw_notes: (notes)->
    Vex.Flow.Formatter.FormatAndDraw @context, @staves[@clef], notes

  draw_notes_on_stave: (stave_notes, clef = "treble")->

  stave_notes: ->
    _(@notes).map (note)->
      note.duration ||= "h"
      note.clef ||= "treble"
      
      stave_note = new Vex.Flow.StaveNote(note)

      _(note.keys).each (key, i)->
        note_portion = key.split("/")[0]
        accidental = note_portion[1..note_portion.length]
        stave_note.addAccidental(i, new Vex.Flow.Accidental(accidental)) if accidental.length > 0
      stave_note
    
  render: (element)->
    console.log @notes

    this.draw_canvas element
    this.draw_stave "treble"
    this.draw_notes this.stave_notes()

