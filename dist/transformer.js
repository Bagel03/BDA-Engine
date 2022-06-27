(()=>{"use strict";var e={68:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,i)}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&n(t,e,r);return i(t,e),t};t.__esModule=!0,t.convertEnums=void 0;var o=a(r(262));t.convertEnums=function(e,t){var r=t.factory,n=r.createObjectLiteralExpression(e.members.map((function(e){return r.createPropertyAssignment(e.name.getText(),r.createCallExpression(r.createIdentifier("Symbol"),void 0,[r.createStringLiteral(e.name.getText())]))})),!0);return r.createVariableStatement(e.modifiers,r.createVariableDeclarationList([r.createVariableDeclaration(e.name.getText(),void 0,void 0,n)],o.NodeFlags.Const))}},109:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,i)}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&n(t,e,r);return i(t,e),t},o=this&&this.__spreadArray||function(e,t,r){if(r||2===arguments.length)for(var n,i=0,a=t.length;i<a;i++)!n&&i in t||(n||(n=Array.prototype.slice.call(t,0,i)),n[i]=t[i]);return e.concat(n||Array.prototype.slice.call(t))};t.__esModule=!0,t.convertSystem=void 0;var c=a(r(262)),l=r(811),u=r(329),s=r(736);t.convertSystem=function(e,t){var r=t.factory,n=r.createUniqueName("world").text,i=r.createUniqueName("setup").text,a=r.createParameterDeclaration(void 0,void 0,void 0,n),d=r.createParameterDeclaration(void 0,void 0,void 0,i),f=[],p=e.parameters.map((function(t){if(!t.type||!c.isTypeReferenceNode(t.type))throw new Error("Not a world");switch(t.type.typeName.getText()){case"Ent":return(0,l.createEntityDeclaration)(t,t.type,r,n);case"Query":var i=(0,u.createQueryDeclarationAndSetup)(t,t.type,r,n),a=i.getter,o=i.setup;return f.push(r.createExpressionStatement(o)),a;case"Res":return(0,s.createResDeclaration)(t,t.type,r,n);default:return console.log('Unknown system pram "'.concat(t.type.typeName.getText(),'" in system "').concat(e.name,'"')),r.createVariableDeclaration(t.name)}})),y=r.createVariableDeclarationList(p,c.NodeFlags.Const),v=r.createVariableStatement([],y),m=r.createIfStatement(r.createIdentifier(i),r.createBlock(o(o([],f,!0),[r.createReturnStatement(r.createStringLiteral("__system__"))],!1),!0));if(!e.body)throw new Error("No body");var g=r.createBlock(o([m,v],e.body.statements,!0),!0);return r.createFunctionDeclaration(e.decorators,e.modifiers,e.asteriskToken,e.name,e.typeParameters,[a,d],e.type,g)}},811:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,i)}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&n(t,e,r);return i(t,e),t};t.__esModule=!0,t.createEntityDeclaration=void 0;var o=a(r(262));t.createEntityDeclaration=function(e,t,r,n){var i,a=null===(i=t.typeArguments)||void 0===i?void 0:i[0];if(!a)throw new Error("No ID for entity");var c=null;if(o.isLiteralTypeNode(a)&&(a.literal.kind===o.SyntaxKind.StringLiteral?c=r.createStringLiteral(a.literal.text):a.literal.kind===o.SyntaxKind.NumericLiteral&&(c=r.createNumericLiteral(a.literal.text))),o.isTypeQueryNode(a)&&(console.log(a),c=r.createIdentifier(a.exprName.getText())),!c)throw console.log("Unsupported entity access type"),new Error("Unsupported entity access type");return r.createVariableDeclaration(e.name,void 0,void 0,r.createCallExpression(r.createPropertyAccessExpression(r.createIdentifier(n),r.createIdentifier("getEntity")),void 0,[c]))}},329:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,i)}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&n(t,e,r);return i(t,e),t};t.__esModule=!0,t.createQueryDeclarationAndSetup=void 0;var o=a(r(262)),c=function(e){if(o.isTypeQueryNode(e))return o.factory.createIdentifier(e.exprName.getText());if(e.literal.kind===o.SyntaxKind.StringLiteral)return o.factory.createStringLiteral(e.literal.getText());if(e.literal.kind===o.SyntaxKind.NumericLiteral)return o.factory.createNumericLiteral(e.literal.getText());throw new Error("Incorrect literal type")},l=function(e){if(o.isTypeNode,o.isTypeReferenceNode(e)&&e.typeArguments.length>0)return o.factory.createCallExpression(o.factory.createIdentifier(e.typeName.getText()),[],e.typeArguments.map(l));if(o.isTypeReferenceNode(e))return o.factory.createIdentifier(e.typeName.getText());if(o.isLiteralTypeNode(e)||o.isTypeQueryNode(e))return c(e);throw new Error("Couldn't function-fy ".concat(e.kind))},u=0;t.createQueryDeclarationAndSetup=function(e,t,r,n){var i,a,s=r.createVariableDeclaration(e.name,void 0,void 0,r.createCallExpression(r.createPropertyAccessExpression(r.createIdentifier(n),r.createIdentifier("getQuery")),void 0,[r.createStringLiteral(u.toString())])),d=null===(i=t.typeArguments)||void 0===i?void 0:i[0];if(!d)throw new Error("No array");if(!o.isTupleTypeNode(d))throw console.log("Incorrect first query argument, must be tuple type"),new Error("Incorrect first query argument, must be tuple type");var f,p=d.elements.map((function(e){if(o.isTupleTypeNode(e)){var t=e.elements[1];if(o.isLiteralTypeNode(t)||o.isTypeQueryNode(t))return c(t);console.log("Unknown query component ID type")}return r.createIdentifier(e.getText())})),y=null===(a=t.typeArguments)||void 0===a?void 0:a[1];y&&(f=l(y));var v=f?[r.createArrayLiteralExpression(p),f]:[r.createArrayLiteralExpression(p)],m=r.createCallExpression(r.createPropertyAccessExpression(r.createIdentifier(n),r.createIdentifier("addQuery")),void 0,[r.createNewExpression(r.createIdentifier(t.typeName.getText()),void 0,v),r.createStringLiteral(u.toString())]);return u++,{getter:s,setup:m}}},736:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,i)}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&n(t,e,r);return i(t,e),t};t.__esModule=!0,t.createResDeclaration=void 0;var o=a(r(262));t.createResDeclaration=function(e,t,r,n){var i,a,c=null===(i=t.typeArguments)||void 0===i?void 0:i[0];if(!c)throw new Error("No type for res");var l=null===(a=t.typeArguments)||void 0===a?void 0:a[1],u=null;if(console.log(l,c.kind),l?(o.isLiteralTypeNode(l)&&(l.literal.kind===o.SyntaxKind.StringLiteral?u=r.createStringLiteral(l.literal.text):l.literal.kind===o.SyntaxKind.NumericLiteral&&(u=r.createNumericLiteral(l.literal.text))),o.isTypeQueryNode(l)&&(u=r.createIdentifier(l.exprName.getText()))):u=r.createIdentifier(c.getText()),!u)throw console.log("Unsupported resource access type"),new Error("Unsupported resource access type");return r.createVariableDeclaration(e.name,void 0,void 0,r.createCallExpression(r.createPropertyAccessExpression(r.createIdentifier(n),r.createIdentifier("getRes")),void 0,[u]))}},758:function(e,t,r){var n=this&&this.__createBinding||(Object.create?function(e,t,r,n){void 0===n&&(n=r);var i=Object.getOwnPropertyDescriptor(t,r);i&&!("get"in i?!t.__esModule:i.writable||i.configurable)||(i={enumerable:!0,get:function(){return t[r]}}),Object.defineProperty(e,n,i)}:function(e,t,r,n){void 0===n&&(n=r),e[n]=t[r]}),i=this&&this.__setModuleDefault||(Object.create?function(e,t){Object.defineProperty(e,"default",{enumerable:!0,value:t})}:function(e,t){e.default=t}),a=this&&this.__importStar||function(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)"default"!==r&&Object.prototype.hasOwnProperty.call(e,r)&&n(t,e,r);return i(t,e),t};t.__esModule=!0;var o=a(r(262)),c=r(68),l=r(109);t.default=function(e){return function(t){var r=function(t){var n,i;return o.isFunctionDeclaration(t)&&o.getJSDocTags(t).find((function(e){return"system"===e.tagName.escapedText}))?(console.log("Converting [36m".concat(null===(n=t.name)||void 0===n?void 0:n.getText(),"[0m to pure system")),(0,l.convertSystem)(t,e)):o.isEnumDeclaration(t)&&o.getJSDocTags(t).find((function(e){return"symbol"===e.tagName.escapedText}))?(console.log("Converting [36m".concat(null===(i=t.name)||void 0===i?void 0:i.getText(),"[0m to symbol enum")),(0,c.convertEnums)(t,e)):o.visitEachChild(t,r,e)};return o.visitNode(t,r)}}},262:e=>{e.exports=require("typescript")}},t={},r=function r(n){var i=t[n];if(void 0!==i)return i.exports;var a=t[n]={exports:{}};return e[n].call(a.exports,a,a.exports,r),a.exports}(758);module.exports.default=r.default})();