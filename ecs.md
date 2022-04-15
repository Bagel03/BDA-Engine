# ECS

## Overview:

-   Everything (Logic, players, etc) is stored in a scene (or world)
-   Everything in the work is represented by entities
-   Entities are ID's with attached components
-   Systems interact with entities based on what components they have

## Entities

-   **Should only be an ID (string or number)**
-   No need for an entity class
-   Blueprints can represent entities that are not in the scene

## Components

-   **Can be anything**
-   Each entity can only have one of each component

## Systems

-   Should target entities with certain components

## Important notes

-   Entities are not a class that holds components
-   Components are stored in big arrays inside of the scene

## Psudo Code:

```
World
    components
        position:
            0: (0, 0),
            1: (1, 0),
            2: (1, 1)
        rotation:
            0: 0
            2: 180
    entities:
        0: [position, rotation] <- This should be a bitmask
        1: [position]
        2: [position, rotation]
```

Components could be stored as arrays or (arrays are faster)

Getting an entity would give you a list of all the component it has (but not the actual component data)
To get that data you go `components.name.id`

Systems can then iterate through the components that they target (`components.name`) and have all the entities with that component
