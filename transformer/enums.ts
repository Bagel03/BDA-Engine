import * as ts from "typescript";
export const convertEnums = (
    node: ts.EnumDeclaration,
    { factory }: ts.TransformationContext
) => {
    const newObj = factory.createObjectLiteralExpression(
        node.members.map((member) =>
            factory.createPropertyAssignment(
                member.name.getText(),
                factory.createCallExpression(
                    factory.createIdentifier("Symbol"),
                    undefined,
                    [factory.createStringLiteral(member.name.getText())]
                )
            )
        ),
        true
    );

    return factory.createVariableStatement(
        node.modifiers,
        factory.createVariableDeclarationList(
            [
                factory.createVariableDeclaration(
                    node.name.getText(),
                    undefined,
                    undefined,
                    newObj
                ),
            ],
            ts.NodeFlags.Const
        )
    );
};
