import * as ts from "typescript";

export const createWorldDeclaration = (
    pram: ts.ParameterDeclaration,
    type: ts.TypeReferenceNode,
    factory: ts.NodeFactory,
    worldName: string
) => {
    // return factory.createVariableStatement(
    //     undefined,
    //     factory.createVariableDeclarationList(
    //         [
    return factory.createVariableDeclaration(
        factory.createIdentifier(pram.name.getText()),
        undefined,
        undefined,
        factory.createIdentifier(worldName)
    );
    //         ],
    //         ts.NodeFlags.Const
    //     )
    // );
};
