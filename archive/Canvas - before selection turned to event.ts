import {
    IShape,
    iShapeToShape,
    Shape,
    ShapeAdded,
    ShapeEvent,
    ShapeEventType,
    ShapeRemoved,
    ShapeSetFillColor,
    ShapeSetOutlineColor,
    ShapeView
} from "./types.js";
import {ToolArea} from "./ToolArea.js";
import {Line, Rectangle, Circle, Triangle} from "./Shapes.js";

export class Canvas implements ShapeView {
    private ctx: CanvasRenderingContext2D;
    private shapes: { [p: number]: Shape } = {};
    private shapesOrder: Shape[] = [];
    private multiSelectedArray: Shape[][] = [];
    private width: number;
    private height: number;
    private altPressed: boolean;
    private ctrlPressed: boolean;
    private eventLogString: string;
  
    constructor(canvasDomElement: HTMLCanvasElement, toolarea: ToolArea) {
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

        canvasDomElement.addEventListener("mousemove",
            createMouseHandler("handleMouseMove"));
        canvasDomElement.addEventListener("mousedown",
            createMouseHandler("handleMouseDown"));
        canvasDomElement.addEventListener("mouseup",
            createMouseHandler("handleMouseUp"));

        document.addEventListener("keydown", handleKeyDown.bind(this));
        document.addEventListener("keyup", handleKeyUp.bind(this));

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
        for (let id in this.shapesOrder) {
        // for (let id in this.shapes) {
            // this.shapes[id].draw(this.ctx);
            this.shapesOrder[id].draw(this.ctx);
            
        }
        return this;
    }

    // applyEvents(events: ShapeEvent[]): this {
    //     // TODO: adjust second parameter so that redraw is set once for the last element
    //     events.forEach(e => {
    //         console.log(e);
    //         if (e.type === ShapeEventType.ShapeAdded) {
    //             const eAdd = e as ShapeAdded;
    //             const shape = iShapeToShape(eAdd.shape);
    //             this.addShape(shape); // TODO: redraw
    //         } else if (e.type === ShapeEventType.ShapeRemoved) {
    //             const eRemoved = e as ShapeRemoved;
    //             this.removeShapeWithId(eRemoved.id); // TODO: redraw
    //         }
    //     });
    //     return this;
    // }

    applyEvents(events: ShapeEvent[]): this {
      // TODO: adjust second parameter so that redraw is set once for the last element
      events.forEach(e => {
          console.log(e);
          if (e.type === ShapeEventType.ShapeAdded) {
              const eAdd = e as ShapeAdded;
              const shape = iShapeToShape(eAdd.shape);
              this.addShape(shape, false); // TODO: redraw
              // this.eventLogString = this.eventLogString + `Shape Added: ${JSON.stringify(shape)}\n`
              this.eventLogString = this.eventLogString + "Shape Added: " + JSON.stringify(e) + "\n";
              // console.log(this.eventLogString)
              console.log("NEW LINE! (Add)")
            
          } else if (e.type === ShapeEventType.ShapeRemoved) {
              const eRemoved = e as ShapeRemoved;
              this.removeShapeWithId(eRemoved.id, false); // TODO: redraw
              // this.eventLogString = this.eventLogString + `Shape Removed: ${eRemoved.id}\n`
              this.eventLogString = this.eventLogString + "Shape Removed:" + JSON.stringify(e) + "\n"
              console.log("NEW LINE! (Remove)")
          } else if (e.type === ShapeEventType.ShapeSetFillColor){
            const eFilled = e as ShapeSetFillColor;
            this.shapes[eFilled.id].fillColor = eFilled.color
            this.eventLogString = this.eventLogString + "Shape Color Fill Changed:" + JSON.stringify(e) + "\n"
          } else if (e.type === ShapeEventType.ShapeSetOutlineColor){
            const eOutline = e as ShapeSetOutlineColor;
            this.shapes[eOutline.id].outlineColor = eOutline.color
            this.eventLogString = this.eventLogString + "Shape Outer Color Changed:" + JSON.stringify(e) + "\n"

          }
      });
      this.draw();
      (document.getElementById('textField') as HTMLTextAreaElement).value = this.eventLogString;

      return this;
  }

    private addShape(shape: Shape, redraw: boolean = true): this {
        this.shapes[shape.id] = shape;
        console.log("Shape ID " + shape.id + " added.");
        this.shapesOrder.push(shape);
        return redraw ? this.draw() : this;
    }

    private removeShapeWithId(id: number, redraw: boolean = true): this {
        delete  this.shapes[id];
        this.shapesOrder = this.shapesOrder.filter((s) => s.id !== id);
        return redraw ? this.draw() : this;
    }

    private removeShape(shape: Shape, redraw: boolean = true): this {
        const id = shape.id;
        this.shapesOrder = this.shapesOrder.filter((s) => s.id !== id);
        return this.removeShapeWithId(id);
    }

