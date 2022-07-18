import * as ts from "typescript";
import { createEntityDeclaration } from "./system/entity";
import { createQueryDeclarationAndSetup } from "./system/query";
import { createResDeclaration } from "./system/res";
import { createWorldDeclaration } from "./system/world";

export const convertSystem = (
    node: ts.FunctionDeclaration,
    { factory }: ts.TransformationContext
) => {
    const worldName = factory.createUniqueName("__world").text;
    const setupName = factory.createUniqueName("__setup").text;

    const worldPram = factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        worldName
    );

    const setupPram = factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        setupName
    );

    const ifBlockStatements: ts.Statement[] = [];

    const pramStatements = node.parameters.map((pram) => {
        if (!pram.type || !ts.isTypeReferenceNode(pram.type))
            throw new Error("Not a world"); // Remove this when doing world queries

        switch (pram.type.typeName.getText()) {
            case "World": {
                return createWorldDeclaration(
                    pram,
                    pram.type,
                    factory,
                    worldName
                );
            }
            case "Ent": {
                const declaration = createEntityDeclaration(
                    pram,
                    pram.type,
                    factory,
                    worldName
                );
                return declaration;
            }

            case "Query": {
                const { getter, setup } = createQueryDeclarationAndSetup(
                    pram,
                    pram.type,
                    factory,
                    worldName
                );

                ifBlockStatements.push(
                    factory.createExpressionStatement(setup)
                );
                return getter;
            }

            case "Res": {
                return createResDeclaration(
                    pram,
                    pram.type,
                    factory,
                    worldName
                );
            }

            default: {
                console.log(
                    `Unknown system pram "${pram.type.typeName.getText()}" in system "${
                        node.name
                    }"`
                );
                return factory.createVariableDeclaration(pram.name);
            }
        }
    });

    const list = factory.createVariableDeclarationList(
        pramStatements,
        ts.NodeFlags.Const
    );
    const varsStatement = factory.createVariableStatement([], list);

    const ifStatement = factory.createIfStatement(
        factory.createIdentifier(setupName),
        factory.createBlock(
            [
                ...ifBlockStatements,
                factory.createReturnStatement(
                    factory.createStringLiteral("__system__")
                ),
            ],
            true
        )
    );

    if (!node.body) {
        throw new Error("No body");
    }
    const body = factory.createBlock(
        [ifStatement, varsStatement, ...node.body.statements],
        true
    );

    return factory.createFunctionDeclaration(
        node.decorators,
        node.modifiers,
        node.asteriskToken,
        node.name,
        node.typeParameters,
        [worldPram, setupPram],
        node.type,
        body
    );
};
