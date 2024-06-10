import {Circle, Line, Rectangle, Triangle} from "./Shapes.js";

export type ShapeType = "Line" | "Rectangle" | "Circle" | "Triangle" | "Selection"; // selection is not actually a shape, but it was put here to satisfy the type checker when ShapeType is used for the Selection as an Abstract Shape


export class Point2D {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
export interface Shape {
    readonly id: number;
    readonly type: ShapeType;
    marked: boolean;
    fillColor: string;
    outlineColor: string;
    draw(ctx: CanvasRenderingContext2D);
    contains(x: number, y: number): boolean;
    move(dx: number, dy: number): void;
    hitsBoundary(dx: number, dy: number, width: number, height: number): boolean;
}
export type IShape = ILine | ICircle | IRectangle | ITriangle;
export interface ILine {
    readonly id: number;
    readonly type: "Line";
    readonly from: Point2D;
    readonly to: Point2D;
}
export interface IRectangle {
    readonly id: number;
    readonly type: "Rectangle";
    readonly from: Point2D;
    readonly to: Point2D;
}
export interface ICircle {
    readonly id: number;
    readonly type: "Circle";
    readonly center: Point2D;
    readonly radius: number;
}
export interface ITriangle {
    readonly id: number;
    readonly type: "Triangle";
    readonly p1: Point2D;
    readonly p2: Point2D;
    readonly p3: Point2D;
}
export enum ShapeEventType {
    "ShapeAdded" = "ShapeAdded",
    "ShapeRemoved" = "ShapeRemoved",
    "ShapeSelected" = "ShapeSelected",
    "ShapeUnselected" = "ShapeUnselected",
    "ShapeSetFillColor" = "ShapeSetFillColor",
    "ShapeSetOutlineColor" = "ShapeSetOutlineColor", 
    "ShapesReorderedToFront" = "ShapesReorderedToFront",
    "ShapesReorderedToBack" = "ShapesReorderedToBack", 
    "ShapesDeleted" = "ShapesDeleted",
    "ShapeMoved" = "ShapeMoved"
}
export interface ShapeEvent {
    readonly type: ShapeEventType;
}
export class ShapeAdded implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapeAdded

    constructor(readonly shape: IShape) {}
}
export class ShapeRemoved implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapeRemoved
    constructor(readonly id: number) {}
}

export class ShapeSelected implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapeSelected
    constructor(readonly id: number) {}
}

export class ShapeUnselected implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapeUnselected
    constructor(readonly id: number) {}
}

export class ShapeSetFillColor implements ShapeEvent{
    readonly type: ShapeEventType = ShapeEventType.ShapeSetFillColor
    constructor(readonly id: number, readonly color: string){}
}

export class ShapeSetOutlineColor implements ShapeEvent{
    readonly type: ShapeEventType = ShapeEventType.ShapeSetOutlineColor
    constructor(readonly id: number, readonly color: string){}
}


export class ShapesReorderedToFront implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapesReorderedToFront;
    constructor(public readonly shapesOrder: number[]) {}
}

export class ShapesReorderedToBack implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapesReorderedToBack;
    constructor(public readonly shapesOrder: number[]) {}
}

export class ShapesDeleted implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapesDeleted;
    constructor(public readonly shapeIds: number[]) {}
}

export class ShapeMoved implements ShapeEvent {
    readonly type: ShapeEventType = ShapeEventType.ShapeMoved;
    constructor(public readonly id: number, public readonly dx: number, public readonly dy: number) {}
}

export interface ShapeView {
    applyEvents(events: ShapeEvent[]): this;
}

export class EventDispatcher implements ShapeView{
    private readonly views: ShapeView[] = [];

    public addView(view: ShapeView){
        this.views.push(view);
    }

    applyEvents(events: ShapeEvent[]): this {
        //TODO 
        this.views.forEach(v => {
            v.applyEvents(events)
        })
        return this;
    }
}

export interface ShapeManager {
    addShape(shape: IShape, redraw?: boolean): this;
    removeShape(shape: IShape, redraw?: boolean): this;
    removeShapeWithId(id: number, redraw?: boolean): this;
    selectShapesbyCoordinates(x: number, y: number, redraw?: boolean): this;
    moveSelectedShapes(dx: number, dy: number): this;
}

export interface ShapeFactory {
    label: string;
    handleMouseDown(x: number, y: number);
    handleMouseUp(x: number, y: number);
    handleMouseMove(x: number, y: number);
}

export function iShapeToShape(iShape: IShape): Shape {
    let shape: Shape;
    if (iShape.type === "Line") {
        shape = new Line(iShape.id, iShape.from, iShape.to)
    } else if (iShape.type === "Rectangle") {
        shape = new Rectangle(iShape.id, iShape.from, iShape.to);
    } else if (iShape.type === "Circle") {
        shape = new Circle(iShape.id, iShape.center, iShape.radius);
    } else if (iShape.type === "Triangle") {
        shape = new Triangle(iShape.id, iShape.p1, iShape.p2, iShape.p3);
    }
    return shape;
}

export function shapeToIShape(shape: Shape): IShape {
    if (shape.type === "Line") {
        return shape as Line;
    } else if (shape.type === "Rectangle") {
        return shape as Rectangle;
    } else if (shape.type === "Circle") {
        return shape as Circle;
    } else if (shape.type === "Triangle") {
        return shape as Triangle;
    }
}

export class IDFactory {
    private static prefix: string = "test"
    private static currentId: number = 0;

    public static getNewId(): number {
        IDFactory.currentId++;
        return /* this.prefix + */ IDFactory.currentId;
    }
}
