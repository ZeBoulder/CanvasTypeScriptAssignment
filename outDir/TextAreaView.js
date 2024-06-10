export class TextAreaView {
    constructor(textViewDomElement) {
        this.textViewDomElement = textViewDomElement;
    }
    applyEvents(events) {
        let textTimeTravelWindow = this.textViewDomElement.value;
        events.forEach(e => {
            textTimeTravelWindow += `{"type": ${e.type}, "event": ${JSON.stringify(e)}}\n`;
        });
        this.textViewDomElement.value = textTimeTravelWindow;
        return this;
    }
}
//# sourceMappingURL=TextAreaView.js.map