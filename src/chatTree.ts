
type ChatNode = {
    self   : boolean,
    text   : string,
    dead?  : true,

    children: ChatNode[],
}

export class ChatTree {
    // for autosaving, one checkpoint every 10 seconds
    // null if there was no changes in tree since last checkpoint
    checkpoints = [] as (string | null)[];
    wasChanges  = false;

    private saveCheckpoint() {
        // first checkpoint should be saved even if there was no changes
        if (this.wasChanges || this.checkpoints.length === 0) {
            this.wasChanges = false;
            this.checkpoints.push(JSON.stringify(this.nodes));
        } else {
            this.checkpoints.push(null);
        }
        // 10 minutes - max time for restoring
        if (this.checkpoints.length > 60)
            this.checkpoints.shift();
    }

    nodes = [] as ChatNode[];
    path  = [] as ChatNode[];

    constructor() {
        this.loadTree();
        setInterval(()=> this.saveTree(), 30_000);
        setInterval(()=> this.saveCheckpoint(), 10_000);
    }

    saveTree() {
        localStorage.setItem(`nekto-auto-chatTree`, JSON.stringify({ nodes: this.nodes }));
    }
    loadTree() {
        const data = localStorage.getItem(`nekto-auto-chatTree`);
        try {
            this.nodes = JSON.parse(data!).nodes;
        }
        catch {
            this.nodes = [];
        }
        this.wasChanges = true;
    }

    /** restore state of tree that was timeMs ago, maximum 10 minutes */
    restoreCheckpoint(timeMs: number) {
        const indexFromEnd  = Math.min(this.checkpoints.length - 1, Math.round(timeMs / 10_000));
        const checkpointIdx = this.checkpoints.length - 1 - indexFromEnd;
        
        for (let i = checkpointIdx; i >= 0; i--) {
            if (this.checkpoints[i] !== null) {
                console.log("RESTORED CHECKPOINT", strDiff(JSON.stringify(this.nodes), this.checkpoints[i]!));

                this.nodes       = JSON.parse(this.checkpoints[i]!);
                this.checkpoints = [];
                this.saveTree();
                return;
            }
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
            children: [],
        }
        nextNodes.push(newNode);
        this.path.push(newNode);
        this.wasChanges = true;
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
    set data(nodes: ChatNode[]) {
        this.nodes      = nodes;
        this.wasChanges = true;
    }
}

function strDiff(s1: string, s2: string) {
    const target = s1.length > s2.length ? s1 : s2;
    const source = s1.length > s2.length ? s2 : s1;

    let start = 0;
    let end   = target.length - 1;
    
    for (let i = 0; i < source.length; i++) {
        if (target[i] !== source[i]) {
            start = i;
            break;
        }
    }
    for (let i = 0; i < source.length; i++) {
        if (target[target.length - 1 - i] !== source[source.length - 1 - i]) {
            end = target.length - 1 - i;
            break;
        }
    }

    return target.slice(start, end + 1);
}