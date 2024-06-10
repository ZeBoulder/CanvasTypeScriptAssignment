//Canvas.js

import {
  ToolArea,
  LineFactory,
  CircleFactory,
  RectangleFactory,
  TriangleFactory,
  SelectionFactory,
  User,
  Triangle,
  Line,
  Rectangle,
  Circle,
} from "./drawer - before event based.js";
import { Menu, MenuItem, RadioMenuItem, Separator } from "./MenuAPI.js";

class Canvas {
  constructor(canvasDomElement, toolarea) {
    this.shapes = {};
    this.shapesOrder = [];
    this.multiSelectedArray = [];
    const { width, height } = canvasDomElement.getBoundingClientRect();
    this.width = width;
    this.height = height;
    this.altPressed;
    this.ctrlPressed;
    this.ctx = canvasDomElement.getContext("2d");

    // Got help from suggested code from Chat GPT
    const handleKeyDown = (e) => {
      // console.log("Key Down: ", e.keyCode);

      // Handle Alt key press - only triggers once per press
      if (e.keyCode === 18 && !this.altPressed) {
        // 18 is the keycode for the Alt key
        this.altPressed = true;
        console.log("Alt key pressed: " + this.altPressed);
        e.preventDefault();
      }
      // Handle Control key press - only triggers once per press
      if (e.keyCode === 17 && !this.ctrlPressed) {
        // 17 is the keycode for the Ctrl key
        this.ctrlPressed = true;
        console.log("Ctrl key pressed: " + this.ctrlPressed);
      }
    };

    // Got help from suggested code from Chat GPT

    const handleKeyUp = (e) => {
      // console.log("Key up: ", e.keyCode);

      // Handle Alt key up
      if (e.keyCode === 18 && this.altPressed) {
        // 18 is the keycode for the Alt key
        this.altPressed = false;
        console.log("Alt key released: " + this.altPressed);
      }
      // Handle Control key up
      if (e.keyCode === 17 && this.ctrlPressed) {
        // 17 is the keycode for the Ctrl key
        this.ctrlPressed = false;
        console.log("Ctrl key released: " + this.ctrlPressed);
      }
    };

    // canvasDomElement.addEventListener("mousemove", (e) => {
    //   if (this.selectionFactory.isDragging) {
    //     this.selectionFactory.handleMouseMove(e);
    //   }
    // });
    // canvasDomElement.addEventListener("mousedown", (e) =>
    //   this.selectionFactory.handleMouseDown(e)
    // );
    // canvasDomElement.addEventListener("mouseup", (e) =>
    //   this.selectionFactory.handleMouseUp(e)
    // );

    canvasDomElement.addEventListener(
      "mousemove",
      createMouseHandler("handleMouseMove")
    );
    canvasDomElement.addEventListener(
      "mousedown",
      createMouseHandler("handleMouseDown")
    );
    canvasDomElement.addEventListener(
      "mouseup",
      createMouseHandler("handleMouseUp")
    );

    document.addEventListener("keydown", handleKeyDown.bind(this));
    document.addEventListener("keyup", handleKeyUp.bind(this));

    function createMouseHandler(methodName) {
      return function (e) {
        // e = e || window.event;
        if ("object" === typeof e) {
          const btnCode = e.button,
            x = e.pageX - this.offsetLeft,
            y = e.pageY - this.offsetTop,
            ss = toolarea.getSelectedShape();
          if (e.button === 0 && ss) {
            const m = ss[methodName];
            m.call(ss, x, y);
          }
        }
      };
    }
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.fillStyle = "lightgrey";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.stroke();

    for (let shape of this.shapesOrder) {
      shape.draw(this.ctx, shape.marked, player_1.color);
    }
    return this;
  }
  

  addShape(shape, redraw = true) {
    this.shapes[shape.id] = shape;
    this.shapesOrder.push(shape);
    return redraw ? this.draw() : this;
  }
  removeShape(shape, redraw = true) {
    const id = shape.id;
    delete this.shapes[id];
    this.shapesOrder = this.shapesOrder.filter((s) => s.id !== id);
    return redraw ? this.draw() : this;
  }
  removeShapeWithId(id, redraw = true) {
    delete this.shapes[id];
    this.shapesOrder = this.shapesOrder.filter((s) => s.id !== id);
    return redraw ? this.draw() : this;
  }
  reportShapes() {
    for (let shape of this.shapesOrder) {
      console.log("Shape selected: ", shape.id);
    }
  }

