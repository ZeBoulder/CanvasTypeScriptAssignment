import { Menu, MenuItem, RadioMenuItem, Separator } from "./MenuAPI.js";
import { ShapeAdded, ShapeRemoved, ShapeSetFillColor, ShapeSetOutlineColor, ShapesReorderedToFront, ShapesReorderedToBack, EventDispatcher  } from "./types.js";
import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory, SelectionFactory } from "./Shapes.js";
import { ToolArea } from "./ToolArea.js";
import { Canvas } from "./Canvas.js";
import { TextAreaView } from "./TextAreaView.js"
function init() {
    const canvasDomElm = document.getElementById("drawArea") as HTMLCanvasElement;
    const menu = document.getElementsByClassName("tools");

    document.addEventListener("DOMContentLoaded", function() {
      // Create a text field
      var textField = document.createElement("textarea");
      textField.setAttribute("type", "text");
      textField.setAttribute("id", "textFieldTimeMachine");
  
      // Create a button
      var button = document.createElement("button");
      button.setAttribute("id", "myButton");
      button.textContent = "Click me";
  
      // Append the text field and button to the populatedDiv
      var populatedDiv = document.getElementById("populatedDiv");
      populatedDiv.appendChild(textField);
      populatedDiv.appendChild(button);
  });

    let eventDispatcher = new EventDispatcher();
    let canvas;
    
    const sm = {
        addShape(s, rd) {
            eventDispatcher.applyEvents([new ShapeAdded(s)]);
            return this;
        },
        removeShape(s, rd) {
          eventDispatcher.applyEvents([new ShapeRemoved(s.id)]); // .removeShape(s,rd);
            return this;
        },
        removeShapeWithId(id, rd) {
          eventDispatcher.applyEvents([new ShapeRemoved(id)]); // .removeShapeWithId(id, rd);
            return this;
        }, 
        selectShapesbyCoordinates(x, y, rd) {
            return canvas.selectShapesbyCoordinates(x, y, rd);
          },
        moveSelectedShapes(dx, dy) {
        return canvas.moveSelectedShapes(dx, dy);
        },
    };
    const { width, height } = canvasDomElm.getBoundingClientRect();
    const shapesSelector = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm),
        new SelectionFactory(sm, width, height)
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea);

    const textAreaView = new TextAreaView(document.getElementById("textFieldTimeMachine") as HTMLTextAreaElement)
    eventDispatcher.addView(canvas);
    eventDispatcher.addView(textAreaView);

    canvas.draw();

    document.getElementById("myButton").addEventListener("click", () => {
      const log = (document.getElementById("textField") as HTMLTextAreaElement).value;
      const events = this.parseEventLog(log);

      // Clear the variables
      canvas.clearCanvas();
      canvas.applyEvents(events);
      canvas.draw();
  });

    setupMenu(canvas);
}
init();


// ------------------- Setting up Menu Contents -----------------------


// Set Up menu

function setupMenu(canvas) {
  // create Delete Selected Menu Item
  const deleteSelectedItems = new MenuItem("Delete Selected", (menu) => {
      canvas.deleteSelectedShapes(canvas.multiSelectedArray, true);
      menu.hideMenu();
  });

  // Create Move to front Menu item
  const moveItemsToFront = new MenuItem("Move to Front", (menu) => {
    // moveMarkedShapesToFront(canvas);
    // canvas.reorderMarkedShapesToBack();
    triggerReorderShapesToFront(canvas);
    menu.hideMenu();
  });

  // Create Move to Back Menu item
  const moveItemsToBack = new MenuItem("Move to Back", (menu) => {
    // moveMarkedShapesToBack(canvas);
    // canvas.reorderMarkedShapesToBack();
    triggerReorderShapesToBack(canvas);
    menu.hideMenu();
  });

  function triggerReorderShapesToFront(canvas: Canvas) {
    const markedShapes = canvas.getShapesOrder().filter(id => canvas.getShapeById(id)?.marked);
    const unmarkedShapes = canvas.getShapesOrder().filter(id => !canvas.getShapeById(id)?.marked);
    const newOrder = [...unmarkedShapes, ...markedShapes];
    canvas.applyEvents([new ShapesReorderedToFront(newOrder)]);
}

function triggerReorderShapesToBack(canvas: Canvas) {
    const markedShapes = canvas.getShapesOrder().filter(id => canvas.getShapeById(id)?.marked);
    const unmarkedShapes = canvas.getShapesOrder().filter(id => !canvas.getShapeById(id)?.marked);
    const newOrder = [...markedShapes, ...unmarkedShapes];
    canvas.applyEvents([new ShapesReorderedToBack(newOrder)]);
}

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
        // shape.fillColor = color;
        triggerChangeShapeFillColor(canvas, shape.id, color);       
        console.log(
          `New color for shape ${shapeIndex + 1}: ${shape.fillColor}`
        );
      }
    });
  });
  canvas.draw();
}

function triggerChangeShapeFillColor(canvas: Canvas, id:number, color: string){
  canvas.applyEvents([new ShapeSetFillColor(id, color)])
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
        // shape.outlineColor = color;
        triggerChangeShapeOutlineColor(canvas, shape.id, color);       

        console.log(
          `New color for shape ${shapeIndex + 1}: ${shape.outlineColor}`
        );
      }
    });
  });
  canvas.draw();
}

function triggerChangeShapeOutlineColor(canvas: Canvas, id:number, color: string){
  canvas.applyEvents([new ShapeSetOutlineColor(id, color)])
}

