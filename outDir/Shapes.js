import { IDFactory, Point2D, shapeToIShape } from "./types.js";
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
    move(dx, dy) {
        this.from.x += dx;
        this.from.y += dy;
        this.to.x += dx;
        this.to.y += dy;
    }
    // Check if shape will hit the canvas boundary after move
    hitsBoundary(dx, dy, canvasWidth, canvasHeight) {
        if (this.from.x + dx < 0 ||
            this.from.x + dx > canvasWidth ||
            this.from.y + dy < 0 ||
            this.from.y + dy > canvasHeight ||
            this.to.x + dx < 0 ||
            this.to.x + dx > canvasWidth ||
            this.to.y + dy < 0 ||
            this.to.y + dy > canvasHeight) {
            console.log("Boundary hit detected for Line");
            return true;
        }
        return false;
    }
    draw(ctx, marked = this.marked, markColor = player_1.color) {
        ctx.beginPath();
        ctx.moveTo(this.from.x, this.from.y);
        ctx.lineTo(this.to.x, this.to.y);
        ctx.strokeStyle = this.outlineColor; // Set the outline color
        ctx.stroke();
        if (marked) {
            ctx.fillStyle = markColor;
            ctx.fillRect(this.from.x - 5, this.from.y - 5, 10, 10);
            ctx.fillRect(this.to.x - 5, this.to.y - 5, 10, 10);
        }
    }
    contains(x, y, tolerance = 15) {
        const { from, to } = this;
        // Line vector
        const lineVec = { x: to.x - from.x, y: to.y - from.y };
        // Vector from from to point
        const pointVec = { x: x - from.x, y: y - from.y };
        const lineLen = Math.sqrt(lineVec.x * lineVec.x + lineVec.y * lineVec.y);
        const lineUnitVec = { x: lineVec.x / lineLen, y: lineVec.y / lineLen };
        // Project pointVec onto the line vector
        const projLength = (pointVec.x * lineUnitVec.x + pointVec.y * lineUnitVec.y);
        const proj = { x: projLength * lineUnitVec.x, y: projLength * lineUnitVec.y };
        const normalDistance = Math.sqrt((pointVec.x - proj.x) * (pointVec.x - proj.x) +
            (pointVec.y - proj.y) * (pointVec.y - proj.y));
        if (normalDistance <= tolerance && projLength >= 0 && projLength <= lineLen) {
            return true;
        }
        // Check endpoints if point projection is outside the line segment
        const distToStart = Math.sqrt(pointVec.x * pointVec.x + pointVec.y * pointVec.y);
        const distToEnd = Math.sqrt((x - to.x) * (x - to.x) + (y - to.y) * (y - to.y));
        return distToStart <= tolerance || distToEnd <= tolerance;
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
    move(dx, dy) {
        this.center.x += dx;
        this.center.y += dy;
    }
    // Check if shape will hit the canvas boundary after move
    hitsBoundary(dx, dy, canvasWidth, canvasHeight) {
        // Calculate new position after move
        const newX = this.center.x + dx;
        const newY = this.center.y + dy;
        // Check if circle is already at a boundary and trying to move further out
        if ((this.center.x - this.radius < 0 && newX < this.center.x) ||
            (this.center.x + this.radius > canvasWidth && newX > this.center.x)) {
            return true;
        }
        if ((this.center.y - this.radius < 0 && newY < this.center.y) ||
            (this.center.y + this.radius > canvasHeight && newY > this.center.y)) {
            return true;
        }
        // Check if circle will move out of canvas after move - if the new position is closer to the middle of the canvas, circle can move even if it is touching canvas walls
        if ((newX - this.radius < 0 && dx < 0) ||
            (newX + this.radius > canvasWidth && dx > 0) ||
            (newY - this.radius < 0 && dy < 0) ||
            (newY + this.radius > canvasHeight && dy > 0)) {
            return true;
        }
        return false;
    }
    draw(ctx, marked = this.marked, markColor = player_1.color) {
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
    contains(x, y) {
        let dx = this.center.x - x;
        let dy = this.center.y - y;
        return dx * dx + dy * dy <= this.radius * this.radius;
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
    move(dx, dy) {
        this.from.x += dx;
        this.from.y += dy;
        this.to.x += dx;
        this.to.y += dy;
    }
    // Check if shape will hit the canvas boundary after move
    hitsBoundary(dx, dy, canvasWidth, canvasHeight) {
        if (this.from.x + dx < 0 ||
            this.from.x + dx > canvasWidth ||
            this.from.y + dy < 0 ||
            this.from.y + dy > canvasHeight ||
            this.to.x + dx < 0 ||
            this.to.x + dx > canvasWidth ||
            this.to.y + dy < 0 ||
            this.to.y + dy > canvasHeight) {
            console.log("Boundary hit detected for Line");
            return true;
        }
        return false;
    }
    draw(ctx, marked = this.marked, markColor = player_1.color) {
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
    contains(x, y) {
        let xMin = Math.min(this.from.x, this.to.x);
        let xMax = Math.max(this.from.x, this.to.x);
        let yMin = Math.min(this.from.y, this.to.y);
        let yMax = Math.max(this.from.y, this.to.y);
        return x >= xMin && x <= xMax && y >= yMin && y <= yMax;
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
    move(dx, dy) {
        this.p1.x += dx;
        this.p1.y += dy;
        this.p2.x += dx;
        this.p2.y += dy;
        this.p3.x += dx;
        this.p3.y += dy;
    }
    // Check if shape will hit the canvas boundary after move
    hitsBoundary(dx, dy, canvasWidth, canvasHeight) {
        if (this.p1.x + dx < 0 ||
            this.p1.x + dx > canvasWidth ||
            this.p1.y + dy < 0 ||
            this.p1.y + dy > canvasHeight ||
            this.p2.x + dx < 0 ||
            this.p2.x + dx > canvasWidth ||
            this.p2.y + dx < 0 ||
            this.p2.y + dy > canvasHeight ||
            this.p3.x + dx < 0 ||
            this.p3.x + dx > canvasWidth ||
            this.p3.y + dy < 0 ||
            this.p3.y + dy > canvasHeight) {
            console.log("Boundary hit detected for Line");
            return true;
        }
        return false;
    }
    draw(ctx, marked = this.marked, markColor = player_1.color) {
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
    contains(x, y) {
        const point = { x: x, y: y };
        const area = Math.abs((this.p1.x * (this.p2.y - this.p3.y) + this.p2.x * (this.p3.y - this.p1.y) + this.p3.x * (this.p1.y - this.p2.y)) / 2);
        const area1 = Math.abs((point.x * (this.p2.y - this.p3.y) + this.p2.x * (this.p3.y - point.y) + this.p3.x * (point.y - this.p2.y)) / 2);
        const area2 = Math.abs((this.p1.x * (point.y - this.p3.y) + point.x * (this.p3.y - this.p1.y) + this.p3.x * (this.p1.y - point.y)) / 2);
        const area3 = Math.abs((this.p1.x * (this.p2.y - point.y) + this.p2.x * (point.y - this.p1.y) + point.x * (this.p1.y - this.p2.y)) / 2);
        return Math.abs(area - (area1 + area2 + area3)) < 0.01;
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
export class Selection extends AbstractShape {
    constructor(id, startX, startY) {
        super();
        this.id = id;
        this.startX = startX;
        this.startY = startY;
        this.type = 'Selection';
        this.selectedShapes = [];
    }
    // just did this to get rid of the error and make Selection an AbstractShape
    draw(ctx, marked = this.marked, fillStyle = '') {
    }
    // just did this to get rid of the error and make Selection an AbstractShape
    contains(x, y) {
        return true;
    }
    // just did this to get rid of the error and make Selection an AbstractShape
    move(dx, dy) {
        console.log('Selection move called');
    }
    // just did this to get rid of the error and make Selection an AbstractShape
    hitsBoundary(dx, dy, canvasWidth, canvasHeight) {
        return false;
    }
}
export class SelectionFactory extends AbstractFactory {
    constructor(shapeManager, canvasWidth, canvasHeight) {
        super(shapeManager);
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.label = "Selection";
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
    }
    // just did this to get rid of the error and make SelectionFactory an AbstractFactory
    createShape(from, to) {
        return new Selection(IDFactory.getNewId(), from.x, from.y);
    }
    handleMouseDown(x, y) {
        console.log(`handleMouseDown called with coordinates: (${x}, ${y})`);
        this.shapeManager.selectShapesbyCoordinates(x, y);
        this.isDragging = true;
        this.startX = x;
        this.startY = y;
    }
    handleMouseMove(x, y) {
        const event = { clientX: x, clientY: y };
        if (!this.isDragging)
            return;
        // Calculate the current mouse position relative to the canvas
        const currentX = event.clientX;
        const currentY = event.clientY;
        // Calculate the delta from the initial position
        const dx = currentX - this.startX;
        const dy = currentY - this.startY;
        console.log('event: ' + event);
        console.log('canvasWidth: ' + this.canvasWidth, 'canvasHeight: ' + this.canvasHeight);
        console.log('eventX: ' + event.clientX, 'eventY: ' + event.clientY);
        console.log('currentX: ' + currentX + ' currentY: ' + currentY);
        console.log(`handleMouseMove called with dx: ${dx}, dy: ${dy}`);
        this.shapeManager.moveSelectedShapes(dx, dy);
        this.startX = event.clientX;
        this.startY = event.clientY;
    }
    handleMouseUp() {
        console.log('handleMouseUp called');
        this.isDragging = false;
    }
}
//# sourceMappingURL=Shapes.js.map