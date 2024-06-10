import {
    ShapeEvent,
    ShapeView
  } from "./types.js";

export class TextAreaView implements ShapeView {
    constructor(private readonly textViewDomElement: HTMLTextAreaElement){

    }
    
    applyEvents(events: ShapeEvent[]): this {
        let textTimeTravelWindow = this.textViewDomElement.value;
        events.forEach(e => {
            textTimeTravelWindow += `{"type": ${e.type}, "event": ${JSON.stringify(e)}}\n`;
        })
        this.textViewDomElement.value = textTimeTravelWindow
        return this;
    }

    
}
