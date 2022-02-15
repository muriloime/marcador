import rangy from "rangy";
import "rangy-classapplier";
import { FetchRequest } from '@rails/request.js'


import { addMultipleEventListener, removeMultipleEventListener } from "./utils";

class ContentHighlightWorker {
  constructor(element, options) {
    this.element = element;
    this.settings = this.getSettings(options);
  }

  sendToServerParams() {
    const queryParams = new URLSearchParams();
    queryParams.set("highlightable_type", this.settings.highlightableType);
    queryParams.set("highlightable_id", this.settings.highlightableId);
    queryParams.set("column", this.settings.highlightableColumn);
    return queryParams.toString();
  }

  getSettings(options) {
    const defaultOptions = {
      highlightableType: "",
      highlightableId: "",
      highlightableColumn: "content",
      readOnly: false,
      nodeIdentifierKey: "chnode",
      highlightClass: "marcador",
      highlightIdentifyClassRoot: "marcador-identifier-",
      highlightLifetimeClassRoot: "marcador-",
      highlightActiveClass: "marcador-active",
      indexServerPath: "/marcador/highlights?",
      addToServerPath: "/marcador/highlights?",
      removeFromServerPath: "/marcador/highlights",
      popTipClass: "marcador-poptip",
      popTipDefaultHead: "Highlight",
    };
    return { ...defaultOptions, ...options };
  }

  init() {
    rangy.init();

    this.getContentHighlightsFromServer();
    if (!this.settings.readOnly) {
      addMultipleEventListener(this.element, "mouseup touchend", (event) =>
        this.initializeHighlighter(event)
      );
    }
  }

  getCommonAncestor(selection){
    const range = selection.getRangeAt(0);

    var commonAncestor = range.commonAncestorContainer;
    while (
      commonAncestor.dataset == undefined ||
      commonAncestor.dataset[this.settings.nodeIdentifierKey] == undefined
    ) {
      commonAncestor = commonAncestor.parentNode;
      if (
        commonAncestor == undefined || commonAncestor.contains(this.element)
      ) {
        break;
      }
    }
    return commonAncestor;
  }

  initializeHighlighter(event) {
    const selection = rangy.getSelection();
    if (!selection.isCollapsed && selection.rangeCount > 0) {
      const commonAncestor = this.getCommonAncestor(selection);

      const bookmarkObject = selection.getBookmark(commonAncestor);
      if (bookmarkObject && bookmarkObject.rangeBookmarks.length > 0) {
        const highlightParams = {
          container_node_type: commonAncestor.tagName,
          container_node_identifier_key: this.settings.nodeIdentifierKey,
          container_node_identifier: commonAncestor.dataset[this.settings.nodeIdentifierKey],
          startnode_offset: bookmarkObject.rangeBookmarks[0].start,
          endnode_offset: bookmarkObject.rangeBookmarks[0].end,
          selection_backward: bookmarkObject.backward,
          content: selection.toString(),
        };
        this.saveContentHighlightsToServer(
          highlightParams,
          this.settings.addToServerPath,
          "POST"
        );
      } else {
        return;
      }
      selection.detach();
    }
  }

  getContentHighlightsFromServer() {
    this.saveContentHighlightsToServer(
      {},
      this.settings.indexServerPath,
      "GET"
    );
  }

  saveContentHighlightsToServer(highlightParams, serverPath, requestType) {
    this.ajaxLoader(
      requestType,
      serverPath + this.sendToServerParams(),
      highlightParams,
      (allHighlights) => {
        this.modifyContentHighlights(allHighlights, "add");
      }
    );
  }

  getHighlightId(highlightElement) {
    const classNameArray = highlightElement.classList;
    const classRoot = this.settings.highlightIdentifyClassRoot;
    for (let className of classNameArray) {
      if (className.includes(classRoot)) {
        return className.substring(classRoot.length, className.length);
      }
    }
  }

  removeContentHighlightsFromServer(highlightElement) {
    if (highlightElement.className != undefined) {
      this.ajaxLoader(
        "DELETE",
        this.settings.removeFromServerPath + `/${this.getHighlightId(highlightElement)}?`+ this.sendToServerParams(),
        {},
        (removableHighlights) => {
          this.modifyContentHighlights(removableHighlights, "destroy");
        }
      );
    }
    this.settings.activeHighlightId = null;
  }

  setEventListenersToHighlights(highlights) {
    for (let highlight of highlights) {
      addMultipleEventListener(highlight, "click touch", (event) =>
        this.clickHighlightListener(highlight, event)
      );
    }
  }

  removeEventListenersFromHighlights(highlights) {
    for (let highlight of highlights) {
      removeMultipleEventListener(highlight, "click touch", (event) =>
        this.clickHighlightListener(highlight, event)
      );
    }
  }

  clickHighlightListener(highlight, event) {
    this.showPopTipFor(highlight, event);
    event.stopPropagation();
  }

