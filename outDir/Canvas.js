import { iShapeToShape, ShapeAdded, ShapeEventType, ShapeRemoved, ShapeSetFillColor, ShapeSetOutlineColor, ShapeSelected, ShapeUnselected, ShapesDeleted, ShapesReorderedToFront, ShapesReorderedToBack, ShapeMoved } from "./types.js";
export class Canvas {
    // private eventLogString: string;
    constructor(canvasDomElement, toolarea) {
        this.shapes = {};
        this.shapesOrder = [];
        this.multiSelectedArray = [];
        //TODO: dirty code - fix this once a Service Infrastructure is Created
        this.globalEventDispatcher = window.theBestEventDispatcherEver;
        this.shapes = {};
        this.shapesOrder = [];
        this.multiSelectedArray = [];
        const { width, height } = canvasDomElement.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.altPressed;
        this.ctrlPressed;
        this.ctx = canvasDomElement.getContext("2d");
        const handleKeyDown = (e) => {
            // console.log("Key Down: ", e.keyCode);
            // Handle Alt key press - only triggers once per press
            if (e.keyCode === 18 && !this.altPressed) {
                // 18 is the keycode for the Alt key
                this.altPressed = true;
                console.log("Alt key pressed: " + this.altPressed);
                e.preventDefault();
            }
            // Handle Control key press - only triggers once per press
            if (e.keyCode === 17 && !this.ctrlPressed) {
                // 17 is the keycode for the Ctrl key
                this.ctrlPressed = true;
                console.log("Ctrl key pressed: " + this.ctrlPressed);
            }
        };
        // Got help from suggested code from Chat GPT
        const handleKeyUp = (e) => {
            // console.log("Key up: ", e.keyCode);
            // Handle Alt key up
            if (e.keyCode === 18 && this.altPressed) {
                // 18 is the keycode for the Alt key
                this.altPressed = false;
                console.log("Alt key released: " + this.altPressed);
            }
            // Handle Control key up
            if (e.keyCode === 17 && this.ctrlPressed) {
                // 17 is the keycode for the Ctrl key
                this.ctrlPressed = false;
                console.log("Ctrl key released: " + this.ctrlPressed);
            }
        };
        canvasDomElement.addEventListener("mousemove", createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown", createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup", createMouseHandler("handleMouseUp"));
        document.addEventListener("keydown", handleKeyDown.bind(this));
        document.addEventListener("keyup", handleKeyUp.bind(this));
        //   document.getElementById("myButton").addEventListener("click", () => {
        //     const log = (document.getElementById("textField") as HTMLTextAreaElement).value;
        //     const events = this.parseEventLog(log);
        //     // Clear the variables
        //     this.clearCanvas();
        //     // this.shapes = {};
        //     // this.shapesOrder = [];
        //     // this.multiSelectedArray = [];
        //     // this.eventLogString = "";
        //     this.globalEventDispatcher.applyEvents(events);
        // });
        function createMouseHandler(methodName) {
            return function (e) {
                e = e || window.event;
                if ("object" === typeof e) {
                    const btnCode = e.button, x = e.pageX - this.offsetLeft, y = e.pageY - this.offsetTop, ss = toolarea.getSelectedShape();
                    // if left mouse button is pressed,
                    // and if a tool is selected, do something
                    if (e.button === 0 && ss) {
                        const m = ss[methodName];
                        // This in the shapeFactory should be the factory itself.
                        m.call(ss, x, y);
                    }
                }
            };
        }
    }
    draw() {
        this.ctx.beginPath();
        this.ctx.fillStyle = "lightgrey";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.stroke();
        this.ctx.fillStyle = "black";
        for (let id in this.shapesOrder) {
            this.shapesOrder[id].draw(this.ctx);
        }
        return this;
    }
    clearCanvas() {
        this.shapes = {};
        this.shapesOrder = [];
        this.multiSelectedArray = [];
    }
    applyEvents(events) {
        events.forEach((e) => {
            console.log(e);
            if (e.type === ShapeEventType.ShapeAdded) {
                const eAdd = e;
                const shape = iShapeToShape(eAdd.shape);
                this.addShape(shape, false); // TODO: redraw
                //this.eventLogString += `{"type": "ShapeAdded", "event": ${JSON.stringify(eAdd)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapeRemoved) {
                const eRemoved = e;
                this.removeShapeWithId(eRemoved.id, false); // TODO: redraw
                //this.eventLogString += `{"type": "ShapeRemoved", "event": ${JSON.stringify(eRemoved)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapeSetFillColor) {
                const eFilled = e;
                this.shapes[eFilled.id].fillColor = eFilled.color;
                //this.eventLogString += `{"type": "ShapeSetFillColor", "event": ${JSON.stringify(eFilled)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapeSetOutlineColor) {
                const eOutline = e;
                this.shapes[eOutline.id].outlineColor = eOutline.color;
                //this.eventLogString += `{"type": "ShapeSetOutlineColor", "event": ${JSON.stringify(eOutline)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapeSelected) {
                const eShapeSelected = e;
                this.shapes[eShapeSelected.id].marked = true;
                //this.eventLogString += `{"type": "ShapeSelected", "event": ${JSON.stringify(eShapeSelected)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapeUnselected) {
                const eShapeUnselected = e;
                this.shapes[eShapeUnselected.id].marked = false;
                //this.eventLogString += `{"type": "ShapeUnselected", "event": ${JSON.stringify(eShapeUnselected)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapesReorderedToFront) {
                const eReordered = e;
                this.reorderShapes(eReordered.shapesOrder);
                //this.eventLogString += `{"type": "ShapesReorderedToFront", "event": ${JSON.stringify(eReordered)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapesReorderedToBack) {
                const eReordered = e;
                this.reorderShapes(eReordered.shapesOrder);
                //this.eventLogString += `{"type": "ShapesReorderedToBack", "event": ${JSON.stringify(eReordered)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapesDeleted) {
                const eDeleted = e;
                this.deleteShapesByIds(eDeleted.shapeIds, false);
                //this.eventLogString += `{"type": "ShapesDeleted", "event": ${JSON.stringify(eDeleted)}}\n`;
            }
            else if (e.type === ShapeEventType.ShapeMoved) {
                const eMoved = e;
                const shape = this.shapes[eMoved.id];
                shape.move(eMoved.dx, eMoved.dy);
                //this.eventLogString += `{"type": "ShapeMoved", "event": ${JSON.stringify(eMoved)}}\n`;
            }
        });
        this.draw();
        // (document.getElementById("textField") as HTMLTextAreaElement).value = this.eventLogString;
        return this;
    }
    addShape(shape, redraw = true) {
        this.shapes[shape.id] = shape;
        console.log("Shape ID " + shape.id + " added.");
        this.shapesOrder.push(shape);
        return redraw ? this.draw() : this;
    }
    removeShapeWithId(id, redraw = true) {
        delete this.shapes[id];
        this.shapesOrder = this.shapesOrder.filter((s) => s.id !== id);
        return redraw ? this.draw() : this;
    }
    removeShape(shape, redraw = true) {
        const id = shape.id;
        this.shapesOrder = this.shapesOrder.filter((s) => s.id !== id);
        return this.removeShapeWithId(id);
    }
    //  ---------------------------- Parse Event Log ----------------------------
    // parseEventLog(log: string): ShapeEvent[] {
    //   const events: ShapeEvent[] = [];
    //   const lines = log.trim().split('\n');
    //   lines.forEach(line => {
    //       try {
    //           const parsed = JSON.parse(line);
    //           const eventType = parsed.type;
    //           const eventData = parsed.event;
    //           switch (eventType) {
    //               case 'ShapeAdded':
    //                   events.push(new ShapeAdded(eventData.shape));
    //                   break;
    //               case 'ShapeRemoved':
    //                   events.push(new ShapeRemoved(eventData.id));
    //                   break;
    //               case 'ShapeSetFillColor':
    //                   events.push(new ShapeSetFillColor(eventData.id, eventData.color));
    //                   break;
    //               case 'ShapeSetOutlineColor':
    //                   events.push(new ShapeSetOutlineColor(eventData.id, eventData.color));
    //                   break;
    //               case 'ShapeSelected':
    //                   events.push(new ShapeSelected(eventData.id));
    //                   break;
    //               case 'ShapeUnselected':
    //                   events.push(new ShapeUnselected(eventData.id));
    //                   break;
    //               case 'ShapesReorderedToFront':
    //                   events.push(new ShapesReorderedToFront(eventData.shapesOrder));
    //                   break;
    //               case 'ShapesReorderedToBack':
    //                   events.push(new ShapesReorderedToBack(eventData.shapesOrder));
    //                   break;
    //               case 'ShapesDeleted':
    //                   events.push(new ShapesDeleted(eventData.shapeIds));
    //                   break;
    //               case 'ShapeMoved':
    //                   events.push(new ShapeMoved(eventData.id, eventData.dx, eventData.dy));
    //                   break;
    //               default:
    //                   console.error(`Unknown event type: ${eventType}`);
    //           }
    //       } catch (error) {
    //           console.error(`Failed to parse line: ${line}`);
    //           console.error(error);
    //       }
    //   });
    //   return events;
    // }
    parseEventLog(log) {
        const events = [];
        const lines = log.trim().split('\n');
        lines.forEach(line => {
            try {
                const parsed = JSON.parse(line);
                const eventType = parsed.type;
                const eventData = parsed.event;
                switch (eventType) {
                    case ShapeEventType.ShapeAdded:
                        events.push(new ShapeAdded(eventData.shape));
                        break;
                    case ShapeEventType.ShapeRemoved:
                        events.push(new ShapeRemoved(eventData.id));
                        break;
                    case ShapeEventType.ShapeSetFillColor:
                        events.push(new ShapeSetFillColor(eventData.id, eventData.color));
                        break;
                    case ShapeEventType.ShapeSetOutlineColor:
                        events.push(new ShapeSetOutlineColor(eventData.id, eventData.color));
                        break;
                    case ShapeEventType.ShapeSelected:
                        events.push(new ShapeSelected(eventData.id));
                        break;
                    case ShapeEventType.ShapeUnselected:
                        events.push(new ShapeUnselected(eventData.id));
                        break;
                    case ShapeEventType.ShapesReorderedToFront:
                        events.push(new ShapesReorderedToFront(eventData.shapesOrder));
                        break;
                    case ShapeEventType.ShapesReorderedToBack:
                        events.push(new ShapesReorderedToBack(eventData.shapesOrder));
                        break;
                    case ShapeEventType.ShapesDeleted:
                        events.push(new ShapesDeleted(eventData.shapeIds));
                        break;
                    case ShapeEventType.ShapeMoved:
                        events.push(new ShapeMoved(eventData.id, eventData.dx, eventData.dy));
                        break;
                    default:
                        console.error(`Unknown event type: ${eventType}`);
                }
            }
            catch (error) {
                console.error(`Failed to parse line: ${line}`);
                console.error(error);
            }
        });
        return events;
    }
    // ----------------------------
    deleteSelectedShapes(multiArray, redraw) {
        // Collect IDs of shapes to be deleted
        const shapeIdsToDelete = [];
        // Temporary array to store updated sub-arrays
        let updatedMultiSelectedArray = [];
        console.log(multiArray);
        // Loop through each sub-array in the multiSelectedArray
        multiArray.forEach((subArray, index) => {
            // Filter out shapes that are marked (as they will be removed)
            let updatedSubArray = subArray.filter((shape) => {
                if (shape.marked) {
                    shapeIdsToDelete.push(shape.id);
                    console.log(`Shape ID ${shape.id} marked for removal.`);
                    return false; // Do not include this shape in the new sub-array
                }
                return true; // Include this shape in the new sub-array
            });
            // Store the updated sub-array
            updatedMultiSelectedArray.push(updatedSubArray);
            // After handling a sub-array, log its current state
            console.log(`Sub-array index ${index} after update contains:`, updatedSubArray.map((shape) => shape.id));
        });
        // Update the main multiSelectedArray with the new sub-arrays
        this.multiSelectedArray = updatedMultiSelectedArray;
        // After all operations, log the entire state of multiSelectedArray
        console.log("Current state of multiSelectedArray:");
        this.multiSelectedArray.forEach((subArray, index) => {
            console.log(`Index ${index}:`, subArray.map((shape) => shape.id));
        });
        if (redraw) {
            this.draw();
        }
        // Trigger the ShapesDeleted event
        if (shapeIdsToDelete.length > 0) {
            // this.applyEvents([new ShapesDeleted(shapeIdsToDelete)]);
            this.globalEventDispatcher.applyEvents([new ShapesDeleted(shapeIdsToDelete)]);
        }
    }
    deleteShapesByIds(shapeIds, redraw) {
        let updatedMultiSelectedArray = this.multiSelectedArray.map(subArray => subArray.filter(shape => !shapeIds.includes(shape.id)));
        this.multiSelectedArray = updatedMultiSelectedArray;
        shapeIds.forEach(id => {
            this.removeShapeWithId(id, false);
        });
        if (redraw) {
            this.draw();
        }
        console.log("Current state of multiSelectedArray:");
        this.multiSelectedArray.forEach((subArray, index) => {
            console.log(`Index ${index}:`, subArray.map(shape => shape.id));
        });
    }
    // ----------------------------
    // Helper function to find an array in multiSelectedArray that matches the given array
    findIndexInMultiSelected(newArray) {
        return this.multiSelectedArray.findIndex((selectedArray) => {
            return this.areArraysEqual(selectedArray, newArray);
        });
    }
    // Helper function to check if two arrays of shapes are equal based on their IDs
    areArraysEqual(array1, array2) {
        const ids1 = array1.map((shape) => shape.id).sort();
        const ids2 = array2.map((shape) => shape.id).sort();
        return (ids1.length === ids2.length &&
            ids1.every((value, index) => value === ids2[index]));
    }
    // Helper function to check the index of the next unmarked shape - but with correct direction to allow for proper hitbox when clicking shapes
    checkNextUnmarkedShapeInArray(selectedArray) {
        const lastMarkedIndex = selectedArray.reduce((latest, shape, i) => (shape.marked ? i : latest), -1);
        if (lastMarkedIndex === -1) {
            // No shape is marked, start from the last shape
            return selectedArray.length - 1;
        }
        else {
            // Start checking from the shape before the last marked shape
            for (let i = (lastMarkedIndex - 1 + selectedArray.length) % selectedArray.length; i !== lastMarkedIndex; i = (i - 1 + selectedArray.length) % selectedArray.length) {
                if (!selectedArray[i].marked) {
                    return i;
                }
            }
        }
        return -1; // All shapes are marked
    }
    triggerShapeSelectionEvent(shapeId) {
        this.globalEventDispatcher.applyEvents([new ShapeSelected(shapeId)]);
    }
    shapeSelect(shapeId, shapes) {
        for (let key in shapes) {
            if (shapes.hasOwnProperty(key)) {
                let singleShape = shapes[key];
                if (singleShape.id === shapeId) {
                    // singleShape.marked = true;
                    this.triggerShapeSelectionEvent(singleShape.id);
                    break;
                }
            }
        }
        return this;
    }
    triggerShapeUnselectionEvent(shapeId) {
        this.globalEventDispatcher.applyEvents([new ShapeUnselected(shapeId)]);
    }
    shapeUnselect(shapeId, shapes) {
        for (let key in shapes) {
            if (shapes.hasOwnProperty(key)) {
                let singleShape = shapes[key];
                if (singleShape.id === shapeId) {
                    // singleShape.marked = false;
                    this.triggerShapeUnselectionEvent(singleShape.id);
                    break;
                }
            }
        }
        return this;
    }
    markNextInArray(selectedArray, shapes) {
        if (selectedArray.length === 0) {
            return;
        }
        const i = this.checkNextUnmarkedShapeInArray(selectedArray);
        if (i !== -1) {
            // selectedArray[i].marked = true;
            this.shapeSelect(selectedArray[i].id, shapes);
        }
    }
    selectShapesbyCoordinates(x, y, redraw = true) {
        const selectedArray = [];
        this.shapesOrder.forEach((shape) => {
            if (shape.contains(x, y)) {
                selectedArray.push(shape);
            }
        });
        // Normal Click
        if (!this.ctrlPressed && !this.altPressed) {
            this.shapesOrder.forEach((shape) => {
                if (shape.marked) {
                    this.shapeUnselect(shape.id, this.shapes);
                }
            });
            // Clear previous selections and add the new one
            this.multiSelectedArray = [selectedArray];
            console.log("Selected Array after normal click:", selectedArray.map((shape) => shape.id));
            this.markNextInArray(selectedArray, this.shapes);
        }
        // Control held without Alt
        else if (this.ctrlPressed && !this.altPressed) {
            if (selectedArray.length !== 0) {
                const index = this.findIndexInMultiSelected(selectedArray);
                if (index !== -1) {
                    //identical array found, no push of selectedArray required.  Will edit existing index of the selectedArray
                    console.log("Selected Array after control click and Array Exists:", selectedArray.map((shape) => shape.id));
                    // marks last shape in array by index
                    this.shapeSelect(this.multiSelectedArray[index][selectedArray.length - 1].id, this.shapes);
                }
                else {
                    // No identical array, add the new selection
                    this.multiSelectedArray.push(selectedArray);
                    // marks last shape in array by index
                    console.log("Selected Array after control click:", selectedArray.map((shape) => shape.id));
                    this.shapeSelect(selectedArray[selectedArray.length - 1].id, this.shapes);
                }
            }
        }
        // Just Alt Pressed
        else if (this.altPressed) {
            if (selectedArray.length !== 0) {
                const index = this.findIndexInMultiSelected(selectedArray);
                // selectedArray already exists, and Control is pressed
                if (index !== -1 && this.ctrlPressed) {
                    this.markNextInArray(selectedArray, this.shapes);
                    // selectedArray already exists, and Control is NOT pressed
                }
                else if (index !== -1 && !this.ctrlPressed) {
                    let indexToMark = this.checkNextUnmarkedShapeInArray(selectedArray);
                    this.shapesOrder.forEach((shape) => {
                        if (shape.marked) {
                            this.shapeUnselect(shape.id, this.shapes);
                        }
                    });
                    this.multiSelectedArray = [selectedArray];
                    console.log("Multi Selected Array after alt click:", selectedArray);
                    if (indexToMark !== -1) {
                        this.shapeSelect(selectedArray[indexToMark].id, this.shapes);
                    }
                    else {
                        this.shapeSelect(selectedArray[0].id, this.shapes);
                    }
                }
                // selectedArray DOESNT already exists, and Control is pressed
                else if (index === -1 && this.ctrlPressed) {
                    this.multiSelectedArray.push(selectedArray);
                    console.log("Multi Selected Array after control and alt click:", selectedArray);
                    this.markNextInArray(selectedArray, this.shapes);
                }
                // selectedArray DOESNT already exists, and Control is NOT pressed
                else if (index === -1 && !this.ctrlPressed) {
                    this.shapesOrder.forEach((shape) => {
                        if (shape.marked) {
                            this.shapeUnselect(shape.id, this.shapes);
                        }
                    });
                    this.multiSelectedArray = [selectedArray];
                    console.log("Multi Selected Array after alt click:", selectedArray);
                    this.markNextInArray(selectedArray, this.shapes);
                }
            }
        }
        return redraw ? this.draw() : this;
    }
    moveSelectedShapes(dx, dy) {
        let boundaryHit = false;
        // Iterate through each sub-array in multiSelectedArray
        for (const shape of this.shapesOrder) {
            if (!shape.marked)
                continue;
            boundaryHit = shape.hitsBoundary(dx, dy, this.width, this.height);
            if (boundaryHit)
                break;
        }
        if (!boundaryHit) {
            this.shapesOrder.forEach((shape) => {
                if (!shape.marked)
                    return;
                this.triggerMoveShape(shape.id, dx, dy);
            });
            // Redraw
            console.log("Redrawing canvas");
            this.ctx.clearRect(0, 0, this.width, this.height);
            this.draw();
        }
        else {
            console.log("Boundary hit, not moving shapes");
        }
    }
    triggerMoveShape(shapeId, dx, dy) {
        this.globalEventDispatcher.applyEvents([new ShapeMoved(shapeId, dx, dy)]);
        // const shape = this.shapes[shapeId];
        //     shape.move(dx, dy);
    }
    reorderShapes(newOrder) {
        this.shapesOrder = newOrder.map(id => this.getShapeById(id)).filter(shape => shape !== undefined);
    }
    getShapesOrder() {
        return this.shapesOrder.map(shape => shape.id);
    }
    getShapeById(id) {
        return this.shapes[id];
    }
}
//# sourceMappingURL=Canvas.js.map