  deleteSelectedShapes(multiArray, redraw) {
    // Temporary array to store updated sub-arrays
    let updatedMultiSelectedArray = [];
    console.log(multiArray);
    // Loop through each sub-array in the multiSelectedArray
    multiArray.forEach((subArray, index) => {
      // Filter out shapes that are marked (as they will be removed)
      let updatedSubArray = subArray.filter((shape) => {
        if (shape.marked) {
          this.removeShapeWithId(shape.id, false); // Use 'false' to avoid redrawing each time
          console.log(`Shape ID ${shape.id} removed.`);
          return false; // Do not include this shape in the new sub-array
        }
        return true; // Include this shape in the new sub-array
      });

      // Store the updated sub-array
      updatedMultiSelectedArray.push(updatedSubArray);

      // After handling a sub-array, log its current state
      console.log(
        `Sub-array index ${index} after update contains:`,
        updatedSubArray.map((shape) => shape.id)
      );
    });

    // Update the main multiSelectedArray with the new sub-arrays
    this.multiSelectedArray = updatedMultiSelectedArray;

    // After all operations, log the entire state of multiSelectedArray
    console.log("Current state of multiSelectedArray:");
    this.multiSelectedArray.forEach((subArray, index) => {
      console.log(
        `Index ${index}:`,
        subArray.map((shape) => shape.id)
      );
    });

    if (redraw) {
      this.draw();
    }
  }

  // Helper function to find an array in multiSelectedArray that matches the given array
  findIndexInMultiSelected(newArray) {
    return this.multiSelectedArray.findIndex((selectedArray) => {
      return this.areArraysEqual(selectedArray, newArray);
    });
  }

  // Helper function to check if two arrays of shapes are equal based on their IDs
  areArraysEqual(array1, array2) {
    const ids1 = array1.map((shape) => shape.id).sort();
    const ids2 = array2.map((shape) => shape.id).sort();
    return (
      ids1.length === ids2.length &&
      ids1.every((value, index) => value === ids2[index])
    );
  }

  // Helper function to check the index of the next unmarked shape - but with correct direction to allow for proper hitbox when clicking shapes
  checkNextUnmarkedShapeInArray(selectedArray) {
    const lastMarkedIndex = selectedArray.reduce(
      (latest, shape, i) => (shape.marked ? i : latest),
      -1
    );
    if (lastMarkedIndex === -1) {
      // No shape is marked, start from the last shape
      return selectedArray.length - 1;
    } else {
      // Start checking from the shape before the last marked shape
      for (
        let i =
          (lastMarkedIndex - 1 + selectedArray.length) % selectedArray.length;
        i !== lastMarkedIndex;
        i = (i - 1 + selectedArray.length) % selectedArray.length
      ) {
        if (!selectedArray[i].marked) {
          return i;
        }
      }
    }
    return -1; // All shapes are marked
  }

  markNextInArray(selectedArray) {
    if (selectedArray.length === 0) {
      return;
    }
    const i = this.checkNextUnmarkedShapeInArray(selectedArray);
    if (i !== -1) {
      selectedArray[i].marked = true;
    }
  }

