import { IDFactory, Point2D, shapeToIShape } from "../types.js";
export class AbstractShape {
    constructor() {
        this.marked = false;
        this.fillColor = "#00000000"; // Transparent Fill Color Default
        this.outlineColor = "#ff0000"; // red Border Default
        this.id = AbstractShape.counter++;
    }
}
AbstractShape.counter = 0;
export class User {
    constructor(color) {
        this.color = color;
    }
}
const player_1 = new User("blue");
class AbstractFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
    }
    handleMouseDown(x, y) {
        this.from = new Point2D(x, y);
    }
    handleMouseUp(x, y) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(shapeToIShape(this.createShape(this.from, new Point2D(x, y))));
        this.from = undefined;
    }
    handleMouseMove(x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x, y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x, y));
            this.shapeManager.addShape(shapeToIShape(this.tmpShape));
        }
    }
}
// export class Line implements Shape {
//     public readonly type = "Line"
export class Line extends AbstractShape {
    constructor(id, from, to) {
        super();
        this.id = id;
        this.from = from;
        this.to = to;
        this.type = 'Line';
    }
    draw(ctx, marked = true, fillStyle = player_1.color) {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.strokeStyle = this.outlineColor; // Set the outline color
        ctx.stroke();
        if (marked) {
            ctx.fillStyle = fillStyle;
            ctx.fillRect(this.from.x - 5, this.from.y - 5, 10, 10);
            ctx.fillRect(this.to.x - 5, this.to.y - 5, 10, 10);
        }
    }
}
export class LineFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Linie";
    }
    createShape(from, to) {
        return new Line(IDFactory.getNewId(), from, to);
    }
}
export class Circle extends AbstractShape {
    constructor(id, center, radius) {
        super();
        this.id = id;
        this.center = center;
        this.radius = radius;
        this.type = "Circle";
    }
    draw(ctx, marked = true, markColor = player_1.color) {
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = this.fillColor; // Use fillColor for the fill style
        ctx.fill();
        ctx.strokeStyle = this.outlineColor; // Set the outline color
        ctx.stroke();
        console.log("draw circle");
        if (marked) {
            ctx.fillStyle = markColor;
            // Top rectangle
            ctx.fillRect(this.center.x - 5, this.center.y - this.radius - 5, 10, 10);
            // Left rectangle
            ctx.fillRect(this.center.x - this.radius - 5, this.center.y - 5, 10, 10);
            // Right rectangle
            ctx.fillRect(this.center.x + this.radius - 5, this.center.y - 5, 10, 10);
            // Bottom rectangle
            ctx.fillRect(this.center.x - 5, this.center.y + this.radius - 5, 10, 10);
        }
    }
}
export class CircleFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Kreis";
    }
    createShape(from, to) {
        return new Circle(IDFactory.getNewId(), from, CircleFactory.computeRadius(from, to.x, to.y));
    }
    static computeRadius(from, x, y) {
        const xDiff = (from.x - x), yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
export class Rectangle extends AbstractShape {
    constructor(id, from, to) {
        super();
        this.id = id;
        this.from = from;
        this.to = to;
        this.type = "Rectangle";
    }
    draw(ctx, marked = true, markColor = player_1.color) {
        ctx.beginPath();
        ctx.rect(this.from.x, this.from.y, this.to.x - this.from.x, this.to.y - this.from.y);
        ctx.fillStyle = this.fillColor;
        ctx.fill();
        ctx.strokeStyle = this.outlineColor;
        ctx.stroke();
        if (marked) {
            ctx.fillStyle = markColor;
            ctx.fillRect(this.from.x - 5, this.from.y - 5, 10, 10); // Top left corner
            ctx.fillRect(this.to.x - 5, this.to.y - 5, 10, 10); // Bottom right corner
            ctx.fillRect(this.from.x - 5, this.to.y - 5, 10, 10); // Bottom left corner
            ctx.fillRect(this.to.x - 5, this.from.y - 5, 10, 10); // Top right corner
        }
    }
}
export class RectangleFactory extends AbstractFactory {
    constructor(shapeManager) {
        super(shapeManager);
        this.label = "Rechteck";
    }
    createShape(from, to) {
        return new Rectangle(IDFactory.getNewId(), from, to);
    }
}
export class Triangle extends AbstractShape {
    constructor(id, p1, p2, p3) {
        super();
        this.id = id;
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
        this.type = "Triangle";
    }
    draw(ctx, marked = true, markColor = player_1.color) {
        ctx.beginPath();
        ctx.moveTo(this.p1.x, this.p1.y);
        ctx.lineTo(this.p2.x, this.p2.y);
        ctx.lineTo(this.p3.x, this.p3.y);
        ctx.lineTo(this.p1.x, this.p1.y);
        ctx.stroke();
        ctx.fillStyle = this.fillColor; // Use fillColor for the fill style
        ctx.fill();
        ctx.strokeStyle = this.outlineColor; // Set the outline color
        if (marked) {
            ctx.fillStyle = markColor;
            ctx.fillRect(this.p1.x - 5, this.p1.y - 5, 10, 10);
            ctx.fillRect(this.p2.x - 5, this.p2.y - 5, 10, 10);
            ctx.fillRect(this.p3.x - 5, this.p3.y - 5, 10, 10);
        }
    }
}
export class TriangleFactory {
    constructor(shapeManager) {
        this.shapeManager = shapeManager;
        this.label = "Dreieck";
    }
    handleMouseDown(x, y) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape(shapeToIShape(new Triangle(IDFactory.getNewId(), this.from, this.tmpTo, new Point2D(x, y))));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        }
        else {
            this.from = new Point2D(x, y);
        }
    }
    handleMouseUp(x, y) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x, y);
            this.thirdPoint = new Point2D(x, y);
            this.tmpShape = new Triangle(IDFactory.getNewId(), this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape(shapeToIShape(this.tmpShape));
        }
    }
    handleMouseMove(x, y) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x, y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(IDFactory.getNewId(), this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape(shapeToIShape(this.tmpShape));
            }
        }
        else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x, y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(IDFactory.getNewId(), this.from, this.tmpTo);
                this.shapeManager.addShape(shapeToIShape(this.tmpLine));
            }
        }
    }
}
//# sourceMappingURL=Shapes%20Markes%20working%20and%20color%20changing.js.map