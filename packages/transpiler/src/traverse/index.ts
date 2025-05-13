import type { parse } from "@/parser";
import type * as t from "@babel/types";
import * as babelTypes from "@babel/types";
import { convertDefineCustomElement } from "./convertDefineCustomElement";

/**
 * JSX/TSXで記述されたdefineCustomElement呼び出しをASTから解析し、
 * CustomElementクラス生成に必要な情報を抽出し、Babel ASTノード(t.ClassDeclaration)として返すtraverse関数。
 */
const traverse = (ast: ReturnType<typeof parse>): t.Node => {
  if (ast.type === "File") {
    // 既存のimport { effect } from ... があるかチェック
    const hasEffectImport = ast.program.body.some(
      (stmt: any) => stmt.type === "ImportDeclaration"
        && stmt.source.value === "@katu/reactivity"
        && stmt.specifiers.some((s: any) => s.imported?.name === "effect"),
    );
    // VariableDeclaratorのdefineCustomElement検出位置を記録
    const replacements: Array<{ idx: number; classDecl: t.ClassDeclaration }> = [];
    ast.program.body.forEach((stmt: any, idx: number) => {
      if (
        stmt.type === "VariableDeclaration"
        && stmt.declarations.length === 1
        && stmt.declarations[0].init
        && stmt.declarations[0].init.type === "CallExpression"
        && stmt.declarations[0].init.callee.type === "Identifier"
        && stmt.declarations[0].init.callee.name === "defineCustomElement"
      ) {
        const classDecl = convertDefineCustomElement(stmt.declarations[0]);
        if (classDecl && classDecl.type === "ClassDeclaration") {
          replacements.push({ idx, classDecl });
        }
      }
    });
    // 置換を実施
    replacements.forEach(({ idx, classDecl }) => {
      ast.program.body[idx] = classDecl;
    });
    // 先頭にeffect importを追加（なければ）
    if (!hasEffectImport) {
      const importEffect = babelTypes.importDeclaration(
        [babelTypes.importSpecifier(babelTypes.identifier("effect"), babelTypes.identifier("effect"))],
        babelTypes.stringLiteral("@katu/reactivity"),
      );
      ast.program.body.unshift(importEffect);
    }
    // 先頭にjsx, Fragment importを追加（なければ）
    const hasJsxImport = ast.program.body.some(
      (stmt: any) => stmt.type === "ImportDeclaration"
        && stmt.source.value === "@katu/runtime"
        && stmt.specifiers.some((s: any) => s.imported?.name === "jsxDom"),
    );
    if (!hasJsxImport) {
      const importJsx = babelTypes.importDeclaration(
        [
          babelTypes.importSpecifier(babelTypes.identifier("jsxDom"), babelTypes.identifier("jsxDom")),
          babelTypes.importSpecifier(babelTypes.identifier("Fragment"), babelTypes.identifier("Fragment")),
        ],
        babelTypes.stringLiteral("@katu/runtime"),
      );
      ast.program.body.unshift(importJsx);
    }
    return ast;
  }
  // それ以外は従来通り（単一ノード変換）
  if (
    (ast as any).type === "VariableDeclarator"
    && (ast as any).init
    && (ast as any).init.type === "CallExpression"
    && (ast as any).init.callee.type === "Identifier"
    && (ast as any).init.callee.name === "defineCustomElement"
  ) {
    return convertDefineCustomElement(ast as any) || ast;
  }
  return ast;
};

export { traverse };