  selectShapesbyCoordinates(x, y, redraw = true) {
    const selectedArray = [];
    this.shapesOrder.forEach((shape) => {
      if (shape.contains(x, y)) {
        selectedArray.push(shape);
      }
    });

    // Normal Click
    if (!this.ctrlPressed && !this.altPressed) {
      this.shapesOrder.forEach((shape) => (shape.marked = false));
      // Clear previous selections and add the new one
      this.multiSelectedArray = [selectedArray];
      console.log(
        "Selected Array after normal click:",
        selectedArray.map((shape) => shape.id)
      );
      this.markNextInArray(selectedArray);
    }
    // Control held without Alt
    else if (this.ctrlPressed && !this.altPressed) {
      if (selectedArray.length !== 0) {
        const index = this.findIndexInMultiSelected(selectedArray);
        if (index !== -1) {
          //identical array found, no push of selectedArray required.  Will edit existing index of the selectedArray
          console.log(
            "Selected Array after control click and Array Exists:",
            selectedArray.map((shape) => shape.id)
          );
          // marks last shape in array by index
          this.multiSelectedArray[index][
            selectedArray.length - 1
          ].marked = true;
        } else {
          // No identical array, add the new selection
          this.multiSelectedArray.push(selectedArray);
          // marks last shape in array by index
          console.log(
            "Selected Array after control click:",
            selectedArray.map((shape) => shape.id)
          );
          selectedArray[selectedArray.length - 1].marked = true;
        }
      }
    }

    // Just Alt Pressed
    else if (this.altPressed) {
      if (selectedArray.length !== 0) {
        const index = this.findIndexInMultiSelected(selectedArray);
        // selectedArray already exists, and Control is pressed
        if (index !== -1 && this.ctrlPressed) {
          this.markNextInArray(selectedArray);
          // selectedArray already exists, and Control is NOT pressed
        } else if (index !== -1 && !this.ctrlPressed) {
          let indexToMark = this.checkNextUnmarkedShapeInArray(selectedArray);
          this.shapesOrder.forEach((shape) => (shape.marked = false));
          this.multiSelectedArray = [selectedArray];
          console.log("Multi Selected Array after alt click:", selectedArray);
          if (indexToMark !== -1) {
            selectedArray[indexToMark].marked = true;
          } else {
            selectedArray[0].marked = true;
          }
        }
        // selectedArray DOESNT already exists, and Control is pressed
        else if (index === -1 && this.ctrlPressed) {
          this.multiSelectedArray.push(selectedArray);
          console.log(
            "Multi Selected Array after control and alt click:",
            selectedArray
          );
          this.markNextInArray(selectedArray);
        }
        // selectedArray DOESNT already exists, and Control is NOT pressed
        else if (index === -1 && !this.ctrlPressed) {
          this.shapesOrder.forEach((shape) => (shape.marked = false));
          this.multiSelectedArray = [selectedArray];
          console.log("Multi Selected Array after alt click:", selectedArray);
          this.markNextInArray(selectedArray);
        }
      }
    }
    return redraw ? this.draw() : this;
  }

  moveSelectedShapes(dx, dy) {
    let boundaryHit = false;

    // Iterate through each sub-array in multiSelectedArray
    for (const shape of this.shapesOrder) {
      if (!shape.marked) continue;
      boundaryHit = shape.hitsBoundary(dx, dy, this.width, this.height);
      
      if (boundaryHit) break; 
    }
    
    if (!boundaryHit) {
      this.shapesOrder.forEach((shape) => {
        if (!shape.marked) return;
        shape.move(dx, dy);
      });

      // Redraw
      console.log("Redrawing canvas");

      this.ctx.clearRect(0, 0, this.width, this.height);
      this.draw();
    } else {
      console.log("Boundary hit, not moving shapes");
    }
  }
}

function init() {
  const canvasDomElm = document.getElementById("drawArea");
  const menu = document.getElementsByClassName("tools");
  // Problem here: Factories needs a way to create new Shapes, so they
  // have to call a method of the canvas.
  // The canvas on the other side wants to call the event methods
  // on the toolbar, because the toolbar knows what tool is currently
  // selected.
  // Anyway, we do not want the two to have references on each other
  let canvas;

  const sm = {
    addShape(s, rd) {
      return canvas.addShape(s, rd);
    },
    removeShape(s, rd) {
      return canvas.removeShape(s, rd);
    },
    removeShapeWithId(id, rd) {
      return canvas.removeShapeWithId(id, rd);
    },
    selectShapesbyCoordinates(x, y, rd) {
      return canvas.selectShapesbyCoordinates(x, y, rd);
    },
    moveSelectedShapes(dx, dy) {
      return canvas.moveSelectedShapes(dx, dy);
    },
    reportShapes() {
      return canvas.reportShapes();
    },
  };
  const { width, height } = canvasDomElm.getBoundingClientRect();
  const shapesSelector = [
    new LineFactory(sm),
    new CircleFactory(sm),
    new RectangleFactory(sm),
    new TriangleFactory(sm),
    new SelectionFactory(sm, width, height),
  ];
  const toolArea = new ToolArea(shapesSelector, menu[0]);
  canvas = new Canvas(canvasDomElm, toolArea);

  canvas.draw();

  setupMenu(canvas);
}
init();

