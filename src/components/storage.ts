import { Disposable, Memento } from "vscode";

export class LocalStorageService {

    constructor(private storage: Memento) { }

    public getValue<T>(key: string): T | undefined {
        return this.storage.get<T>(key);
    }

    public setValue<T>(key: string, value: T) {
        this.storage.update(key, value);
    }

    
    public getKeys() {
        return this.storage.keys(); }

    public clearStorage() { 
        let cleanStorage: Disposable = new Disposable(() => {
            this.storage.keys().forEach((key) => {
                this.storage.update(key, undefined);
            });
        });
        return cleanStorage;
    }

}