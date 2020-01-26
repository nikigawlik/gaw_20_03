import { setEvents, setupPin } from "./main.mjs";


export function createNode(title) {
    let nodeElement = document.createElement("div");
    nodeElement.classList.add("draggable", "node");
    let h3Element = document.createElement("h3");
    h3Element.append(title);
    nodeElement.append(h3Element);
    let textElement = document.createElement("p");
    textElement.classList.add("text");
    nodeElement.append(textElement);
    let optionsElement = document.createElement("div");
    nodeElement.append(optionsElement);
    
    document.querySelector(".node-area").append(nodeElement);
    setEvents(nodeElement);

    // let self = {
    //     nodeElement: nodeElement,
    //     askChoice: (...options) => {
    //         let resolve;
    //         let promise = new Promise(r => resolve = r);
    //         for(let i = 0; i < options.length; i++) {
    //             let button = document.createElement("button");
    //             button.innerHTML = options[i];
    //             optionsElement.append(button);
    //             button.onclick = event => {
    //                 optionsElement.innerHTML = "";
    //                 resolve(i);
    //             };
    //         }
    //         return promise;
    //     }
    // }

    return nodeElement;
}


function addPin(node, name, isInput, isOutput, value="") {
    let container = document.createElement("p");
    container.classList.add("centered");
    let pin = document.createElement("span");
    pin.dataset.value = value;
    if(isInput) pin.classList.add("pin", "in");
    if(isOutput) pin.classList.add("pin", "out");
    setupPin(pin);
    if(isInput) container.append(name);
    container.append(pin);
    if(isOutput) container.append(name);
    node.querySelector("p.text").append(container);
}

function setText(node, text) {
    let textNode = node.querySelector("p.text");
    textNode.innerHTML = "";
    textNode.append(text);
    return textNode;
}

function addText(node, text) {
    let textNode = node.querySelector("p.text");
    textNode.append(text);
    return textNode;
}

function setTitle(node, title) {
    let h3 = node.querySelector("h3");
    h3.innerHTML = "";
    h3.append(title);
    return h3;
}

export function createLesserDemonicForce() {
    let node = createNode("lesser demonic force");
    addPin(node, "raw demonic force", false, true, "force");

    return node;
}

function getConnectedPin(pin) {
    if(!pin.dataset.connectedID) return null;
    return document.getElementById(pin.dataset.connectedID);
}

export function createForceAggregator() {
    let node = createNode("force aggregator");
    addPin(node, "demonic force", true, false);
    addPin(node, "demonic force", true, false);
    addPin(node, "demonic force", true, false);

    node.addEventListener("customconnect", event => {
        for(let e of node.querySelectorAll(".pin.in")) {
            let pin = getConnectedPin(e);
            if(!pin || pin.dataset.value != "force") {
                return;
            }
        }
        setTitle(node, "LEVIATHAN");
        for(let e of node.querySelectorAll(".pin.in")) {
            document.getElementById(e.dataset.connectedID).closest(".node").remove();
            document.getElementById(e.dataset.cableID).plsDelete();
        }
        setText(node, "Leviathan watches you, towering over your sea of conciousness.")
        addPin(node, "WATER", false, true, "water");
    });
}

export function createPentagram() {
    let node = createNode("⛧");
    let title = setTitle(node, "⛧");
    title.style.fontSize = "75px";
    title.style.margin = "0";
    addPin(node, "", true, true, "pentagram");
    addPin(node, "", true, true, "pentagram");
    return node;
}

export function createImageNode(index) {
    let node = createNode("");
    let textNode = setText(node, "");
    // let img = document.createElement("img");
    // img.setAttribute("src", `luci000${index}.png`);
    // img.setAttribute("width", "200");
    // // img.setAttribute("height", "100");
    // textNode.append(img);
    textNode.style.width = "150px";
    textNode.style.height = "150px";
    textNode.style.backgroundImage = `url(luci000${index}.png)`;
    textNode.style.backgroundSize = "cover";
    return node;
}