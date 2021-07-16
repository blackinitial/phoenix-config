// Preferences
Phoenix.set({
  daemon: true,
  openAtLogin: true,
});

// Globals
const HIDDEN_DOCK_MARGIN = 3;
const INCREMENT = 0.05;
const COMMAND_CONTROL = ['command', 'control'];
const CONTROL_SHIFT = ['control', 'shift'];
const CONTROL_OPTION_SHIFT = ['control', 'option', 'shift'];

// Relative Directions
const UP = 'up';
const RIGHT = 'right';
const DOWN = 'down';
const LEFT = 'left';
const CENTRE = 'centre';

// Cardinal Directions
const NW = 'nw';
const NE = 'ne';
const SE = 'se';
const SW = 'sw';

class ChainWindow {
  constructor(window, margin = 0) {
    this.window = window;
    this.margin = margin;
    this.frame = window.frame();
    this.parent = window.screen().flippedVisibleFrame();
  }

  // Difference frame
  difference() {
    const { parent, frame } = this;
    return {
      x: parent.x - frame.x,
      y: parent.y - frame.y,
      width: parent.width - frame.width,
      height: parent.height - frame.height,
    };
  }

  // Set frame
  set() {
    const { window, frame } = this;
    window.setFrame(frame);
    this.frame = window.frame();
    return this;
  }

  // Move to screen
  screen(screen) {
    this.parent = screen.flippedVisibleFrame();
    return this;
  }

  // Move to cardinal directions NW, NE, SE, SW or relative direction CENTRE
  to(direction) {
    const { parent, margin } = this;
    const difference = this.difference();

    // X-coordinate
    switch (direction) {
      case NW:
      case SW:
        this.frame.x = parent.x + margin;
        break;
      case NE:
      case SE:
        this.frame.x = parent.x + difference.width - margin;
        break;
      case CENTRE:
        this.frame.x = parent.x + difference.width / 2;
        break;
      default:
    }

    // Y-coordinate
    switch (direction) {
      case NW:
      case NE:
        this.frame.y = parent.y + margin;
        break;
      case SE:
      case SW:
        this.frame.y = parent.y + difference.height - margin;
        break;
      case CENTRE:
        this.frame.y = parent.y + difference.height / 2;
        break;
      default:
    }

    return this;
  }

  // Resize SE-corner by factor
  resize(factor) {
    const { parent, margin, frame } = this;
    const difference = this.difference();
    let delta;
    if (factor.width) {
      delta = Math.min(
        parent.width * factor.width,
        difference.x + difference.width - margin,
      );
      this.frame.width += delta;
    } else if (factor.height) {
      delta = Math.min(
        parent.height * factor.height,
        difference.height - frame.y + margin + HIDDEN_DOCK_MARGIN,
      );
      this.frame.height += delta;
    }
    return this;
  }

  // Maximise to fill whole screen
  maximise() {
    const { parent, margin } = this;
    this.frame.width = parent.width - 2 * margin;
    this.frame.height = parent.height - 2 * margin;
    return this;
  }

  // Halve height
  halveHeight() {
    this.frame.height /= 2;
    return this;
  }

  // Halve width
  halveWidth() {
    this.frame.width /= 2;
    return this;
  }

  // Fit to screen
  fit() {
    const difference = this.difference();
    if (difference.width < 0 || difference.height < 0) {
      this.maximise();
    }
    return this;
  }

  // Fill relatively to LEFT or RIGHT-side of screen, or fill whole screen
  fill(direction) {
    this.maximise();
    if (direction === UP || direction === DOWN) {
      this.halveHeight();
    }
    if (direction === LEFT || direction === RIGHT) {
      this.halveWidth();
    }
    switch (direction) {
      case UP:
        this.to(NW);
        break;
      case LEFT:
        this.to(NW);
        break;
      case RIGHT:
        this.to(NE);
        break;
      default:
        this.to(SE);
    }
    return this;
  }
}

// Chain a Window-object
Window.prototype.chain = function () {
  return new ChainWindow(this);
};

// To direction in screen
Window.prototype.to = function (direction, screen) {
  const window = this.chain();
  if (screen) {
    window.screen(screen).fit();
  }
  window.to(direction).set();
};

// Fill in screen
Window.prototype.fill = function (direction, screen) {
  const window = this.chain();
  if (screen) {
    window.screen(screen);
  }
  window.fill(direction).set();
  // Ensure position for windows larger than expected
  if (direction === RIGHT) {
    window.to(NE).set();
  }
};

// Resize by factor
Window.prototype.resize = function (factor) {
  this.chain().resize(factor).set();
};

/* Position Bindings */

Key.on('q', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(NW);
  }
});

Key.on('w', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(NE);
  }
});

Key.on('s', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(SE);
  }
});

Key.on('a', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(SW);
  }
});

Key.on('space', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(CENTRE);
  }
});

Key.on('q', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(NW, window.screen().next());
  }
});

Key.on('w', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(NE, window.screen().next());
  }
});

Key.on('s', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(SE, window.screen().next());
  }
});

Key.on('a', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(SW, window.screen().next());
  }
});

Key.on('space', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.to(CENTRE, window.screen().next());
  }
});

/* Fill Bindings */

Key.on('f', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill();
  }
});

// Half Window with Navigation Arrow
Key.on('up', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(UP);
  }
});

Key.on('right', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(RIGHT);
  }
});

Key.on('down', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(DOWN);
  }
});

Key.on('left', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(LEFT);
  }
});

Key.on('f', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill('', window.screen().next());
  }
});

// Half Window with Navigation Arrow
Key.on('up', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(UP, window.screen().next());
  }
});

Key.on('right', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(RIGHT, window.screen().next());
  }
});

Key.on('down', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(DOWN, window.screen().next());
  }
});

Key.on('left', CONTROL_OPTION_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.fill(LEFT, window.screen().next());
  }
});

/* Size Bindings */

Key.on('.', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.resize({ width: INCREMENT });
  }
});

Key.on(',', CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.resize({ width: -INCREMENT });
  }
});

Key.on("]", CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.resize({ height: INCREMENT });
  }
});

Key.on("[", CONTROL_SHIFT, () => {
  const window = Window.focused();
  if (window) {
    window.resize({ height: -INCREMENT });
  }
});

/* Focus Bindings */

Key.on('return', CONTROL_SHIFT, () => {
  const last = _.last(Window.recent());
  if (last) {
    last.focus();
  }
});

// Launch App
Key.on('t', COMMAND_CONTROL, function(){
  App.launch('Terminal').focus();
})

Key.on('c', COMMAND_CONTROL, function(){
  App.launch('Chrome').focus();
})

Key.on('n', COMMAND_CONTROL, function(){
  App.launch('Notion');
})
