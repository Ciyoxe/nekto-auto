
type ChatNode = {
    self   : boolean,
    text   : string,
    dead?  : true,

    children: ChatNode[],
}

export class ChatTree {
    nodes   = [] as ChatNode[];
    path    = [] as ChatNode[];

    constructor(autosaveInterval = 30_000) {
        if (autosaveInterval) {
            setInterval(() => this.saveTree(), autosaveInterval);
        }
    }

    saveTree() {
        localStorage.setItem(`nekto-auto-chatTree`, JSON.stringify({ nodes: this.nodes }));
    }
    async loadTree() {
        const data = localStorage.getItem(`nekto-auto-chatTree`);
        try {
            this.nodes = JSON.parse(data!).nodes;
        }
        catch {
            this.nodes = [];
        }
    }

    /** moves to next node in conversation or creates new */
    moveNext(text: string, self: boolean) {
        const nextNodes = this.nextNodes;

        for (const candidate of nextNodes) {
            if (candidate.self === self && candidate.text.toUpperCase().trim() === text.toUpperCase().trim()) {
                this.path.push(candidate);
                return;
            }
        }

        const newNode = {
            self,
            text,
            hits : 0,
            deads: 0,
            children: [],
        }
        nextNodes.push(newNode);
        this.path.push(newNode);
    }
    reset() {
        this.path.length = 0;
    }

    get currentNode() {
        return this.path[this.path.length - 1] ?? null;
    }
    get nextNodes() {
        const  currentNode = this.path[this.path.length - 1];
        return currentNode ? currentNode.children : this.nodes;
    }
    get depth() {
        return this.path.length;
    }
}