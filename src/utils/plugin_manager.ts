import { World } from "../core/world";
import { nameSymbol } from "../config/symbols";
import { Logger, LoggerColors } from "./logger";

type Plugin<T> = (world: T) => any;

export class PluginManager {
    private readonly plugins: Plugin<typeof this>[] = [];
    private static readonly logger = new Logger(
        "PluginManager",
        LoggerColors.blue
    );

    addPlugin(plugin: Plugin<typeof this>) {
        try {
            PluginManager.logger.group(
                `Adding plugin ${plugin[nameSymbol] || plugin.name}`
            );
            plugin(this);
            PluginManager.logger.groupEnd();
            this.plugins.push(plugin);
        } catch (e) {
            PluginManager.logger.error(
                `Failed to load plugin ${plugin[nameSymbol] || plugin.name}: `
            );
            PluginManager.logger.error(e);
        }
    }

    addPlugins(plugins: Plugin<typeof this>[]) {
        PluginManager.logger.group(
            `Adding plugins ${plugins[nameSymbol] || ""}`.trim()
        );
        plugins.forEach((plugin) => this.addPlugin(plugin));
        PluginManager.logger.groupEnd();
    }

    hasPlugin(plugin: Plugin<typeof this>) {
        return this.plugins.includes(plugin);
    }
}
