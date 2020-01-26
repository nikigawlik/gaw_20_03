import { createLesserDemonicForce } from "./nodes.mjs";
import { createForceAggregator } from "./nodes.mjs";
import { createPentagram } from "./nodes.mjs";

export function processCommand(command) {
    command = command.trim();

    switch(command) {
        case "HAIL SATAN":
            createLesserDemonicForce();
            break;
        // case "LEVIATHAN":
        //     createForceAggregator();
        //     break;
        case "⛧":
            createPentagram();
            break;
    }
}