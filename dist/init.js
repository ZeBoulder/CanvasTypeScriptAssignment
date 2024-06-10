import { ShapeAdded, ShapeRemoved } from "./types.js";
import { CircleFactory, LineFactory, RectangleFactory, TriangleFactory } from "./Shapes.js";
import { ToolArea } from "./ToolArea.js";
import { Canvas } from "./Canvas.js";
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
    let ShapeTextArea;
    let eventFan = new EventFan();
    eventFan.register(canvas);
    envetFan.register(ShapeTextArea);
    const sm = {
        addShape(s, rd) {
            eventFan.applyEvents([new ShapeAdded(s)]);
            return this;
        },
        removeShape(s, rd) {
            eventFan.applyEvents([new ShapeRemoved(s.id)]); // .removeShape(s,rd);
            return this;
        },
        removeShapeWithId(id, rd) {
            eventFan.applyEvents([new ShapeRemoved(id)]); // .removeShapeWithId(id, rd);
            return this;
        }
    };
    const shapesSelector = [
        new LineFactory(sm),
        new CircleFactory(sm),
        new RectangleFactory(sm),
        new TriangleFactory(sm)
    ];
    const toolArea = new ToolArea(shapesSelector, menu[0]);
    canvas = new Canvas(canvasDomElm, toolArea);
    //canvas.draw();
}
init();
//# sourceMappingURL=init.js.map