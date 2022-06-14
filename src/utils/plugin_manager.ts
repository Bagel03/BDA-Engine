import { Logger, LoggerColors } from "./logger";
import { Class } from "../types/class";
import { nameSymbol } from "../config/symbols";

type Plugin<T> = (world: T) => any;

declare global {
    interface Function {
        [nameSymbol]?: string;
    }

    interface Array<T> {
        [nameSymbol]?: string;
    }
}

export const name = (name: string) => (target: Class) => {
    target[nameSymbol] = name;
    return target;
};

export class PluginManager<T extends any> {
    private readonly plugins: Plugin<T>[] = [];
    private static readonly logger = new Logger(
        "PluginManager",
        LoggerColors.blue
    );

    addPlugin(plugin: Plugin<T>) {
        try {
            PluginManager.logger.group(
                `Adding plugin ${plugin[nameSymbol] || plugin.name}`
            );
            plugin(this as any);
            PluginManager.logger.groupEnd();
            this.plugins.push(plugin);
        } catch (e) {
            PluginManager.logger.error(
                `Failed to load plugin ${plugin[nameSymbol] || plugin.name}: `
            );
            PluginManager.logger.error(e);
        }
    }

    addPlugins(plugins: Plugin<T>[]) {
        PluginManager.logger.group(
            `Adding plugins ${plugins[nameSymbol] || ""}`.trim()
        );
        plugins.forEach((plugin) => this.addPlugin(plugin));
        PluginManager.logger.groupEnd();
    }

    hasPlugin(plugin: Plugin<T>) {
        return this.plugins.includes(plugin);
    }
}