  modifyContentHighlights(contentHighlights, modifyAction) {
    const selection = rangy.getSelection();
    contentHighlights.forEach((highlightableObject) => {
      const x = `${highlightableObject.common_ancestor_node_type}[data-${this.settings.nodeIdentifierKey}="${highlightableObject.container_node_identifier}"]`
      const containerNode = this.element.querySelector(x);
      if (containerNode != undefined) {
        const bookmarkObject = {
          backward: highlightableObject.backward,
          rangeBookmarks: [
            {
              start: highlightableObject.start_offset,
              end: highlightableObject.end_offset,
              containerNode: containerNode,
            },
          ],
        };
        const classApplier = rangy.createClassApplier(
          this.settings.highlightIdentifyClassRoot + highlightableObject.identifier,
          { elementProperties: { className: this.settings.highlightClass } }
        );
        selection.moveToBookmark(bookmarkObject);
        if (selection.toString() == highlightableObject.content) {
          const elementSet = this.element.getElementsByClassName(
            this.settings.highlightIdentifyClassRoot + highlightableObject.identifier
          );
          switch (modifyAction) {
            case "add":
              classApplier.applyToSelection();
              this.addDataAttributesToElements(elementSet, [
                ["description", highlightableObject.description],
                ["removable", highlightableObject.can_cancel],
              ]);
              if (highlightableObject.life_time_class_ends != undefined) {
                this.addLifetimeClassesToElements(
                  elementSet,
                  highlightableObject.life_time_class_ends
                );
              }
              if (!this.settings.readOnly) {
                this.setEventListenersToHighlights(elementSet);
              }
              break;
            case "destroy":
              this.removeDataAttributesFromElements(elementSet, [
                ["description", highlightableObject.description],
                ["removable", highlightableObject.can_cancel],
              ]);
              this.removeLifetimeClassesFromElements(elementSet);
              this.removeEventListenersFromHighlights(elementSet);
              this.unmarkActiveHighlights();
              classApplier.undoToSelection();

              if (
                document.querySelectorAll(
                  ".content-highlight:not(.marcador-me)"
                ).length
              ) {
                this.getContentHighlightsFromServer();
              }

              break;
            default:
              break;
          }
        }
      }
    });
    selection.removeAllRanges();
    selection.detach();
  }

  addLifetimeClassesToElements(anyElements, lifetimeClassEnds) {
    const newClasses = lifetimeClassEnds.map(
      (lifetimeClassEnd) =>
        this.settings.highlightLifetimeClassRoot + lifetimeClassEnd
    );

    for (let element of anyElements) {
      element.classList.add(newClasses);
    }
  }

  removeLifetimeClassesFromElements(anyElements) {
    for (let element of anyElements) {
      element.classList.forEach((klass) => {
        if (klass.includes(this.settings.highlightLifetimeClassRoot)) {
          element.classList.remove(klass);
        }
      });
    }
  }

  addDataAttributesToElements(anyElements, dataAttributesArray) {
    for (let element of anyElements) {
      dataAttributesArray.forEach((dataAttribute) => {
        element.dataset[dataAttribute[0]] = dataAttribute[1];
      });
    }
  }

  removeDataAttributesFromElements(anyElements, dataAttributesArray) {
    for (let element of anyElements) {
      dataAttributesArray.forEach((dataAttribute) => {
        delete element.dataset[dataAttribute[0]];
      });
    }
  }

  markHighlightAsActive(element) {
    element.classList.add(this.settings.highlightActiveClass);
  }

  unmarkActiveHighlights() {
    const activeHighlights = this.element.getElementsByClassName(
      this.settings.highlightActiveClass
    );
    for (let activeHighlight of activeHighlights) {
      activeHighlight.classList.remove(this.settings.highlightActiveClass);
    }
  }

  showPopTipFor(element, clickEvent) {
    this.removePopTip();

    if (element.classList.contains("marcador-others")) {
      return;
    }

    this.popTip = this.buildPopupFromHighlightElement(element);
    this.element.appendChild(this.popTip);
    this.markHighlightAsActive(element);
    window.addEventListener("resize", (e) => this.removePopTip(e));
    addMultipleEventListener(document, "click touch", (e) =>
      this.removePopTip(e)
    );

    const highlightId = this.getHighlightId(element);
    document
      .querySelector(".marcador-identifier-" + highlightId)
      .classList.add(this.settings.highlightActiveClass);
  }

  removePopTip(e) {
    if (this.popTip != undefined) {
      this.element.removeChild(this.popTip);
      this.popTip = undefined;
      this.unmarkActiveHighlights();
      window.removeEventListener("resize", (e) => this.removePopTip(e));
      removeMultipleEventListener(document, "click touch", (e) =>
        this.removePopTip(e)
      );
    }
  }

  buildPopupFromHighlightElement(element) {
    const popTip = document.createElement("div");
    popTip.className = this.settings.popTipClass;
    popTip.innerHTML =
      "<span class='description'>" +
      (element.dataset.description || this.settings.popTipDefaultHead) +
      "</span>";
    if (element.dataset.removable == "true") {
      popTip.innerHTML +=
        "<a href='javascript:void(0);' class='cancel_highlight'>click to remove</a>";
      if (popTip.getElementsByClassName("cancel_highlight")[0] != undefined) {
        const elem = popTip.getElementsByClassName("cancel_highlight")[0];

        addMultipleEventListener(elem, "click touch", (event) => {
          this.removePopTip(event);
          this.removeContentHighlightsFromServer(element);
        });
      }
    }
    popTip.style.top = element.offsetTop + element.offsetHeight + 15 + "px";
    popTip.style.left = element.offsetLeft + element.offsetWidth / 2 + "px";
    return popTip;
  }

  ajaxLoader(requestType, url, params, callbackFunc) {
    const body = (requestType == 'GET') ? {} : {body: params}
    const request = new FetchRequest(requestType, url , body ); // JSON.stringify({ name: 'Request.JS' }) })

    request.perform().then( (response) => {
      if (response.statusCode == 200) {
        response.json.then((data) => {
          callbackFunc(data.highlights);
        });
      }
    });
  }
}

export default ContentHighlightWorker;