// ------------------- Setting up Menu Contents -----------------------

// Set Up user that defines box colors
const player_1 = new User("blue");

// Set Up menu
function setupMenu(canvas) {
  // create Delete Selected Menu Item
  const deleteSelectedItems = new MenuItem("Delete Selected", (menu) => {
    canvas.deleteSelectedShapes(canvas.multiSelectedArray, true);
    menu.hideMenu();
  });

  // Create Move to front Menu item
  const moveItemsToFront = new MenuItem("Move to Front", (menu) => {
    moveMarkedShapesToFront(canvas);
    menu.hideMenu();
  });

  // Create Move to Back Menu item
  const moveItemsToBack = new MenuItem("Move to Back", (menu) => {
    moveMarkedShapesToBack(canvas);
    menu.hideMenu();
  });

  //Set Up Radio Button Options with respective functions
  let fillColorOptions = {
    Transparent: {
      label: " Transparent",
      action: () => setColorForShapes(canvas, "#00000000"),
    },

    Red: {
      label: " Red",
      action: () => setColorForShapes(canvas, "#ff0000"),
    },
    Green: {
      label: " Green",
      action: () => setColorForShapes(canvas, "#00ff00"),
    },

    Yellow: {
      label: " Yellow",
      action: () => setColorForShapes(canvas, "#ffff00"),
    },

    Blue: {
      label: " Blue",
      action: () => setColorForShapes(canvas, "#0000ff"),
    },

    Black: {
      label: " Black",
      action: () => setColorForShapes(canvas, "#000000"),
    },
  };

  let outlineColorOptions = {
    Red: {
      label: " Red",
      action: () => setOutlineColorForShapes(canvas, "#ff0000"),
    },
    Green: {
      label: " Green",
      action: () => setOutlineColorForShapes(canvas, "#00ff00"),
    },

    Yellow: {
      label: " Yellow",
      action: () => setOutlineColorForShapes(canvas, "#ffff00"),
    },

    Blue: {
      label: " Blue",
      action: () => setOutlineColorForShapes(canvas, "#0000ff"),
    },

    Black: {
      label: " Black",
      action: () => setOutlineColorForShapes(canvas, "#000000"),
    },
  };

  // Create instance of a new RadioItem
  let setShapeFillColor = new RadioMenuItem(
    "Set Fill Color",
    fillColorOptions,
    (color) => {
      setColorForShapes(canvas, color);
    }
  );
  let setShapeOutlineColor = new RadioMenuItem(
    "Set Outline Color",
    outlineColorOptions,
    (color) => {
      setOutlineColorForShapes(canvas, color);
    }
  );

  // Populate pop up menu
  const menu = new Menu();
  menu.addMenuItemAt(deleteSelectedItems, 0);
  menu.addMenuItemAt(new Separator(), 1);
  menu.addMenuItemAt(setShapeFillColor, 2);
  menu.addMenuItemAt(new Separator(), 3);
  menu.addMenuItemAt(setShapeOutlineColor, 4);
  menu.addMenuItemAt(new Separator(), 5);
  menu.addMenuItemAt(moveItemsToFront, 6);
  menu.addMenuItemAt(new Separator(), 7);
  menu.addMenuItemAt(moveItemsToBack, 8);

  // Create Event Listener for menu to pop up
  document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("contextmenu", (ev) => {
      ev.preventDefault();
      menu.createMenu(ev.clientX, ev.clientY);
    });
  });
}

// creating functions that are used by Radio Buttons
function setColorForShapes(canvas, color) {
  console.log("setColorForShapes called with color:", color);
  console.log(
    "Number of subarrays in multiSelectedArray:",
    canvas.multiSelectedArray.length
  );
  canvas.multiSelectedArray.forEach((subArray, index) => {
    console.log(`Processing subarray ${index + 1}, length: ${subArray.length}`);
    subArray.forEach((shape, shapeIndex) => {
      if (shape.marked) {
        console.log(
          `Setting color for shape ${shapeIndex + 1} in subarray ${
            index + 1
          }, current color: ${shape.fillColor}`
        );
        shape.fillColor = color;
        console.log(
          `New color for shape ${shapeIndex + 1}: ${shape.fillColor}`
        );
      }
    });
  });
  canvas.draw();
}

