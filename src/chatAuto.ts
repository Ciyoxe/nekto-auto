import { NektoPlugin } from "./nektoPlugin";
import { ChatTree    } from "./chatTree";
import { Event       } from './event';


export class AutoChat {
    private sendMessage() {
        if (!this.messaging) {
            this.running   = false;
            this.isStopped = true;
            this.onStop.emit();
            return;
        }
        
        const candidates = this.tree.nextNodes.filter(c => c.self);

        if (candidates.length === 0) {
            this.running   = false;
            this.isStopped = true;
            this.onStop.emit();
            return;
        }

        const text = weightedDecide(candidates.map(c => [c.text, c.hits]));

        if (this.plugin.state.status === "in-active-chat" && text !== null)
            this.plugin.state.sendMessage(text);
    }
    private waitForMessage() {
        const minWaitLimit =  2_000;
        const maxWaitLimit = 10_000;

        let   status    = "waiting" as "waiting" | "user-answered" | "user-inactive" | "typing-timeout";
        let   pauseTime = Date.now();
        const startTime = Date.now();
        
        const finish = () => {
            this.plugin.onUserTyping.off(stopTyping);
            this.plugin.onNewMessage.off(getMessage);
            clearInterval(interval);

            if (status !== "user-answered")
                this.sendMessage();
        };
        const stopTyping = (typing: boolean) => {
            if (!typing)
                pauseTime = Date.now();
        };
        const getMessage = ({ self }: { self: boolean, text: string }) => {
            if (!self)
                status = "user-answered";
        };
        
        this.plugin.onUserTyping.on(stopTyping);
        this.plugin.onNewMessage.on(getMessage);

        const interval = setInterval(() => {
            if (Date.now() - startTime > maxWaitLimit)
                status = "typing-timeout";
            if (!this.plugin.isUserTyping && Date.now() - pauseTime > minWaitLimit)
                status = "user-inactive";

            if (status !== "waiting")
                finish();
        }, 100);
    }
    private doNextAction() {
        const currentNode = this.tree.currentNode;
        const candidates  = this.tree.nextNodes;

        if (candidates.length === 0) {
            this.running   = false;
            this.isStopped = true;
            this.onStop.emit();
            return;
        }

        // dead-end branch - exit from chat
        if (this.leaving && !currentNode.self && decide(currentNode.deads / currentNode.hits)) {
            if (this.plugin.state.status === "in-active-chat")
                this.plugin.state.exitChat();
            return;
        }

        const waitingHits = candidates.filter(c => !c.self).reduce((a, b) => a + b.hits, 0);
        const messageHits = candidates.filter(c =>  c.self).reduce((a, b) => a + b.hits, 0) + 1;

        if (decide(waitingHits / (waitingHits + messageHits))) {
            this.waitForMessage();
            return;
        }

        this.sendMessage();
    }

    /** Is in automated mode now */
    private running = false;

    // user settings
    capturing = true;
    messaging = false;
    leaving   = false;
    skipping  = false;

    private plugin : NektoPlugin;
    

    tree      : ChatTree;
    maxDepth  = 7;
    isStopped = false;
    onStop    = new Event();

    constructor(plugin: NektoPlugin) {
        this.tree   = new ChatTree();
        this.plugin = plugin;

        plugin.onStateChanged.on(({ prev, curr }) => {
            if (prev !== "chat-end-confirmation" && curr === "in-active-chat") {
                this.running   = true;
                this.isStopped = false;
                this.tree.reset();
            }
            if (this.skipping) {
                if (plugin.state.status === "chat-finished-by-self" || plugin.state.status === "chat-finished-by-nekto")
                    plugin.state.nextChat();
                if (plugin.state.status === "chat-end-confirmation")
                    plugin.state.confirmExit();
            }
            if (curr === "chat-finished-by-self" && this.capturing && !this.running)
                this.tree.currentNode.deads++;
        });
        plugin.onNewMessage.on(({ text, self }) => {
            if (this.tree.depth > this.maxDepth)
                return;

            this.tree.moveNext(text, self);

            if (this.capturing && !this.running)
                this.tree.currentNode.hits++;
            this.doNextAction();
        });
    }
    async init() {
        await  this.tree.loadTree();
        return this;
    }
}


// just helpers
function decide(chance: number) {
    return Math.random() <= chance;
}
function weightedDecide<T>(values: /** [value, weight] */ [T, number][]) {
    const totalWeight = values.reduce((a, b) => a + b[1], 0);

    if (totalWeight === 0)
        return null;

    let random = Math.random() * totalWeight;
    for (const value of values) {
        random -= value[1];
        if (random <= 0)
            return value[0];
    }
    return null;
}