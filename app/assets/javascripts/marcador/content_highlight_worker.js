import rangy from "rangy";
// import "rangy/lib/rangy-classapplier";

import { addMultipleEventListener, removeMultipleEventListener } from "./utils";

class ContentHighlightWorker {
  constructor(element, options) {
    this.element = element;
    this.settings = this.getSettings(options);
  }

  sendToServerParams() {
    var queryParams = new URLSearchParams();
    queryParams.set("highlightable_type", this.settings.highlightableType);
    queryParams.set("highlightable_id", this.settings.highlightableId);
    queryParams.set("highlightable_column", this.settings.highlightableColumn);
    return queryParams.toString();
  }

  getSettings(options) {
    const defaultOptions = {
      highlightableType: "",
      highlightableId: "",
      highlightableColumn: "",
      readOnly: false,
      nodeIdentifierKey: "chnode",
      highlightClass: "content-highlight",
      highlightIdentifyClassRoot: "content-highlight-identifier-",
      highlightLifetimeClassRoot: "content-highlight-lifetime-",
      highlightActiveClass: "content-highlight-active",
      indexServerPath: "/marcador/highlights?",
      addToServerPath: "/marcador/highlights/create?",
      removeFromServerPath: "/marcador/highlights/destroy?",
      popTipClass: "content-highlight-poptip",
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

  initializeHighlighter(event) {
    const selection = rangy.getSelection();
    if (selection.isCollapsed == false && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      var commonAncestor = range.commonAncestorContainer;
      while (
        commonAncestor.dataset == undefined ||
        commonAncestor.dataset[this.settings.nodeIdentifierKey] == undefined
      ) {
        commonAncestor = commonAncestor.parentNode;
        if (
          commonAncestor == undefined ||
          commonAncestor.contains(this.element)
        ) {
          return;
        }
      }
      const bookmarkObject = selection.getBookmark(commonAncestor);
      if (bookmarkObject && bookmarkObject.rangeBookmarks.length > 0) {
        const highlightParams = {
          common_ancestor_node_type: commonAncestor.tagName,
          common_ancestor_identifier_key: this.settings.nodeIdentifierKey,
          common_ancestor_identifier:
            commonAncestor.dataset[this.settings.nodeIdentifierKey],
          start_offset: bookmarkObject.rangeBookmarks[0].start,
          end_offset: bookmarkObject.rangeBookmarks[0].end,
          backward: bookmarkObject.backward,
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
      const removeHighlightParams = {
        content_highlight_id: this.getHighlightId(highlightElement),
      };
      this.ajaxLoader(
        "POST",
        this.settings.removeFromServerPath + this.sendToServerParams(),
        removeHighlightParams,
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
    var selection = rangy.getSelection();
    contentHighlights.forEach((highlightableObject) => {
      const containerNode = this.element.querySelector(
        `${highlightableObject.common_ancestor_node_type}[data-${this.settings.nodeIdentifierKey}="${highlightableObject.common_ancestor_identifier}"]`
      );
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
          this.settings.highlightIdentifyClassRoot +
            highlightableObject.identifier,
          { elementProperties: { className: this.settings.highlightClass } }
        );
        selection.moveToBookmark(bookmarkObject);
        if (selection.toString() == highlightableObject.content) {
          const elementSet = this.element.getElementsByClassName(
            this.settings.highlightIdentifyClassRoot +
              highlightableObject.identifier
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
                  ".content-highlight:not(.content-highlight-lifetime-me)"
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

    if (element.classList.contains("content-highlight-lifetime-others")) {
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
      .querySelector(".content-highlight-identifier-" + highlightId)
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
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open(requestType, url, true);
    xmlhttp.setRequestHeader(
      "Content-type",
      "application/x-www-form-urlencoded"
    );
    xmlhttp.setRequestHeader("Accept", "application/json");
    if (document.querySelector('meta[name="csrf-token"]') != null) {
      xmlhttp.setRequestHeader(
        "X-CSRF-Token",
        document.querySelector('meta[name="csrf-token"]').content
      );
    }
    xmlhttp.onreadystatechange = (event) => {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
        const data = JSON.parse(xmlhttp.responseText);
        callbackFunc(data.all_highlights);
      }
    };

    xmlhttp.send(new URLSearchParams(params).toString());
  }
}

export default ContentHighlightWorker;