function setOutlineColorForShapes(canvas, color) {
  console.log("setOutlineColorForShapes called with color:", color);
  console.log(
    "Number of subarrays in multiSelectedArray:",
    canvas.multiSelectedArray.length
  );
  canvas.multiSelectedArray.forEach((subArray, index) => {
    console.log(`Processing subarray ${index + 1}, length: ${subArray.length}`);
    subArray.forEach((shape, shapeIndex) => {
      if (shape.marked) {
        console.log(
          `Setting color for shape ${shapeIndex + 1} in subarray ${
            index + 1
          }, current color: ${shape.outlineColor}`
        );
        shape.outlineColor = color;
        console.log(
          `New color for shape ${shapeIndex + 1}: ${shape.outlineColor}`
        );
      }
    });
  });
  canvas.draw();
}

function moveMarkedShapesToBack(canvas) {
  if (canvas.shapesOrder.length < 100) {
    let allMarkedShapes = [];

    // Rearrange within each sub-array in multiSelectedArray
    canvas.multiSelectedArray.forEach((subArray) => {
      let markedShapes = [];
      let unmarkedShapes = [];
      subArray.forEach((shape) => {
        if (shape.marked) {
          markedShapes.push(shape);
        } else {
          unmarkedShapes.push(shape);
        }
      });

      // Concatenate marked shapes to the back
      // console.log("Old subarray: " + canvas.multiSelectedArray.indexOf(subArray))
      let reorderedSubArray = markedShapes.concat(unmarkedShapes);
      let index = canvas.multiSelectedArray.indexOf(subArray);
      canvas.multiSelectedArray[index] = reorderedSubArray;
      // console.log("New subarray: " + canvas.multiSelectedArray.indexOf(subArray))

      allMarkedShapes.push(...markedShapes);
    });

    // Changes Shape order in the Shape order (for draw function)- all marked shapes to the back
    canvas.shapesOrder = canvas.shapesOrder.filter((shape) => !shape.marked); // Remove all marked shapes
    canvas.shapesOrder = [...allMarkedShapes, ...canvas.shapesOrder]; // Add them to the front

    canvas.draw(); // Redraw the canvas to reflect changes
  } else {
    console.log(
      "A binary tree or another balanced tree structure would be optimal to reorder the shapes with logarithmic efficiency. " +
        "While this linear solution suffices for fewer than 100 shapes, scaling to millions would significantly impact performance. Implementing " +
        "a binary tree would optimize reordering operations, but due to complexity, the current linear approach is used until further optimization is required."
    );
  }
}

function moveMarkedShapesToFront(canvas) {
  if (canvas.shapesOrder.length < 100) {
    let allMarkedShapes = [];

    // Rearrange within each sub-array in multiSelectedArray
    canvas.multiSelectedArray.forEach((subArray) => {
      let markedShapes = [];
      let unmarkedShapes = [];
      subArray.forEach((shape) => {
        if (shape.marked) {
          markedShapes.push(shape);
        } else {
          unmarkedShapes.push(shape);
        }
      });

      // Concatenate marked shapes to the front
      // console.log("Old subarray: " + canvas.multiSelectedArray.indexOf(subArray))
      let reorderedSubArray = unmarkedShapes.concat(markedShapes);
      let index = canvas.multiSelectedArray.indexOf(subArray);
      canvas.multiSelectedArray[index] = reorderedSubArray;
      // console.log("New subarray: " + canvas.multiSelectedArray.indexOf(subArray))

      allMarkedShapes.push(...markedShapes);
    });

    // Changes Shape order in the Shape order (for draw function)- all marked shapes to the front
    canvas.shapesOrder = canvas.shapesOrder.filter((shape) => !shape.marked); // Remove all marked shapes
    canvas.shapesOrder = [...canvas.shapesOrder, ...allMarkedShapes]; // Add them to the back

    canvas.draw(); // Redraw the canvas to reflect changes
  } else {
    console.log(
      "A binary tree or another balanced tree structure would be optimal to reorder the shapes with logarithmic efficiency. " +
        "While this linear solution suffices for fewer than 100 shapes, scaling to millions would significantly impact performance. Implementing " +
        "a binary tree would optimize reordering operations, but due to complexity, the current linear approach is used until further optimization is required."
    );
  }
}
