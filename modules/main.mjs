import { init as dialogeInit } from "./dialoge.mjs";
import { KEY_CODES } from "./utils.mjs";
import { processCommand } from "./console.mjs";
import { dotProduct } from "./utils.mjs";
import { createForceAggregator } from "./nodes.mjs";
import { createLesserDemonicForce } from "./nodes.mjs";
import { createImageNode } from "./nodes.mjs";

let xmlns = null;
let svgElement = null;
let cursorElement = null;

window.onload = () => {
    let main = document.querySelector("main");

    createSVG();
    cursorElement = document.createElement("div");
    cursorElement.style.width = 0;
    cursorElement.style.height = 0;
    cursorElement.style.position = "absolute";
    document.body.append(cursorElement);
    document.addEventListener("mousemove", event => {
        cursorElement.style.left = `${event.clientX}px`;
        cursorElement.style.top = `${event.clientY}px`;
        var event = createCustomMoveEvent(event.clientX, event.clientY);
        cursorElement.dispatchEvent(event);
    });
    setEvents(main);

    dialogeInit();
    window.addEventListener("keydown", event => {
        switch (event.keyCode) {
            case KEY_CODES.ZERO + 1:
                createLesserDemonicForce();
                break;
            case KEY_CODES.ZERO + 2:
                createForceAggregator();
                break;
        }
    })

    let mouseTrail = [0, 0, 0, 0];
    let lastNotWiggle = Date.now();
    let lastWiggle = Date.now();
    window.addEventListener("mousemove", (event) => {
        let x1 = event.clientX - mouseTrail[2];
        let y1 = event.clientY - mouseTrail[3];
        let x2 = mouseTrail[0] - mouseTrail[2];
        let y2 = mouseTrail[1] - mouseTrail[3];
        let wiggle = dotProduct(x1, y1, x2, y2);
        if(Date.now() - lastWiggle > 1000) lastNotWiggle = Date.now();
        if(wiggle) lastWiggle = Date.now();
        if(Date.now() - lastNotWiggle > 20 * 1000) {
            lastNotWiggle = Date.now();
            createForceAggregator();
        }
        mouseTrail[0] = mouseTrail[2];
        mouseTrail[1] = mouseTrail[3];
        mouseTrail[2] = event.clientX;
        mouseTrail[3] = event.clientY;
    });
}

let curConnectingElement = null;
let boundsElement = null;
export function setEvents(root) {
    boundsElement = root.querySelector(".node-area") || root.closest(".node-area");
    for(let element of querySelectorAllAndSelf(root, '.draggable')) {
        setupDraggable(element, boundsElement);
    }

    for(let element of root.querySelectorAll(".pin")) {
        setupPin(element, boundsElement);
    }
}

function setupDraggable(element) {
    element.onmousedown = event => {
        element.dataset.isDragged = true;
        let rect = element.getBoundingClientRect();
        let offsetX = rect.left - event.clientX;
        let offsetY = rect.top - event.clientY;

        let mouseMove = event => {
            // move element to cursor position (respecting offset)
            let left = (event.clientX + offsetX);
            let top = (event.clientY + offsetY);
            
            // respect boundaries
            let areaBounds = boundsElement.getBoundingClientRect();
            let elementBounds = element.getBoundingClientRect();
            element.style.left = Math.min(Math.max(left, areaBounds.left), areaBounds.right - elementBounds.width) + "px";
            element.style.top = Math.min(Math.max(top, areaBounds.top), areaBounds.bottom - elementBounds.height) + "px";

            // set a custom event for other elements to respond to (e.g. cables)
            var event = createCustomMoveEvent(event.clientX, event.clientY);
            element.dispatchEvent(event);
        };

        boundsElement.addEventListener("mousemove", mouseMove);

        boundsElement.addEventListener("mouseup", event => {
            boundsElement.removeEventListener("mousemove", mouseMove);
            element.dataset.isDragged = false;
        }, {once: true});
    };

    for(let child of element.querySelectorAll("button,input")) {
        child.addEventListener("mousedown", event => {
            event.stopPropagation();
        });
    }
}

export function setupPin(element) {
    element.id = "id" + Math.floor(Math.random() * 0xffffffff);

    element.onmousedown = event => {
        event.stopPropagation();

        let cableElement = element.classList.contains("out")? 
            createCable(element, cursorElement, false)
            :
            createCable(cursorElement, element, false);
        ;
        curConnectingElement = element;

        boundsElement.addEventListener("mouseup", event => {
            cableElement.plsDelete();
        }, {once: true});
    };
    element.onmouseup = event => {
        if(curConnectingElement) {
            try {
                if(curConnectingElement.classList.contains("out") && element.classList.contains("in")) {
                    createCable(curConnectingElement, element);
                    let event = createCustomConnectEvent(curConnectingElement, element);
                    curConnectingElement.dispatchEvent(event);
                    element.dispatchEvent(event);
                    event.stopPropagation();
                }
                else if(curConnectingElement.classList.contains("in") && element.classList.contains("out")) {
                    createCable(element, curConnectingElement);
                    let event = createCustomConnectEvent(element, curConnectingElement);
                    element.dispatchEvent(event);
                    curConnectingElement.dispatchEvent(event);
                    event.stopPropagation();
                }
                else {
                    // let event = createCustomConnectEvent(element, curConnectingElement);
                    // element.dispatchEvent(event);
                    // curConnectingElement.dispatchEvent(event);
                    // console.error("Cable can only connect input and output pins.")
                }
            } catch(error) {
                console.error(error);
                // SUMMON THE PUZZLE
                for(let i = 0; i < 9; i++) {
                    createImageNode(i);
                }
                curConnectingElement.closest(".node").remove();
            }
            curConnectingElement = null;
        }
    }
}

