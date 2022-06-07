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

    const arr = type.typeArguments?.[0];
    if (!arr) throw new Error("No array");
    if (!ts.isTupleTypeNode(arr)) {
        console.log(`Incorrect first query argument, must be tuple type`);
        throw new Error(`Incorrect first query argument, must be tuple type`);
    }

    const names = arr.elements.map((el) => {
        if (ts.isTupleTypeNode(el)) {
            console.log("tuple type el");
            const child = el.elements[1]; // ["[", "Type",, "Name", "]"]
            console.log(child.getText());
            if (ts.isLiteralTypeNode(child)) {
                if (child.literal.kind === ts.SyntaxKind.StringLiteral)
                    return factory.createStringLiteral(child.literal.text);
                else if (child.literal.kind === ts.SyntaxKind.NumericLiteral)
                    return factory.createNumericLiteral(child.literal.text);
            }
            console.log("Unknown query component ID type");
        }
        return factory.createIdentifier(el.getText());
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
