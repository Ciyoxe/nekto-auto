import { NektoPlugin } from "./nektoPlugin";

const plugin = new NektoPlugin();

plugin.onStateChanged.on(({ prev, curr }) => {
    console.log(`${prev} -> ${curr}`);
});
plugin.onNewMessage.on(({ text, self }) => {
    console.log(`message: ${text} (${self ? "self" : "other"})`);
});