function querySelectorAllAndSelf(root, selector) {
    return [root, ...root.querySelectorAll(selector)].filter(el => el.matches(selector));
}

function createCustomMoveEvent(x, y) {
    return new CustomEvent(
        "custommove", 
        {
            detail: {
                x: x,
                y: y,
            },
            bubbles: true,
            cancelable: true,
        }
    );
}

function createCustomConnectEvent(fromElement, toElement) {
    return new CustomEvent(
        "customconnect",
        {
            detail: {
                failed: !(fromElement && toElement),
                fromElement: fromElement,
                toElement: toElement,
            },
            bubbles: true,
            cancelable: true,
        }
    );
}

function createSVG() {
    xmlns = "http://www.w3.org/2000/svg";
    
    svgElement = document.createElementNS(xmlns, "svg");
    let updateSize = () => {
        var boxWidth = window.innerWidth;
        var boxHeight = window.innerHeight;
        svgElement.setAttributeNS(null, "viewBox", "0 0 " + boxWidth + " " + boxHeight);
        svgElement.setAttributeNS(null, "width", boxWidth);
        svgElement.setAttributeNS(null, "height", boxHeight);
    }
    updateSize();
    window.addEventListener("resize", updateSize);
    svgElement.setAttributeNS(null, "stroke", "black");
    svgElement.setAttributeNS(null, "fill", "none");
    svgElement.setAttributeNS(null, "pointer-events", "none");
    // cableElement.setAttributeNS(xmlns, "stroke-width", "1");
    svgElement.style.display = "block";

    let main = document.querySelector("main");
    // main.insertBefore(svgElement, main.querySelector(".node-area"));
    main.append(svgElement);

    let myConsole = document.querySelector("textarea.console");
    myConsole.addEventListener("keyup", event => {
        if(event.keyCode == KEY_CODES.ENTER) {
            processCommand(myConsole.value);
            myConsole.value = "";
        }
    })

    // var g = document.createElementNS(xmlns, "g");
    // svgElem.appendChild(g);
    // g.setAttributeNS(null, 'transform', 'matrix(1,0,0,-1,0,300)');
}

// returns a function to set the positions: (x1, y1, x2, y2) => {}
function createCable(fromElement, toElement, pointerEvents=true, color="#111") {
    let fromNode = fromElement.closest(".node") || fromElement;
    let toNode = toElement.closest(".node") || toElement;
    if(toNode == fromNode) throw new Error("Can't connect within a node");


    if(fromElement.dataset.cableID) {
        document.querySelector(`#${fromElement.dataset.cableID}`).plsDelete();
    }
    if(toElement.dataset.cableID) {
        document.querySelector(`#${toElement.dataset.cableID}`).plsDelete();
    }

    fromElement.dataset.connectedID = toElement.id;
    toElement.dataset.connectedID = fromElement.id;

    let cableElement = document.createElementNS(xmlns, "path");
    cableElement.id = `id${Math.floor(Math.random()*0xffffff)}`;
    fromElement.dataset.cableID = cableElement.id;
    toElement.dataset.cableID = cableElement.id;

    cableElement.setAttributeNS(null, "fill", "none");
    svgElement.append(cableElement);
    cableElement.setAttributeNS(null, "stroke", color);
    cableElement.setAttributeNS(null, "stroke-width", 4);
    if(pointerEvents) cableElement.setAttributeNS(null, "pointer-events", "stroke");

    let x1, y1, x2, y2;
    
    let updatePath = () => {
        let deltaX = (x2 - x1);
        let deltaY = (y2 - y1);
        let halfX = deltaX / 2;
        let halfY = deltaY / 2;
        let path = "";

        let angle = Math.atan2(halfY, halfX);
        let distance = (halfX**2 + halfY**2)**0.5;
        let absHX = angle**2 * 20 + (distance**0.5 * 2);

        path = `M ${x1},${y1}`
            + `c ${absHX} 0 ${deltaX - absHX} ${deltaY} ${deltaX} ${deltaY} `

        cableElement.setAttributeNS(null, "d", 
            path
        );
    }
    let updateFrom = () => {
        let rect = fromElement.getBoundingClientRect();
        x1 = rect.left + rect.width / 2;
        y1 = rect.top + rect.height / 2;

        updatePath();
    }
    let updateTo = () => {
        let rect = toElement.getBoundingClientRect();
        x2 = rect.left + rect.width / 2;
        y2 = rect.top + rect.height / 2;
        updatePath();
    }
    fromNode.addEventListener("custommove", updateFrom);
    toNode.addEventListener("custommove", updateTo);
    updateFrom();
    updateTo();

    cableElement.onmousedown = cableElement.plsDelete = event => {
        if(!cableElement.parentNode) return;
        delete fromElement.dataset.connectedID;
        delete fromElement.dataset.cableID
        delete toElement.dataset.connectedID;
        delete toElement.dataset.cableID
        cableElement.remove();
        console.log("removed")
    }

    return cableElement;
}
