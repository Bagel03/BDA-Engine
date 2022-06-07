import * as ts from "typescript";

export const createResDeclaration = (
    pram: ts.ParameterDeclaration,
    type: ts.TypeReferenceNode,
    factory: ts.NodeFactory,
    worldName: string
) => {
    const classNode = type.typeArguments?.[0];
    if (!classNode) {
        throw new Error("No type for res");
    }

    const nameNode = type.typeArguments?.[1];

    let expression: ts.Expression | null = null;

    console.log(nameNode, classNode.kind);

    if (!nameNode) {
        expression = factory.createIdentifier(classNode.getText());
    } else {
        if (ts.isLiteralTypeNode(nameNode)) {
            if (nameNode.literal.kind === ts.SyntaxKind.StringLiteral)
                expression = factory.createStringLiteral(nameNode.literal.text);
            else if (nameNode.literal.kind === ts.SyntaxKind.NumericLiteral)
                expression = factory.createNumericLiteral(
                    nameNode.literal.text
                );
        }

        if (ts.isTypeQueryNode(nameNode)) {
            expression = factory.createIdentifier(nameNode.exprName.getText());
        }
    }

    if (!expression) {
        console.log("Unsupported resource access type");
        throw new Error("Unsupported resource access type");
    }

    return factory.createVariableDeclaration(
        pram.name,
        undefined,
        undefined,
        factory.createCallExpression(
            factory.createPropertyAccessExpression(
                factory.createIdentifier(worldName),
                factory.createIdentifier("getRes")
            ),
            undefined,
            [expression]
        )
    );
};
