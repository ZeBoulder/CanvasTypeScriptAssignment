import {IDFactory, Point2D, Shape, ShapeFactory, ShapeManager, shapeToIShape, ShapeType} from "../types.js";


export abstract class AbstractShape implements Shape {
    private static counter: number = 0;
    readonly id: number;
    abstract readonly type: ShapeType;
    
    constructor() {
        this.id = AbstractShape.counter++;
    }

    abstract draw(ctx: CanvasRenderingContext2D): void;
    abstract contains(x: number, y: number): boolean;

    marked: boolean = false;
    fillColor: string = "#00000000"; // Transparent Fill Color Default
    outlineColor: string = "#ff0000";// red Border Default
}


export class User {
    color: string; 
    constructor(color: string) {
        this.color = color;
    }
}

const player_1 = new User("blue"); 

abstract class AbstractFactory<T extends Shape> {
    private from: Point2D;
    private tmpTo: Point2D;
    private tmpShape: T;

    constructor(readonly shapeManager: ShapeManager) {}

    abstract createShape(from: Point2D, to: Point2D): T;

    handleMouseDown(x: number, y: number) {
        this.from = new Point2D(x, y);
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
        }
        this.shapeManager.addShape(shapeToIShape(this.createShape(this.from, new Point2D(x,y))));
        this.from = undefined;

    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }
        if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
            this.tmpTo = new Point2D(x,y);
            if (this.tmpShape) {
                // remove the old temp line, if there was one
                this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            }
            // adds a new temp line
            this.tmpShape = this.createShape(this.from, new Point2D(x,y));
            this.shapeManager.addShape( shapeToIShape(this.tmpShape) );
        }
    }

}
// export class Line implements Shape {
//     public readonly type = "Line"
export class Line extends AbstractShape {
    readonly type: ShapeType = 'Line';
    constructor(readonly id: number, readonly from: Point2D, readonly to: Point2D){
        super();
    }

    draw(ctx: CanvasRenderingContext2D, marked: boolean = true, fillStyle: string = player_1.color) {
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
export class LineFactory extends  AbstractFactory<Line> implements ShapeFactory {

    public label: string = "Linie";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Line {
        return new Line(IDFactory.getNewId(), from, to);
    }

}
export class Circle extends AbstractShape {
    public readonly type = "Circle"
    constructor(readonly id: number, readonly center: Point2D, readonly radius: number){
        super();
    }
    draw(ctx: CanvasRenderingContext2D, marked: boolean = true, markColor: string = player_1.color) {
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
export class CircleFactory extends AbstractFactory<Circle> implements ShapeFactory {
    public label: string = "Kreis";

    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Circle {
        return new Circle(IDFactory.getNewId(), from, CircleFactory.computeRadius(from, to.x, to.y));
    }

    private static computeRadius(from: Point2D, x: number, y: number): number {
        const xDiff = (from.x - x),
            yDiff = (from.y - y);
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }
}
export class Rectangle extends AbstractShape {
    public readonly type = "Rectangle"

    constructor(readonly id: number, readonly from: Point2D, readonly to: Point2D) {
        super();
    }

    draw(ctx: CanvasRenderingContext2D, marked: boolean = true, markColor: string = player_1.color) {
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
export class RectangleFactory extends AbstractFactory<Rectangle> implements ShapeFactory{
    public label: string = "Rechteck";
    constructor(shapeManager: ShapeManager){
        super(shapeManager);
    }

    createShape(from: Point2D, to: Point2D): Rectangle {
        return new Rectangle(IDFactory.getNewId(), from, to);
    }
}
export class Triangle extends AbstractShape {
    public readonly type = "Triangle"

    constructor(readonly id: number, readonly p1: Point2D, readonly p2: Point2D, readonly p3: Point2D) {
        super();
    }
    draw(ctx: CanvasRenderingContext2D, marked: boolean = true, markColor: string = player_1.color) {
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
export class TriangleFactory implements ShapeFactory{
    public label: string = "Dreieck";

    private from: Point2D;
    private tmpTo: Point2D;
    private tmpLine: Line;
    private thirdPoint: Point2D;
    private tmpShape: Triangle;

    constructor(readonly shapeManager: ShapeManager) {}

    handleMouseDown(x: number, y: number) {
        if (this.tmpShape) {
            this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
            this.shapeManager.addShape( shapeToIShape(
                new Triangle(IDFactory.getNewId(), this.from, this.tmpTo, new Point2D(x,y))));
            this.from = undefined;
            this.tmpTo = undefined;
            this.tmpLine = undefined;
            this.thirdPoint = undefined;
            this.tmpShape = undefined;
        } else {
            this.from = new Point2D(x, y);
        }
    }

    handleMouseUp(x: number, y: number) {
        // remove the temp line, if there was one
        if (this.tmpLine) {
            this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
            this.tmpLine = undefined;
            this.tmpTo = new Point2D(x,y);
            this.thirdPoint = new Point2D(x,y);
            this.tmpShape = new Triangle(IDFactory.getNewId(), this.from, this.tmpTo, this.thirdPoint);
            this.shapeManager.addShape( shapeToIShape(this.tmpShape) );
        }
    }

    handleMouseMove(x: number, y: number) {
        // show temp circle only, if the start point is defined;
        if (!this.from) {
            return;
        }

        if (this.tmpShape) { // second point already defined, update temp triangle
            if (!this.thirdPoint || (this.thirdPoint.x !== x || this.thirdPoint.y !== y)) {
                this.thirdPoint = new Point2D(x,y);
                if (this.tmpShape) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpShape.id, false);
                }
                // adds a new temp triangle
                this.tmpShape = new Triangle(IDFactory.getNewId(), this.from, this.tmpTo, this.thirdPoint);
                this.shapeManager.addShape( shapeToIShape(this.tmpShape) );
            }
        } else { // no second point fixed, update tmp line
            if (!this.tmpTo || (this.tmpTo.x !== x || this.tmpTo.y !== y)) {
                this.tmpTo = new Point2D(x,y);
                if (this.tmpLine) {
                    // remove the old temp line, if there was one
                    this.shapeManager.removeShapeWithId(this.tmpLine.id, false);
                }
                // adds a new temp line
                this.tmpLine = new Line(IDFactory.getNewId(), this.from, this.tmpTo);
                this.shapeManager.addShape( shapeToIShape(this.tmpLine) );
            }
        }
    }
    
}
