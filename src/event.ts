export class Event<T = void> {
    private listeners = new Set<(data: T) => void>;
    private oneShots  = new Set<(data: T) => void>;

    once(callback: (data: T) => void) {
        this.oneShots.add(callback);
    }
    on(callback: (data: T) => void) {
        this.listeners.add(callback);
    }
    off(callback: (data: T) => void) {
        this.listeners.delete(callback);
        this.oneShots.delete(callback);
    }
    emit(data: T) {
        for (const callback of this.listeners)
            callback(data);
        for (const callback of this.oneShots)
            callback(data);
        this.oneShots.clear();
    }
}