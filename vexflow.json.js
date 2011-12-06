(function() {

  if (!(Vex && Vex.Flow)) {
    throw "Please be sure vexflow is required before requiring vexflow.json."
  }

  Vex.Flow.JSON = function(data) {
    this.data = data;
    this.stave_offset = 0;
    this.stave_delta = 80;
    this.staves = {};
    this.interpret_data();
  }

  Vex.Flow.JSON.prototype.interpret_data = function() {
    if (this.data instanceof Array) {
      if (this.data[0] instanceof Array) {
        this.clef = "treble";
        this.notes = this.interpret_notes(this.data);
      } else if (typeof this.data[0] === "string") {
        this.clef = "treble";
        this.notes = this.interpret_notes([ { keys: this.data } ]);
      }
    } else if (this.data.keys) {
      this.clef = "treble";
      this.notes = this.interpret_notes([this.data]);
    } else {
      this.clef = this.data.clef;
      this.notes = this.interpret_notes(this.data.notes);
    }
  };

  Vex.Flow.JSON.prototype.interpret_notes = function(data) {
    return _(data).map(function(datum) {
      if (typeof datum === "string") {
        return { duration: "q", keys: this.interpret_keys([datum]) };
      } else if (datum instanceof Array) {
        return { duration: "q", keys: this.interpret_keys(datum) };
      } else {
        datum.keys = this.interpret_keys(datum.keys);
        datum.duration || (datum.duration = "q");
        return datum;
      }
    }, this);
  };

  Vex.Flow.JSON.prototype.interpret_keys = function(data) {
    return _(data).map(function(datum) {
      var note_portion, octave_portion, _ref;
      _ref = datum.split("/"), note_portion = _ref[0], octave_portion = _ref[1];
      octave_portion || (octave_portion = "4");
      return "" + note_portion + "/" + octave_portion;
    });
  };

  Vex.Flow.JSON.prototype.draw_canvas = function(canvas) {
    this.canvas = canvas;
    this.renderer = new Vex.Flow.Renderer(this.canvas, Vex.Flow.Renderer.Backends.CANVAS);
    this.context = this.renderer.getContext();
  };

  Vex.Flow.JSON.prototype.draw_stave = function(clef, options) {
    if (clef == null) clef = "treble";
    if (options == null) options = {};

    this.staves[clef] = new Vex.Flow.Stave(10, this.stave_offset, this.width - 20);
    this.staves[clef].addClef(clef).setContext(this.context).draw();
    this.stave_offset += this.stave_delta;
  };

  Vex.Flow.JSON.prototype.draw_notes = function(notes) {
    Vex.Flow.Formatter.FormatAndDraw(this.context, this.staves[this.clef], notes);
  };

  Vex.Flow.JSON.prototype.stave_notes = function() {
    return _(this.notes).map(function(note) {
      var stave_note;
      note.duration || (note.duration = "h");
      note.clef || (note.clef = "treble");
      stave_note = new Vex.Flow.StaveNote(note);

      _(note.keys).each(function(key, i) {
        var accidental, note_portion;
        note_portion = key.split("/")[0];
        accidental = note_portion.slice(1, (note_portion.length + 1) || 9e9);

        if (accidental.length > 0) {
          stave_note.addAccidental(i, new Vex.Flow.Accidental(accidental));
        }
      });
      return stave_note;
    });
  };

  Vex.Flow.JSON.prototype.render = function(element, options) {
    options = (options || {});
    this.width = options.width || element.width || 600;
    this.height = options.height || element.height || 120;
    
    this.draw_canvas(element);
    this.draw_stave("treble");
    this.draw_notes(this.stave_notes());
  };

}).call(this);

