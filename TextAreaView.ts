import {
    ShapeEvent,
    ShapeView
  } from "./types.js";

export class TextAreaView implements ShapeView {
    constructor(private readonly textViewDomElement: HTMLTextAreaElement){

    }
    
    applyEvents(events: ShapeEvent[]): this {
        // let textTimeTravelWindow = this.textViewDomElement.value;
        // events.forEach(e => {
        //     textTimeTravelWindow += `{"type": ${e.type}, "event": ${JSON.stringify(e)}}\n`;
        // })
        const eventsTextArea = this.textViewDomElement.value.trim() ? JSON.parse(this.textViewDomElement.value) : [];
        eventsTextArea.push(...events)
        this.textViewDomElement.value = JSON.stringify(eventsTextArea)
        // textTimeTravelWindow
        return this;
    }

    clearLog(){
        this.textViewDomElement.value = "";
    }

    
}
