import { Entity } from "../core/entity";
import { Query } from "../core/query";
import { Ent, Res } from "../core/system";
import { World } from "../core/world";

const world = new World();

const ent = new Entity("1");
const ent2 = new Entity("2");

new Query([]);

class myComp {
    constructor(public num: number) {}
}

ent.add(new myComp(2));
ent2.add(new myComp(3));

world.addRes(new myComp(54));

/** @system */
function mySys(query: Query<[myComp]>, ent: Ent<"1">, res: Res<myComp>) {
    for (const [myComp, ent] of query) {
        console.log(myComp.num, ent.id);
    }

    console.log(ent.get(myComp).num);
    console.log(res.num);
}

world.addSystem(mySys);
world.addEntity(ent);
world.addEntity(ent2);
world.update();