    deleteSelectedShapes(multiArray, redraw) {
        // Temporary array to store updated sub-arrays
        let updatedMultiSelectedArray = [];
        console.log(multiArray);
        // Loop through each sub-array in the multiSelectedArray
        multiArray.forEach((subArray, index) => {
          // Filter out shapes that are marked (as they will be removed)
          let updatedSubArray = subArray.filter((shape) => {
            if (shape.marked) {
              this.removeShapeWithId(shape.id, false); // Use 'false' to avoid redrawing each time
              console.log(`Shape ID ${shape.id} removed.`);
              return false; // Do not include this shape in the new sub-array
            }
            return true; // Include this shape in the new sub-array
          });
    
          // Store the updated sub-array
          updatedMultiSelectedArray.push(updatedSubArray);
    
          // After handling a sub-array, log its current state
          console.log(
            `Sub-array index ${index} after update contains:`,
            updatedSubArray.map((shape) => shape.id)
          );
        });
    
        // Update the main multiSelectedArray with the new sub-arrays
        this.multiSelectedArray = updatedMultiSelectedArray;
    
        // After all operations, log the entire state of multiSelectedArray
        console.log("Current state of multiSelectedArray:");
        this.multiSelectedArray.forEach((subArray, index) => {
          console.log(
            `Index ${index}:`,
            subArray.map((shape) => shape.id)
          );
        });
    
        if (redraw) {
          this.draw();
        }
      }

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
    return (
      ids1.length === ids2.length &&
      ids1.every((value, index) => value === ids2[index])
    );
  }

  // Helper function to check the index of the next unmarked shape - but with correct direction to allow for proper hitbox when clicking shapes
  checkNextUnmarkedShapeInArray(selectedArray) {
    const lastMarkedIndex = selectedArray.reduce(
      (latest, shape, i) => (shape.marked ? i : latest),
      -1
    );
    if (lastMarkedIndex === -1) {
      // No shape is marked, start from the last shape
      return selectedArray.length - 1;
    } else {
      // Start checking from the shape before the last marked shape
      for (
        let i =
          (lastMarkedIndex - 1 + selectedArray.length) % selectedArray.length;
        i !== lastMarkedIndex;
        i = (i - 1 + selectedArray.length) % selectedArray.length
      ) {
        if (!selectedArray[i].marked) {
          return i;
        }
      }
    }
    return -1; // All shapes are marked
  }

  markNextInArray(selectedArray) {
    if (selectedArray.length === 0) {
      return;
    }
    const i = this.checkNextUnmarkedShapeInArray(selectedArray);
    if (i !== -1) {
      selectedArray[i].marked = true;
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
      this.shapesOrder.forEach((shape) => (shape.marked = false));
      // Clear previous selections and add the new one
      this.multiSelectedArray = [selectedArray];
      console.log(
        "Selected Array after normal click:",
        selectedArray.map((shape) => shape.id)
      );
      this.markNextInArray(selectedArray);
    }
    // Control held without Alt
    else if (this.ctrlPressed && !this.altPressed) {
      if (selectedArray.length !== 0) {
        const index = this.findIndexInMultiSelected(selectedArray);
        if (index !== -1) {
          //identical array found, no push of selectedArray required.  Will edit existing index of the selectedArray
          console.log(
            "Selected Array after control click and Array Exists:",
            selectedArray.map((shape) => shape.id)
          );
          // marks last shape in array by index
          this.multiSelectedArray[index][
            selectedArray.length - 1
          ].marked = true;
        } else {
          // No identical array, add the new selection
          this.multiSelectedArray.push(selectedArray);
          // marks last shape in array by index
          console.log(
            "Selected Array after control click:",
            selectedArray.map((shape) => shape.id)
          );
          selectedArray[selectedArray.length - 1].marked = true;
        }
      }
    }

    // Just Alt Pressed
    else if (this.altPressed) {
      if (selectedArray.length !== 0) {
        const index = this.findIndexInMultiSelected(selectedArray);
        // selectedArray already exists, and Control is pressed
        if (index !== -1 && this.ctrlPressed) {
          this.markNextInArray(selectedArray);
          // selectedArray already exists, and Control is NOT pressed
        } else if (index !== -1 && !this.ctrlPressed) {
          let indexToMark = this.checkNextUnmarkedShapeInArray(selectedArray);
          this.shapesOrder.forEach((shape) => (shape.marked = false));
          this.multiSelectedArray = [selectedArray];
          console.log("Multi Selected Array after alt click:", selectedArray);
          if (indexToMark !== -1) {
            selectedArray[indexToMark].marked = true;
          } else {
            selectedArray[0].marked = true;
          }
        }
        // selectedArray DOESNT already exists, and Control is pressed
        else if (index === -1 && this.ctrlPressed) {
          this.multiSelectedArray.push(selectedArray);
          console.log(
            "Multi Selected Array after control and alt click:",
            selectedArray
          );
          this.markNextInArray(selectedArray);
        }
        // selectedArray DOESNT already exists, and Control is NOT pressed
        else if (index === -1 && !this.ctrlPressed) {
          this.shapesOrder.forEach((shape) => (shape.marked = false));
          this.multiSelectedArray = [selectedArray];
          console.log("Multi Selected Array after alt click:", selectedArray);
          this.markNextInArray(selectedArray);
        }
      }
    }
    return redraw ? this.draw() : this;
  }
  moveSelectedShapes(dx, dy) {
    let boundaryHit = false;

    // Iterate through each sub-array in multiSelectedArray
    for (const shape of this.shapesOrder) {
      if (!shape.marked) continue;
      boundaryHit = shape.hitsBoundary(dx, dy, this.width, this.height);
      
      if (boundaryHit) break; 
    }
    
    if (!boundaryHit) {
      this.shapesOrder.forEach((shape) => {
        if (!shape.marked) return;
        shape.move(dx, dy);
      });

      // Redraw
      console.log("Redrawing canvas");

      this.ctx.clearRect(0, 0, this.width, this.height);
      this.draw();
    } else {
      console.log("Boundary hit, not moving shapes");
    }
  }
}


