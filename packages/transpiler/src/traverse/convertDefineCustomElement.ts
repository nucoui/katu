import type * as t from "@babel/types";
import * as babelTypes from "@babel/types";
import { jsxToHtmlAst } from "./jsxToHtmlAst.js";

/**
 * defineCustomElementのprops参照(props.xxx)をthis.getAttribute('kebab-case')に変換する
 * Convert props.xxx in JSX/TSX to this.getAttribute('kebab-case')
 *
 * @param varDecl Babel ASTのVariableDeclaratorノード
 * @returns Babel ASTのClassDeclarationノードまたは元のVariableDeclarator
 */
export function convertDefineCustomElement(varDecl: t.VariableDeclarator): t.ClassDeclaration | t.VariableDeclarator {
  let className = "";
  if (varDecl.init && varDecl.init.type === "CallExpression" && varDecl.init.callee.type === "Identifier" && varDecl.init.callee.name === "defineCustomElement") {
    className = (varDecl.id.type === "Identifier") ? varDecl.id.name : "CustomElement";
    const callExpr = varDecl.init;
    const [fn, options] = callExpr.arguments;
    let propsDef: Record<string, any> = {};
    if (options && options.type === "ObjectExpression") {
      const propsProp = options.properties.find(
        (p: any) => p.type === "ObjectProperty" && ((p.key.type === "Identifier" && p.key.name === "props") || (p.key.type === "StringLiteral" && p.key.value === "props")),
      );
      if (propsProp && propsProp.type === "ObjectProperty" && propsProp.value.type === "ObjectExpression") {
        propsDef = Object.fromEntries(
          propsProp.value.properties
            .filter((p: any) => p.type === "ObjectProperty" && ((p.key.type === "Identifier") || (p.key.type === "StringLiteral")))
            .map((p: any) => [p.key.type === "Identifier" ? p.key.name : p.key.value, p]),
        );
      }
    }
    const propNames = Object.keys(propsDef);
    const toKebab = (str: string) => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    const propToAttr: Record<string, string> = {};
    propNames.forEach((p) => {
      propToAttr[p] = toKebab(p);
    });
    // --- ここから新ロジック ---
    // fn.body.bodyからrenderコールバックを探し、その直前までの全ての宣言・副作用文をconstructorに集約
    const constructorStmts: t.Statement[] = [];
    let renderCallback: t.Function | t.ArrowFunctionExpression | null = null;
    if (fn && (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") && fn.body.type === "BlockStatement") {
      for (const stmt of fn.body.body) {
        if (
          stmt.type === "ExpressionStatement" && stmt.expression.type === "CallExpression" && stmt.expression.callee.type === "Identifier" && stmt.expression.callee.name === "render"
        ) {
          // render(() => ...) のコールバックを抽出
          const cb = stmt.expression.arguments[0];
          if (cb && (cb.type === "ArrowFunctionExpression" || cb.type === "FunctionExpression")) {
            renderCallback = cb;
          }
          break;
        }
        // それ以外はconstructorに集約
        constructorStmts.push(stmt);
      }
    }
    // signal分割代入情報を収集
    type SignalDecl = { getter: string; setter: string; init: t.Expression };
    const signalDecls: SignalDecl[] = [];
    const signalGetters: string[] = [];
    const signalSetters: string[] = [];
    constructorStmts.forEach((stmt) => {
      if (stmt.type === "VariableDeclaration") {
        stmt.declarations.forEach((decl) => {
          if (
            decl.id.type === "ArrayPattern"
            && decl.init
            && decl.init.type === "CallExpression"
            && decl.init.callee.type === "Identifier"
            && decl.init.callee.name === "signal"
          ) {
            const [getter, setter] = decl.id.elements;
            if (getter && getter.type === "Identifier" && setter && setter.type === "Identifier") {
              // SpreadElementやArgumentPlaceholderは無視
              const arg = decl.init.arguments[0] ?? babelTypes.identifier("undefined");
              signalDecls.push({
                getter: getter.name,
                setter: setter.name,
                init: arg as t.Expression,
              });
              signalGetters.push(getter.name);
              signalSetters.push(setter.name);
            }
          }
        });
      }
    });
    // constructorStmts内のsignal/変数/ハンドラ宣言は全てthis.xxxで初期化する形に変換
    const constructorBody = babelTypes.blockStatement([
      babelTypes.expressionStatement(babelTypes.callExpression(babelTypes.super(), [])),
      // signalの初期化と分割代入をペアで出力
      ...signalDecls.flatMap(({ getter, setter, init }) => [
        babelTypes.expressionStatement(
          babelTypes.assignmentExpression(
            "=",
            babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(getter)),
            babelTypes.callExpression(babelTypes.identifier("signal"), [init]),
          ),
        ),
        babelTypes.variableDeclaration("const", [
          babelTypes.variableDeclarator(
            babelTypes.arrayPattern([
              babelTypes.identifier(getter),
              babelTypes.identifier(setter),
            ]),
            babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(getter)),
          ),
        ]),
      ]),
      // signal以外の変数・ハンドラ・副作用
      ...constructorStmts.flatMap((stmt) => {
        if (stmt.type === "VariableDeclaration") {
          return stmt.declarations.flatMap((decl) => {
            if (
              decl.id.type === "Identifier"
              && !(decl.init && decl.init.type === "CallExpression" && decl.init.callee.type === "Identifier" && decl.init.callee.name === "signal")
            ) {
              // 通常変数, ハンドラ
              return [babelTypes.expressionStatement(
                babelTypes.assignmentExpression(
                  "=",
                  babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(decl.id.name)),
                  decl.init || babelTypes.identifier("undefined"),
                ),
              )];
            }
            return [];
          });
        }
        // その他の副作用文（setInterval等）はそのまま
        return [stmt];
      }),
    ]);
    // constructorBodyにもsignal分割代入を挿入
    // super();はconstructorの一番最初に一度だけ出力し、injectSignalDestructuresToBodyでは絶対にsuper()を挿入しない
    const constructorBodyWithSignals = constructorBody;
    // setTime等の参照をthis.setTimeに置換
    function replaceVarToThisInRender<T extends t.Node>(node: T): T {
      function walk(n: any, parent: any = null): any {
        if (!n || typeof n !== "object")
          return n;
        if (
          n.type === "Identifier"
          && !(signalGetters.includes(n.name) || signalSetters.includes(n.name)) // signal getter/setterはローカル参照のまま
          && constructorStmts.some(stmt => stmt.type === "VariableDeclaration" && stmt.declarations.some(d => d.id.type === "Identifier" && d.id.name === n.name))
          && !(parent && parent.type === "MemberExpression" && parent.object === n)
          && !(parent && parent.type === "VariableDeclarator" && parent.id === n)
        ) {
          return babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(n.name));
        }
        if (
          n.type === "MemberExpression"
          && n.object.type === "Identifier"
          && n.object.name === "props"
        ) {
          if (n.property.type === "Identifier") {
            const attrName = propToAttr[n.property.name] || n.property.name;
            return babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("getAttribute")),
              [babelTypes.stringLiteral(attrName)],
            );
          }
          else {
            return n;
          }
        }
        if (n.type === "MemberExpression") {
          n.object = walk(n.object, n);
          return n;
        }
        for (const key in n) {
          if (Array.isArray(n[key])) {
            n[key] = n[key].map((child: any) => walk(child, n));
          }
          else if (n[key] && typeof n[key] === "object" && n[key].type) {
            n[key] = walk(n[key], n);
          }
        }
        return n;
      }
      return walk(babelTypes.cloneNode(node, true));
    }
    // BlockStatement内のreturn JSX/JSXFragmentをjsxDom呼び出しに変換
    function transformBlockReturnJSX(block: t.BlockStatement): t.BlockStatement {
      function walkStmts(stmts: t.Statement[]): t.Statement[] {
        return stmts.map((stmt) => {
          if (stmt.type === "ReturnStatement" && stmt.argument && (stmt.argument.type === "JSXElement" || stmt.argument.type === "JSXFragment")) {
            return babelTypes.returnStatement(
              jsxToHtmlAst(replaceVarToThisInRender(stmt.argument), []),
            );
          }
          else if (stmt.type === "IfStatement") {
            return babelTypes.ifStatement(
              stmt.test,
              stmt.consequent.type === "BlockStatement"
                ? transformBlockReturnJSX(stmt.consequent)
                : stmt.consequent,
              stmt.alternate && stmt.alternate.type === "BlockStatement"
                ? transformBlockReturnJSX(stmt.alternate)
                : stmt.alternate,
            );
          }
          return stmt;
        });
      }
      return babelTypes.blockStatement(walkStmts(block.body));
    }
    // _renderHtml, connectedCallback, 各ハンドラの先頭にsignal分割代入を挿入
    function injectSignalDestructuresToBody(body: t.BlockStatement): t.BlockStatement {
      if (signalDecls.length === 0)
        return body;
      // 既に同じ分割代入がある場合は重複挿入しない
      const first = body.body[0];
      if (
        first
        && first.type === "VariableDeclaration"
        && first.declarations[0].id.type === "ArrayPattern"
        && first.declarations[0].id.elements[0]
        && first.declarations[0].id.elements[0].type === "Identifier"
        && signalGetters.includes(first.declarations[0].id.elements[0].name)
      ) {
        return body;
      }
      // signal分割代入＋残り
      return babelTypes.blockStatement([
        ...signalDecls.map(({ getter, setter }) =>
          babelTypes.variableDeclaration("const", [
            babelTypes.variableDeclarator(
              babelTypes.arrayPattern([
                babelTypes.identifier(getter),
                babelTypes.identifier(setter),
              ]),
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(getter)),
            ),
          ]),
        ),
        ...body.body,
      ]);
    }
    // クラス本体生成
    const renderMethodBody = renderCallback && renderCallback.body.type === "BlockStatement"
      ? injectSignalDestructuresToBody(transformBlockReturnJSX(replaceVarToThisInRender(renderCallback.body) as t.BlockStatement))
      : (renderCallback && (renderCallback.body.type === "JSXElement" || renderCallback.body.type === "JSXFragment"))
          ? babelTypes.blockStatement([
              ...signalDecls.map(({ getter, setter }) =>
                babelTypes.variableDeclaration("const", [
                  babelTypes.variableDeclarator(
                    babelTypes.arrayPattern([
                      babelTypes.identifier(getter),
                      babelTypes.identifier(setter),
                    ]),
                    babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(getter)),
                  ),
                ]),
              ),
              babelTypes.returnStatement(
                jsxToHtmlAst(replaceVarToThisInRender(renderCallback.body), []),
              ),
            ])
          : renderCallback
            ? babelTypes.blockStatement([
                ...signalDecls.map(({ getter, setter }) =>
                  babelTypes.variableDeclaration("const", [
                    babelTypes.variableDeclarator(
                      babelTypes.arrayPattern([
                        babelTypes.identifier(getter),
                        babelTypes.identifier(setter),
                      ]),
                      babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(getter)),
                    ),
                  ]),
                ),
                babelTypes.returnStatement(replaceVarToThisInRender(renderCallback.body) as t.Expression),
              ])
            : babelTypes.blockStatement([
                babelTypes.returnStatement(babelTypes.stringLiteral("<div>JSX変換未実装</div>")),
              ]);
    const connectedCallbackBody = injectSignalDestructuresToBody(
      babelTypes.blockStatement([
        // shadowRoot生成
        babelTypes.ifStatement(
          babelTypes.unaryExpression("!", babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot"))),
          babelTypes.blockStatement([
            babelTypes.expressionStatement(
              babelTypes.callExpression(
                babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("attachShadow")),
                [babelTypes.objectExpression([
                  babelTypes.objectProperty(babelTypes.identifier("mode"), babelTypes.stringLiteral("open")),
                ])],
              ),
            ),
          ]),
        ),
        // 初回描画
        babelTypes.expressionStatement(
          babelTypes.callExpression(
            babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_patchDom")),
            [babelTypes.callExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_renderHtml")), [])],
          ),
        ),
        // effect
        babelTypes.expressionStatement(
          babelTypes.callExpression(
            babelTypes.identifier("effect"),
            [babelTypes.arrowFunctionExpression(
              [],
              babelTypes.blockStatement([
                ...signalGetters.map(name => babelTypes.expressionStatement(babelTypes.callExpression(babelTypes.identifier(name), []))),
                babelTypes.expressionStatement(
                  babelTypes.callExpression(
                    babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_patchDom")),
                    [babelTypes.callExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_renderHtml")), [])],
                  ),
                ),
              ]),
            )],
          ),
        ),
      ]),
    );
    const attributeChangedCallbackBody = babelTypes.blockStatement([
      babelTypes.expressionStatement(
        babelTypes.callExpression(
          babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_patchDom")),
          [babelTypes.callExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_renderHtml")), [])],
        ),
      ),
    ]);
    const patchDomBody = babelTypes.blockStatement([
      babelTypes.ifStatement(
        babelTypes.unaryExpression("!", babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot"))),
        babelTypes.blockStatement([babelTypes.returnStatement()]),
      ),
      babelTypes.variableDeclaration("const", [
        babelTypes.variableDeclarator(
          babelTypes.identifier("nodes"),
          babelTypes.conditionalExpression(
            babelTypes.callExpression(
              babelTypes.memberExpression(
                babelTypes.identifier("Array"),
                babelTypes.identifier("isArray"),
              ),
              [babelTypes.identifier("newDom")],
            ),
            babelTypes.callExpression(
              babelTypes.memberExpression(
                babelTypes.identifier("newDom"),
                babelTypes.identifier("map"),
              ),
              [
                babelTypes.arrowFunctionExpression([
                  babelTypes.identifier("n"),
                ], babelTypes.conditionalExpression(
                  babelTypes.binaryExpression("===", babelTypes.unaryExpression("typeof", babelTypes.identifier("n")), babelTypes.stringLiteral("string")),
                  babelTypes.callExpression(
                    babelTypes.memberExpression(
                      babelTypes.identifier("document"),
                      babelTypes.identifier("createTextNode"),
                    ),
                    [babelTypes.identifier("n")],
                  ),
                  babelTypes.identifier("n"),
                )),
              ],
            ),
            babelTypes.arrayExpression([
              babelTypes.conditionalExpression(
                babelTypes.binaryExpression("===", babelTypes.unaryExpression("typeof", babelTypes.identifier("newDom")), babelTypes.stringLiteral("string")),
                babelTypes.callExpression(
                  babelTypes.memberExpression(
                    babelTypes.identifier("document"),
                    babelTypes.identifier("createTextNode"),
                  ),
                  [babelTypes.identifier("newDom")],
                ),
                babelTypes.identifier("newDom"),
              ),
            ]),
          ),
        ),
      ]),
      babelTypes.variableDeclaration("const", [
        babelTypes.variableDeclarator(
          babelTypes.identifier("current"),
          babelTypes.callExpression(
            babelTypes.memberExpression(
              babelTypes.callExpression(
                babelTypes.memberExpression(babelTypes.identifier("Array"), babelTypes.identifier("from")),
                [babelTypes.memberExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot")), babelTypes.identifier("childNodes"))],
              ),
              babelTypes.identifier("slice"),
            ),
            [],
          ),
        ),
      ]),
      babelTypes.ifStatement(
        babelTypes.binaryExpression("!==", babelTypes.memberExpression(babelTypes.identifier("current"), babelTypes.identifier("length")), babelTypes.memberExpression(babelTypes.identifier("nodes"), babelTypes.identifier("length"))),
        babelTypes.blockStatement([
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot")), babelTypes.identifier("replaceChildren")),
              [babelTypes.spreadElement(babelTypes.identifier("nodes"))],
            ),
          ),
          babelTypes.returnStatement(),
        ]),
      ),
      babelTypes.forStatement(
        babelTypes.variableDeclaration("let", [babelTypes.variableDeclarator(babelTypes.identifier("i"), babelTypes.numericLiteral(0))]),
        babelTypes.binaryExpression("<", babelTypes.identifier("i"), babelTypes.memberExpression(babelTypes.identifier("nodes"), babelTypes.identifier("length"))),
        babelTypes.updateExpression("++", babelTypes.identifier("i")),
        babelTypes.blockStatement([
          babelTypes.ifStatement(
            babelTypes.unaryExpression("!", babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.memberExpression(babelTypes.identifier("current"), babelTypes.identifier("i"), true), babelTypes.identifier("isEqualNode")),
              [babelTypes.memberExpression(babelTypes.identifier("nodes"), babelTypes.identifier("i"), true)],
            )),
            babelTypes.blockStatement([
              babelTypes.expressionStatement(
                babelTypes.callExpression(
                  babelTypes.memberExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot")), babelTypes.identifier("replaceChild")),
                  [
                    babelTypes.memberExpression(babelTypes.identifier("nodes"), babelTypes.identifier("i"), true),
                    babelTypes.memberExpression(babelTypes.identifier("current"), babelTypes.identifier("i"), true),
                  ],
                ),
              ),
            ]),
          ),
        ]),
      ),
    ]);
    const classBody: t.ClassBody = babelTypes.classBody([
      babelTypes.classProperty(
        babelTypes.identifier("observedAttributes"),
        babelTypes.arrayExpression([babelTypes.stringLiteral("name")]),
        undefined,
        undefined,
        false,
        true,
      ),
      babelTypes.classMethod(
        "constructor",
        babelTypes.identifier("constructor"),
        [],
        constructorBodyWithSignals,
      ),
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("connectedCallback"),
        [],
        connectedCallbackBody,
      ),
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("attributeChangedCallback"),
        [],
        attributeChangedCallbackBody,
      ),
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("_patchDom"),
        [babelTypes.identifier("newDom")],
        patchDomBody,
      ),
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("_renderHtml"),
        [],
        renderMethodBody,
      ),
    ]);
    return babelTypes.classDeclaration(
      babelTypes.identifier(className),
      babelTypes.identifier("HTMLElement"),
      classBody,
      [],
    );
  }
  return varDecl;
}
