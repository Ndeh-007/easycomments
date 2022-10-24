import { workspace } from "vscode";


const PREFIXCONFIG = 'easycomments';
export function getConfiguration() {
    return workspace.getConfiguration(PREFIXCONFIG);
}


export function getConfig<T>(key: string, defaultValue?:T):T | undefined;
export function getConfig<T>(key: string, defaultValue: T):T;
export function getConfig<T>(key: string, defaultValue: T):T{
    let configuration = getConfiguration();
    let value:any = configuration.get<T>(key);
    if (typeof value === 'undefined' || value === '') {
        value = defaultValue;
    }
    return value;
};