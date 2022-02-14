// Visit The Stimulus Handbook for more details
// https://stimulusjs.org/handbook/introduction
//
// This example controller works with specially annotated HTML like:
//
// <div data-controller="hello">
//   <h1 data-target="hello.output"></h1>
// </div>

import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "input" ]

  connect() {
    console.log('select controller connected');
    // this.outputTarget.textContent = 'Hello, Stimulus!'

    console.log('input')
    const input = document.querySelector('#input');
    input.addEventListener('select', this.logSelection);

    document.onselectend = () => {
      console.log('Selection changed.');
    };
    // const input = document.querySelector('input');
    // this.inputTarget.addEventListener('select', this.logSelection);
  }

  logSelection(event) {
    const log = document.getElementById('log');
    const selection = event.target.value.substring(event.target.selectionStart, event.target.selectionEnd);
    log.textContent = `You selected: ${selection}`;
  }

  save() { 
    console.log('save');
  }
}


