import { Menu, MenuItem, RadioMenuItem, Separator } from "./MenuAPI.js";
import { ShapeAdded, ShapeRemoved, ShapeSetFillColor, ShapeSetOutlineColor, ShapesReorderedToFront, ShapesReorderedToBack, EventDispatcher } from "./types.js";
import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory, SelectionFactory } from "./Shapes.js";
import { ToolArea } from "./ToolArea.js";
import { Canvas } from "./Canvas.js";
import { TextAreaView } from "./TextAreaView.js";
function init() {
    document.addEventListener("DOMContentLoaded", function () {
        setupCanvas();
    });
}
init();
function setupCanvas() {
    const canvasDomElm = document.getElementById("drawArea");
    const menu = document.getElementsByClassName("tools");
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
    let eventDispatcher = new EventDispatcher();
    window.theBestEventDispatcherEver = eventDispatcher;
    let canvas;
    let context;
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
    context = { canvas, eventDispatcher };
    setupMenu(context);
    const textAreaView = new TextAreaView(document.getElementById("textFieldTimeMachine"));
    eventDispatcher.addView(canvas);
    eventDispatcher.addView(textAreaView);
    canvas.draw();
    document.getElementById("myButton").addEventListener("click", () => {
        const log = document.getElementById("textFieldTimeMachine").value;
        const events = canvas.parseEventLog(log);
        // Clear the variables
        canvas.clearCanvas();
        canvas.applyEvents(events);
        canvas.draw();
    });
}
// ------------------- Setting up Menu Contents -----------------------
// Set Up menu
function setupMenu({ canvas, eventDispatcher }) {
    let context = { canvas, eventDispatcher };
    // create Delete Selected Menu Item
    const deleteSelectedItems = new MenuItem("Delete Selected", (menu) => {
        canvas.deleteSelectedShapes(canvas.multiSelectedArray, true);
        menu.hideMenu();
    });
    // Create Move to front Menu item
    const moveItemsToFront = new MenuItem("Move to Front", (menu) => {
        // moveMarkedShapesToFront(canvas);
        // canvas.reorderMarkedShapesToBack();
        triggerReorderShapesToFront();
        menu.hideMenu();
    });
    // Create Move to Back Menu item
    const moveItemsToBack = new MenuItem("Move to Back", (menu) => {
        // moveMarkedShapesToBack(canvas);
        // canvas.reorderMarkedShapesToBack();
        triggerReorderShapesToBack();
        menu.hideMenu();
    });
    function triggerReorderShapesToFront() {
        const markedShapes = canvas.getShapesOrder().filter(id => { var _a; return (_a = canvas.getShapeById(id)) === null || _a === void 0 ? void 0 : _a.marked; });
        const unmarkedShapes = canvas.getShapesOrder().filter(id => { var _a; return !((_a = canvas.getShapeById(id)) === null || _a === void 0 ? void 0 : _a.marked); });
        const newOrder = [...unmarkedShapes, ...markedShapes];
        eventDispatcher.applyEvents([new ShapesReorderedToFront(newOrder)]);
    }
    function triggerReorderShapesToBack() {
        const markedShapes = canvas.getShapesOrder().filter(id => { var _a; return (_a = canvas.getShapeById(id)) === null || _a === void 0 ? void 0 : _a.marked; });
        const unmarkedShapes = canvas.getShapesOrder().filter(id => { var _a; return !((_a = canvas.getShapeById(id)) === null || _a === void 0 ? void 0 : _a.marked); });
        const newOrder = [...markedShapes, ...unmarkedShapes];
        eventDispatcher.applyEvents([new ShapesReorderedToBack(newOrder)]);
    }
    //Set Up Radio Button Options with respective functions
    let fillColorOptions = {
        Transparent: {
            label: " Transparent",
            action: () => setColorForShapes(context, "#00000000"),
        },
        Red: {
            label: " Red",
            action: () => setColorForShapes(context, "#ff0000"),
        },
        Green: {
            label: " Green",
            action: () => setColorForShapes(context, "#00ff00"),
        },
        Yellow: {
            label: " Yellow",
            action: () => setColorForShapes(context, "#ffff00"),
        },
        Blue: {
            label: " Blue",
            action: () => setColorForShapes(context, "#0000ff"),
        },
        Black: {
            label: " Black",
            action: () => setColorForShapes(context, "#000000"),
        },
    };
    let outlineColorOptions = {
        Red: {
            label: " Red",
            action: () => setOutlineColorForShapes(context, "#ff0000"),
        },
        Green: {
            label: " Green",
            action: () => setOutlineColorForShapes(context, "#00ff00"),
        },
        Yellow: {
            label: " Yellow",
            action: () => setOutlineColorForShapes(context, "#ffff00"),
        },
        Blue: {
            label: " Blue",
            action: () => setOutlineColorForShapes(context, "#0000ff"),
        },
        Black: {
            label: " Black",
            action: () => setOutlineColorForShapes(context, "#000000"),
        },
    };
    // Create instance of a new RadioItem
    let setShapeFillColor = new RadioMenuItem("Set Fill Color", fillColorOptions, (color) => {
        setColorForShapes(context, color);
    });
    let setShapeOutlineColor = new RadioMenuItem("Set Outline Color", outlineColorOptions, (color) => {
        setOutlineColorForShapes(context, color);
    });
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
    // document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("contextmenu", (ev) => {
        ev.preventDefault();
        menu.createMenu(ev.clientX, ev.clientY);
    });
    // });
}
// creating functions that are used by Radio Buttons
function setColorForShapes({ canvas, eventDispatcher }, color) {
    if (!canvas) {
        console.error('Canvas is not defined');
        return;
    }
    console.log("setColorForShapes called with color:", color);
    console.log("Number of subarrays in multiSelectedArray:", canvas.multiSelectedArray.length);
    canvas.multiSelectedArray.forEach((subArray, index) => {
        console.log(`Processing subarray ${index + 1}, length: ${subArray.length}`);
        subArray.forEach((shape, shapeIndex) => {
            if (shape.marked) {
                console.log(`Setting color for shape ${shapeIndex + 1} in subarray ${index + 1}, current color: ${shape.fillColor}`);
                // shape.fillColor = color;
                triggerChangeShapeFillColor({ eventDispatcher }, shape.id, color);
                console.log(`New color for shape ${shapeIndex + 1}: ${shape.fillColor}`);
            }
        });
    });
    canvas.draw();
}
function triggerChangeShapeFillColor({ eventDispatcher }, id, color) {
    eventDispatcher.applyEvents([new ShapeSetFillColor(id, color)]);
}
function setOutlineColorForShapes({ canvas, eventDispatcher }, color) {
    console.log("setOutlineColorForShapes called with color:", color);
    console.log("Number of subarrays in multiSelectedArray:", canvas.multiSelectedArray.length);
    canvas.multiSelectedArray.forEach((subArray, index) => {
        console.log(`Processing subarray ${index + 1}, length: ${subArray.length}`);
        subArray.forEach((shape, shapeIndex) => {
            if (shape.marked) {
                console.log(`Setting color for shape ${shapeIndex + 1} in subarray ${index + 1}, current color: ${shape.outlineColor}`);
                // shape.outlineColor = color;
                triggerChangeShapeOutlineColor({ eventDispatcher }, shape.id, color);
                console.log(`New color for shape ${shapeIndex + 1}: ${shape.outlineColor}`);
            }
        });
    });
    canvas.draw();
}
function triggerChangeShapeOutlineColor({ eventDispatcher }, id, color) {
    eventDispatcher.applyEvents([new ShapeSetOutlineColor(id, color)]);
}
//# sourceMappingURL=init.js.map