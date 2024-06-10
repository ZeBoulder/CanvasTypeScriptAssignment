import { Circle, Line, Rectangle, Triangle } from "./Shapes.js";
export class Point2D {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}
export var ShapeEventType;
(function (ShapeEventType) {
    ShapeEventType["ShapeAdded"] = "ShapeAdded";
    ShapeEventType["ShapeRemoved"] = "ShapeRemoved";
    ShapeEventType["ShapeSelected"] = "ShapeSelected";
    ShapeEventType["ShapeUnselected"] = "ShapeUnselected";
    ShapeEventType["ShapeSetFillColor"] = "ShapeSetFillColor";
    ShapeEventType["ShapeSetOutlineColor"] = "ShapeSetOutlineColor";
    ShapeEventType["ShapesReorderedToFront"] = "ShapesReorderedToFront";
    ShapeEventType["ShapesReorderedToBack"] = "ShapesReorderedToBack";
    ShapeEventType["ShapesDeleted"] = "ShapesDeleted";
    ShapeEventType["ShapeMoved"] = "ShapeMoved";
})(ShapeEventType || (ShapeEventType = {}));
export class ShapeAdded {
    constructor(shape) {
        this.shape = shape;
        this.type = ShapeEventType.ShapeAdded;
    }
}
export class ShapeRemoved {
    constructor(id) {
        this.id = id;
        this.type = ShapeEventType.ShapeRemoved;
    }
}
export class ShapeSelected {
    constructor(id) {
        this.id = id;
        this.type = ShapeEventType.ShapeSelected;
    }
}
export class ShapeUnselected {
    constructor(id) {
        this.id = id;
        this.type = ShapeEventType.ShapeUnselected;
    }
}
export class ShapeSetFillColor {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.type = ShapeEventType.ShapeSetFillColor;
    }
}
export class ShapeSetOutlineColor {
    constructor(id, color) {
        this.id = id;
        this.color = color;
        this.type = ShapeEventType.ShapeSetOutlineColor;
    }
}
export class ShapesReorderedToFront {
    constructor(shapesOrder) {
        this.shapesOrder = shapesOrder;
        this.type = ShapeEventType.ShapesReorderedToFront;
    }
}
export class ShapesReorderedToBack {
    constructor(shapesOrder) {
        this.shapesOrder = shapesOrder;
        this.type = ShapeEventType.ShapesReorderedToBack;
    }
}
export class ShapesDeleted {
    constructor(shapeIds) {
        this.shapeIds = shapeIds;
        this.type = ShapeEventType.ShapesDeleted;
    }
}
export class ShapeMoved {
    constructor(id, dx, dy) {
        this.id = id;
        this.dx = dx;
        this.dy = dy;
        this.type = ShapeEventType.ShapeMoved;
    }
}
export class EventDispatcher {
    constructor() {
        this.views = [];
    }
    addView(view) {
        this.views.push(view);
    }
    applyEvents(events) {
        //TODO 
        this.views.forEach(v => {
            v.applyEvents(events);
        });
        return this;
    }
}
export function iShapeToShape(iShape) {
    let shape;
    if (iShape.type === "Line") {
        shape = new Line(iShape.id, iShape.from, iShape.to);
    }
    else if (iShape.type === "Rectangle") {
        shape = new Rectangle(iShape.id, iShape.from, iShape.to);
    }
    else if (iShape.type === "Circle") {
        shape = new Circle(iShape.id, iShape.center, iShape.radius);
    }
    else if (iShape.type === "Triangle") {
        shape = new Triangle(iShape.id, iShape.p1, iShape.p2, iShape.p3);
    }
    return shape;
}
export function shapeToIShape(shape) {
    if (shape.type === "Line") {
        return shape;
    }
    else if (shape.type === "Rectangle") {
        return shape;
    }
    else if (shape.type === "Circle") {
        return shape;
    }
    else if (shape.type === "Triangle") {
        return shape;
    }
}
export class IDFactory {
    static getNewId() {
        IDFactory.currentId++;
        return /* this.prefix + */ IDFactory.currentId;
    }
}
IDFactory.prefix = "test";
IDFactory.currentId = 0;
//# sourceMappingURL=types.js.map