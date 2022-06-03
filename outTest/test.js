"use strict";
function mySys(world, setup) {
    if (setup) {
        world.addQuery(new Query([Ent]), "0");
        return "__system__";
    }
    const myQuery = world.getQuery("0");
}
