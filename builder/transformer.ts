import * as ts from "typescript";
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
                        `Converting \x1b[36m${node.name.getText()}\x1b[0m to pure system`
                    );
                    return convertSystem(node, context);
                }
            }

            return ts.visitEachChild(node, visitor, context);
        };

        return ts.visitNode(sourceFile, visitor);
    };
};

export default transformer;
