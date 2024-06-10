import {
    IShape,
    iShapeToShape,
    Shape,
    ShapeAdded,
    ShapeEvent,
    ShapeEventType,
    ShapeRemoved,
    ShapeView
} from "../types.js";
import {ToolArea} from "../ToolArea.js";
import {Line, Rectangle, Circle, Triangle} from "../Shapes.js";

export class Canvas implements ShapeView {
    private ctx: CanvasRenderingContext2D;
    private shapes: {[p: number]: Shape} = {};
    private width: number;
    private height: number;

    constructor(canvasDomElement: HTMLCanvasElement,
                toolarea: ToolArea) {
        const { width, height} = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.ctx = canvasDomElement.getContext("2d");
        canvasDomElement.addEventListener("mousemove",
            createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown",
            createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup",
            createMouseHandler("handleMouseUp"));

        function createMouseHandler(methodName: string) {
            return function (e) {
                e = e || window.event;

                if ('object' === typeof e) {
                    const btnCode = e.button,
                        x = e.pageX - this.offsetLeft,
                        y = e.pageY - this.offsetTop,
                        ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            }
        }
    }

    draw(): this {
        // TODO: it there a better way to reset the canvas?
        this.ctx.beginPath();
        this.ctx.fillStyle = 'lightgrey';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.stroke();

        // draw shapes
        this.ctx.fillStyle = 'black';
        for (let id in this.shapes) {
            this.shapes[id].draw(this.ctx);
        }
        return this;
    }

    applyEvents(events: ShapeEvent[]): this {
        // TODO: adjust second parameter so that redraw is set once for the last element
        events.forEach(e => {
            console.log(e);
            console.log("this is a test");
            if (e.type === ShapeEventType.ShapeAdded) {
                const eAdd = e as ShapeAdded;
                const shape = iShapeToShape(eAdd.shape);
                this.addShape(shape); // TODO: redraw
            } else if (e.type === ShapeEventType.ShapeRemoved) {
                const eRemoved = e as ShapeRemoved;
                this.removeShapeWithId(eRemoved.id); // TODO: redraw
            }
        });
        return this;
    }

    private addShape(shape: Shape, redraw: boolean = true): this {
        this.shapes[shape.id] = shape;
        return redraw ? this.draw() : this;
    }

    private removeShapeWithId(id: number, redraw: boolean = true): this {
        delete  this.shapes[id];
        return redraw ? this.draw() : this;
    }

    private removeShape(shape: Shape, redraw: boolean = true): this {
        const id = shape.id;
        return this.removeShapeWithId(id);
    }


}

