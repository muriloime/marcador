import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "source" ]

  copy() {
    window.getSelection().removeAllRanges()

    let range = document.createRange();
    range.selectNode(this.sourceTarget)
    window.getSelection().addRange(range)

    document.execCommand("copy")
    window.getSelection().collapseToEnd()

    this.element.querySelector("button").textContent = "Copied!"
  }
}