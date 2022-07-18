import * as ts from "typescript";

const literalTypeToValue = (type: ts.LiteralTypeNode | ts.TypeQueryNode) => {
    if (ts.isTypeQueryNode(type)) {
        return ts.factory.createIdentifier(type.exprName.getText());
    }
    if (ts.isLiteralTypeNode(type)) {
        if (type.literal.kind === ts.SyntaxKind.StringLiteral) {
            return ts.factory.createStringLiteral(type.literal.getText());
        }

        if (type.literal.kind === ts.SyntaxKind.NumericLiteral) {
            return ts.factory.createNumericLiteral(type.literal.getText());
        }
    }

    throw new Error("Incorrect literal type");
};

const functionFy = (node: ts.TypeNode) => {
    if (ts.isTypeReferenceNode(node) && node.typeArguments.length > 0) {
        return ts.factory.createCallExpression(
            // ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier(node.typeName.getText()),
            //     "call"
            // ),
            [],
            node.typeArguments.map(functionFy)
        );
    }
    if (ts.isTypeReferenceNode(node)) {
        return ts.factory.createIdentifier(node.typeName.getText());
    }
    if (ts.isLiteralTypeNode(node) || ts.isTypeQueryNode(node)) {
        return literalTypeToValue(node);
    }

    throw new Error(`Couldn't function-fy ${node}`);
};

let builtTime = Date.now().toString() + "-";
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
            [factory.createStringLiteral(builtTime + currentQueryID.toString())]
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
            const child = el.elements[1]; // ["[", "Type",, "Name", "]"]
            if (ts.isLiteralTypeNode(child) || ts.isTypeQueryNode(child)) {
                return literalTypeToValue(child);
            }
            console.log("Unknown query component ID type");
        }
        return factory.createIdentifier(el.getText());
    });

    const checkerType = type.typeArguments?.[1];

    let expression;
    if (checkerType) {
        expression = functionFy(checkerType);
    }
    const queryPrams = expression
        ? [factory.createArrayLiteralExpression(names), expression]
        : [factory.createArrayLiteralExpression(names)];

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
                queryPrams
            ),
            factory.createStringLiteral(builtTime + currentQueryID.toString()),
        ]
    );

    currentQueryID++;

    return { getter, setup };
};
