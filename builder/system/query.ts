import * as ts from "typescript";

let currentQueryID = 0;

export const createQueryDeclarationAndSetup = (
    pram: ts.ParameterDeclaration,
    type: ts.TypeReferenceNode,
    factory: ts.NodeFactory,
    worldName: string
) => {
    const getter = factory.createVariableDeclaration(
        pram.name,
        undefined,
        undefined,
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(worldName),
                factory.createIdentifier("getQuery")
            ),
            undefined,
            [factory.createStringLiteral(currentQueryID.toString())]
        )
    );

    const arr = type.typeArguments[0];
    if (!ts.isTupleTypeNode(arr)) {
        console.log(`Incorrect first query argument, must be tuple type`);
        return;
    }

    const names = arr.elements.map((el) => {
        return factory.createIdentifier(el.getText()); // TODO aliases
    });

    const setup = factory.createCallExpression(
        factory.createPropertyAccessExpression(
            factory.createIdentifier(worldName),
            factory.createIdentifier("addQuery")
        ),
        undefined,
        [
            factory.createNewExpression(
                factory.createIdentifier(type.typeName.getText()),
                undefined,
                [factory.createArrayLiteralExpression(names)]
            ),
            factory.createStringLiteral(currentQueryID.toString()),
        ]
    );

    currentQueryID++;

    return { getter, setup };
};
