class OnlineSocketsMap {
    constructor() {
        if (!OnlineSocketsMap.instance) {
            this.map = new Map();
            OnlineSocketsMap.instance = this;
        }

        return OnlineSocketsMap.instance;
    }

    set(key, value) {
        this.map.set(key, value);
    }

    get(key) {
        return this.map.get(key);
    }

    delete(key) {
        this.map.delete(key);
    }

    has(key) {
        return this.map.has(key);
    }

    clear() {
        this.map.clear();
    }

    entries() {
        return this.map.entries();
    }
}

// Freeze the instance to prevent modifications
const onlineSockets = Object.freeze(new OnlineSocketsMap());
export default onlineSockets;
