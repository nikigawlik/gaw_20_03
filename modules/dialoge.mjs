
export function init() {
    // story1();
}

async function story1() {
    let node1 = createNode("intro node");
    node1.setText("Hi there. I am am the intro node. I am here to introduce you to this whacky adventure.");
    let choice = await node1.askChoice("Cool.", "Very cool.", "Whatever.");
    switch (choice) {
        case 0: 
            node1.setText("Indeed. ");
        break;
        case 1:
            node1.setText("I appreciate your enthusiasm. ")
        break;
        case 2: 
            node1.setText("I expect a little more exitement! ") 
    }
    node1.addText("I am here to tell you about the basic interactions of this game. ")
    await node1.askChoice("Ok.");
    node1.setText("So to start of please drag me to the middle of the screen.");
    let continueResolve;
    let onCustomMove = event => {
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let rect = node1.nodeElement.getBoundingClientRect();
        let x = rect.left + rect.width / 2;
        let y = rect.top + rect.height / 2;
        let distance = ((targetX - x)**2 + (targetY - y)**2)**0.5;
        node1.setText(`Only ${Math.round(distance)} pixels left.`);
        if(distance < 50) {
            setTimeout(continueResolve, 500);
        }
    };
    node1.nodeElement.addEventListener("custommove", onCustomMove);
    await new Promise(rs => continueResolve = rs);
    node1.nodeElement.removeEventListener("custommove", onCustomMove);
    node1.setText("Close enough.");
    await node1.askChoice("...");
    node1.setText("Now this is an output pin:");
    let pinPromise = node1.addOutputPin("data");
    await node1.askChoice('what?');
    node1.addText("It is a little dude you can connect to. Try dragging from it.")
    await node1.askChoice("I understand.");
    node1.addText("Nice, ok let's move on.")
    await node1.askChoice("...");
    node1.setText("Let's connect this pin to the other node over there.");
    let inputPinPromise = node1.addOutputPin("data");

    let node2 = createNode("the other node");
    node2.setText("Hi there.");
    node2.addInputPin("input");

    let result = await inputPinPromise;
    node1.setText("Great!");
}