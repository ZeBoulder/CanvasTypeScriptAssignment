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