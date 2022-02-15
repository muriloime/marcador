import { Controller } from "@hotwired/stimulus"
import ContentHighlightWorker from "../content_highlight_worker";

export default class extends Controller {
  static targets = ["highlightable"];

  connect() {
    // "marcador_post_124".split(/\_(?=[^\_]+$)/)

    const worker = new ContentHighlightWorker(this.highlightableTarget, {
      // nodeIdentifierKey: this.data.get("key"),
      highlightableType: "Post",
      highlightableId: this.data.get("id"),
    //   highlightableColumn: "body", // required if your model has more than 1 highlightable column
      readOnly: false,
    });
    worker.init();
  }

  highlight(event) {
  }
}