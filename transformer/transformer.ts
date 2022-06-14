import * as ts from "typescript";
import { convertEnums } from "./enums";
import { convertSystem } from "./system";

const transformer: ts.TransformerFactory<ts.SourceFile> = (context) => {
    return (sourceFile) => {
        const visitor = (node: ts.Node): ts.Node => {
            // Only look at function nodes
            if (ts.isFunctionDeclaration(node)) {
                const tags = ts.getJSDocTags(node);
                const match = tags.find(
                    (tag) => tag.tagName.escapedText === "system"
                );

                if (match) {
                    console.log(
                        `Converting \x1b[36m${node.name?.getText()}\x1b[0m to pure system`
                    );
                    return convertSystem(node, context);
                }
            }

            if (ts.isEnumDeclaration(node)) {
                const tags = ts.getJSDocTags(node);
                const match = tags.find(
                    (tag) => tag.tagName.escapedText === "symbol"
                );

                if (match) {
                    console.log(
                        `Converting \x1b[36m${node.name?.getText()}\x1b[0m to symbol enum`
                    );
                    return convertEnums(node, context);
                }
            }

            // if (ts.isImportDeclaration(node)) {
            //     if (!ts.isStringLiteral(node.moduleSpecifier))
            //         throw new Error("Not a string literal");
            //     const text = node.moduleSpecifier.text;
            //     if (
            //         text === "typescript" ||
            //         text.includes("/types/") ||
            //         text.endsWith(".js")
            //     )
            //         return ts.visitEachChild(node, visitor, context);

            //     return ts.factory.updateImportDeclaration(
            //         node,
            //         node.decorators,
            //         node.modifiers,
            //         node.importClause,
            //         ts.factory.createStringLiteral(
            //             node.moduleSpecifier.text + ".js"
            //         ),
            //         node.assertClause
            //     );
            // }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};

export default transformer;
