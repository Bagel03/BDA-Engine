import * as ts from "typescript";

export const createEntityDeclaration = (
    pram: ts.ParameterDeclaration,
    type: ts.TypeReferenceNode,
    factory: ts.NodeFactory,
    worldName: string
) => {
    const idNode = type.typeArguments?.[0];
    if (!idNode) {
        throw new Error("No ID for entity");
    }

    let expression: ts.Expression | null = null;

    if (ts.isLiteralTypeNode(idNode)) {
        if (idNode.literal.kind === ts.SyntaxKind.StringLiteral)
            expression = factory.createStringLiteral(idNode.literal.text);
        else if (idNode.literal.kind === ts.SyntaxKind.NumericLiteral)
            expression = factory.createNumericLiteral(idNode.literal.text);
    }

    if (ts.isTypeQueryNode(idNode)) {
        expression = factory.createIdentifier(idNode.exprName.getText());
    }

    if (!expression) {
        console.log("Unsupported entity access type");
        throw new Error("Unsupported entity access type");
    }

    return factory.createVariableDeclaration(
        pram.name,
        undefined,
        undefined,
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(worldName),
                factory.createIdentifier("getEntity")
            ),
            undefined,
            [expression]
        )
    );
};
