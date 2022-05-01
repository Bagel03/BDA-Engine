import { World } from "../../src/core/world";
import { LoadRelations } from "./components/relations";
import { LoadHierarchy } from "./overrides/hierarchy";

export const CorePlugin = (world: World) => {
    LoadRelations(world);
    LoadHierarchy(world);
};
