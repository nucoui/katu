import type * as t from "@babel/types";
import type { EventBinding, SignalInfo } from "./types";
import * as babelTypes from "@babel/types";
import { extractEventHandlersAndMark } from "./extractEventHandlers.js";
import { jsxToHtmlAst } from "./jsxToHtmlAst.js";
import { replaceSignalCalls } from "./replaceSignalCalls.js";
// import traverseBabel from "@babel/traverse";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function convertDefineCustomElement(varDecl: t.VariableDeclarator): t.ClassDeclaration | t.VariableDeclarator {
  let className = "";
  if (varDecl.init && varDecl.init.type === "CallExpression" && varDecl.init.callee.type === "Identifier" && varDecl.init.callee.name === "defineCustomElement") {
    className = (varDecl.id.type === "Identifier") ? varDecl.id.name : "CustomElement";
    const callExpr = varDecl.init;
    const [fn, _options] = callExpr.arguments;
    if (!fn || !(fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression"))
      return varDecl;
    const signals: SignalInfo[] = [];
    let constructorBody: t.BlockStatement | null = null;
    let _jsxReturn: t.JSXElement | t.JSXFragment | null = null;
    let observedAttributes: string[] = [];
    const handlerMap: Record<string, t.FunctionExpression | t.ArrowFunctionExpression> = {};
    // --- 追加: 通常変数宣言の抽出 ---
    const renderVars: t.VariableDeclarator[] = [];
    const filteredBody: t.Statement[] = [];
    // --- 追加: 変数名リスト ---
    const renderVarNames: string[] = [];
    fn.body.type === "BlockStatement" && fn.body.body.forEach((stmt) => {
      // 通常のlet/const変数（signal/関数以外）を抽出
      if (
        stmt.type === "VariableDeclaration"
        && ["let", "const"].includes(stmt.kind)
        && stmt.declarations.length === 1
        && stmt.declarations[0].id.type === "Identifier"
        && stmt.declarations[0].init
        && stmt.declarations[0].init.type !== "ArrowFunctionExpression"
        && stmt.declarations[0].init.type !== "FunctionExpression"
        && !(stmt.declarations[0].init.type === "CallExpression" && stmt.declarations[0].init.callee.type === "Identifier" && stmt.declarations[0].init.callee.name === "signal")
      ) {
        renderVars.push(stmt.declarations[0]);
        renderVarNames.push(stmt.declarations[0].id.name);
        return; // 追加しない
      }
      // ...existing code...
      if (
        stmt.type === "VariableDeclaration"
        && stmt.declarations[0].id.type === "Identifier"
        && stmt.declarations[0].init
        && (stmt.declarations[0].init.type === "ArrowFunctionExpression" || stmt.declarations[0].init.type === "FunctionExpression")
      ) {
        handlerMap[stmt.declarations[0].id.name] = stmt.declarations[0].init;
      }
      if (
        stmt.type === "VariableDeclaration"
        && stmt.declarations[0].init
        && stmt.declarations[0].init.type === "CallExpression"
        && stmt.declarations[0].init.callee.type === "Identifier"
        && stmt.declarations[0].init.callee.name === "signal"
      ) {
        const arrPat = stmt.declarations[0].id;
        if (arrPat.type === "ArrayPattern") {
          const name = arrPat.elements[0];
          const setter = arrPat.elements[1];
          const arg0 = stmt.declarations[0].init.arguments[0];
          if (name && name.type === "Identifier" && setter && setter.type === "Identifier" && arg0 && arg0.type !== "SpreadElement" && arg0.type !== "ArgumentPlaceholder") {
            signals.push({ name: name.name, setter: setter.name, init: arg0 });
          }
        }
      }
      if (
        stmt.type === "ExpressionStatement"
        && stmt.expression.type === "CallExpression"
        && stmt.expression.callee.type === "Identifier"
        && stmt.expression.callee.name === "constructor"
      ) {
        const cb = stmt.expression.arguments[0];
        if (cb && (cb.type === "ArrowFunctionExpression" || cb.type === "FunctionExpression")) {
          constructorBody = cb.body.type === "BlockStatement" ? cb.body : babelTypes.blockStatement([babelTypes.expressionStatement(cb.body)]);
        }
      }
      if (stmt.type === "ReturnStatement" && stmt.argument && (stmt.argument.type === "JSXElement" || stmt.argument.type === "JSXFragment")) {
        _jsxReturn = stmt.argument;
      }
      // 通常の文は残す
      filteredBody.push(stmt);
    });
    // --- 追加: 変数参照をthis.に置換するユーティリティ ---
    function replaceVarToThis<T extends t.Node>(node: T): T {
      function walk(n: any, parent: any = null): any {
        if (!n || typeof n !== "object")
          return n;
        // Identifierをthis.参照に置換
        if (
          n.type === "Identifier"
          && renderVarNames.includes(n.name)
          // すでにthis.参照や宣言部ではない
          && !(parent && parent.type === "MemberExpression" && parent.object === n)
          && !(parent && parent.type === "VariableDeclarator" && parent.id === n)
        ) {
          return babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(n.name));
        }
        // 再帰的に子ノードをwalk
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
      return walk(babelTypes.cloneNode(node, /* deep */true));
    }
    // --- 置換適用 ---
    if (constructorBody) {
      constructorBody = replaceVarToThis(constructorBody);
    }
    if (_jsxReturn) {
      _jsxReturn = replaceVarToThis(_jsxReturn);
    }
    // 通常変数宣言をclassPropertyとして追加
    const renderVarProps = renderVars.map(vd =>
      babelTypes.classProperty(
        babelTypes.identifier((vd.id as t.Identifier).name),
        vd.init || null,
        undefined,
        undefined,
        false,
      ),
    );
    if (constructorBody && (constructorBody as t.BlockStatement).body) {
      const first = (constructorBody as t.BlockStatement).body[0];
      const isSuper = first && first.type === "ExpressionStatement" && first.expression.type === "CallExpression" && first.expression.callee.type === "Super";
      if (!isSuper) {
        (constructorBody as t.BlockStatement).body.unshift(
          babelTypes.expressionStatement(babelTypes.callExpression(babelTypes.super(), [])),
        );
      }
      constructorBody = replaceSignalCalls(constructorBody, signals) as t.BlockStatement;
    }
    else {
      constructorBody = babelTypes.blockStatement([
        babelTypes.expressionStatement(babelTypes.callExpression(babelTypes.super(), [])),
      ]);
    }
    observedAttributes = ["name"];
    const eventIdx = { current: 0 };
    const eventBindings: EventBinding[] = [];
    if (_jsxReturn)
      extractEventHandlersAndMark(_jsxReturn, eventBindings, eventIdx);
    const uniqueEventBindings = Array.from(new Map(eventBindings.map(e => [`${e.selector}|${e.event}|${e.handler}`, e])).values());
    const classBody: t.ClassBody = babelTypes.classBody([
      ...signals.map(sig =>
        babelTypes.classPrivateProperty(
          babelTypes.privateName(babelTypes.identifier(sig.name)),
          babelTypes.callExpression(babelTypes.identifier("signal"), [sig.init]),
        ),
      ),
      ...renderVarProps,
      babelTypes.classProperty(
        babelTypes.identifier("observedAttributes"),
        babelTypes.arrayExpression(observedAttributes.map(attr => babelTypes.stringLiteral(attr))),
        undefined,
        undefined,
        false,
        true,
      ),
      babelTypes.classMethod(
        "constructor",
        babelTypes.identifier("constructor"),
        [],
        constructorBody || babelTypes.blockStatement([
          babelTypes.expressionStatement(babelTypes.callExpression(babelTypes.super(), [])),
        ]),
      ),
      // connectedCallback: shadowRoot生成・初回描画・effect設定
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("connectedCallback"),
        [],
        babelTypes.blockStatement([
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
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_patchDom")),
              [babelTypes.callExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_renderHtml")), [])],
            ),
          ),
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.identifier("effect"),
              [babelTypes.arrowFunctionExpression(
                [],
                babelTypes.blockStatement([
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
      ),
      // attributeChangedCallback: _patchDom呼び出し
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("attributeChangedCallback"),
        [],
        babelTypes.blockStatement([
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_patchDom")),
              [babelTypes.callExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_renderHtml")), [])],
            ),
          ),
        ]),
      ),
      // _patchDom: 指定の差分パッチロジック
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("_patchDom"),
        [babelTypes.identifier("newHtml")],
        babelTypes.blockStatement([
          // if (!this.shadowRoot) return;
          babelTypes.ifStatement(
            babelTypes.unaryExpression("!", babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot"))),
            babelTypes.blockStatement([babelTypes.returnStatement()]),
          ),
          // 初回のみ全置換
          babelTypes.ifStatement(
            babelTypes.binaryExpression(
              "===",
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_prevHtml")),
              babelTypes.stringLiteral(""),
            ),
            babelTypes.blockStatement([
              babelTypes.expressionStatement(
                babelTypes.assignmentExpression(
                  "=",
                  babelTypes.memberExpression(babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot")), babelTypes.identifier("innerHTML")),
                  babelTypes.identifier("newHtml"),
                ),
              ),
              babelTypes.expressionStatement(
                babelTypes.callExpression(
                  babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_attachEvents")),
                  [],
                ),
              ),
              babelTypes.expressionStatement(
                babelTypes.assignmentExpression(
                  "=",
                  babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_prevHtml")),
                  babelTypes.identifier("newHtml"),
                ),
              ),
              babelTypes.returnStatement(),
            ]),
          ),
          // if (this._prevHtml === newHtml) return;
          babelTypes.ifStatement(
            babelTypes.binaryExpression(
              "===",
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_prevHtml")),
              babelTypes.identifier("newHtml"),
            ),
            babelTypes.blockStatement([babelTypes.returnStatement()]),
          ),
          // const prev = document.createElement("div"); prev.innerHTML = this._prevHtml;
          babelTypes.variableDeclaration("const", [
            babelTypes.variableDeclarator(
              babelTypes.identifier("prev"),
              babelTypes.callExpression(
                babelTypes.memberExpression(babelTypes.identifier("document"), babelTypes.identifier("createElement")),
                [babelTypes.stringLiteral("div")],
              ),
            ),
          ]),
          babelTypes.expressionStatement(
            babelTypes.assignmentExpression(
              "=",
              babelTypes.memberExpression(babelTypes.identifier("prev"), babelTypes.identifier("innerHTML")),
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_prevHtml")),
            ),
          ),
          // const next = document.createElement("div"); next.innerHTML = newHtml;
          babelTypes.variableDeclaration("const", [
            babelTypes.variableDeclarator(
              babelTypes.identifier("next"),
              babelTypes.callExpression(
                babelTypes.memberExpression(babelTypes.identifier("document"), babelTypes.identifier("createElement")),
                [babelTypes.stringLiteral("div")],
              ),
            ),
          ]),
          babelTypes.expressionStatement(
            babelTypes.assignmentExpression(
              "=",
              babelTypes.memberExpression(babelTypes.identifier("next"), babelTypes.identifier("innerHTML")),
              babelTypes.identifier("newHtml"),
            ),
          ),
          // const prevNodes = Array.from(prev.childNodes);
          babelTypes.variableDeclaration("const", [
            babelTypes.variableDeclarator(
              babelTypes.identifier("prevNodes"),
              babelTypes.callExpression(
                babelTypes.memberExpression(babelTypes.identifier("Array"), babelTypes.identifier("from")),
                [babelTypes.memberExpression(babelTypes.identifier("prev"), babelTypes.identifier("childNodes"))],
              ),
            ),
          ]),
          // const nextNodes = Array.from(next.childNodes);
          babelTypes.variableDeclaration("const", [
            babelTypes.variableDeclarator(
              babelTypes.identifier("nextNodes"),
              babelTypes.callExpression(
                babelTypes.memberExpression(babelTypes.identifier("Array"), babelTypes.identifier("from")),
                [babelTypes.memberExpression(babelTypes.identifier("next"), babelTypes.identifier("childNodes"))],
              ),
            ),
          ]),
          // const root = this.shadowRoot;
          babelTypes.variableDeclaration("const", [
            babelTypes.variableDeclarator(
              babelTypes.identifier("root"),
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot")),
            ),
          ]),
          // if (prevNodes.length !== nextNodes.length) { root.innerHTML = newHtml; ... }
          babelTypes.ifStatement(
            babelTypes.binaryExpression(
              "!==",
              babelTypes.memberExpression(babelTypes.identifier("prevNodes"), babelTypes.identifier("length")),
              babelTypes.memberExpression(babelTypes.identifier("nextNodes"), babelTypes.identifier("length")),
            ),
            babelTypes.blockStatement([
              babelTypes.expressionStatement(
                babelTypes.assignmentExpression(
                  "=",
                  babelTypes.memberExpression(babelTypes.identifier("root"), babelTypes.identifier("innerHTML")),
                  babelTypes.identifier("newHtml"),
                ),
              ),
              babelTypes.expressionStatement(
                babelTypes.callExpression(
                  babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_attachEvents")),
                  [],
                ),
              ),
              babelTypes.expressionStatement(
                babelTypes.assignmentExpression(
                  "=",
                  babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_prevHtml")),
                  babelTypes.identifier("newHtml"),
                ),
              ),
              babelTypes.returnStatement(),
            ]),
          ),
          // prevNodes.forEach((node, i) => { ... })
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.identifier("prevNodes"), babelTypes.identifier("forEach")),
              [babelTypes.arrowFunctionExpression([
                babelTypes.identifier("node"),
                babelTypes.identifier("i"),
              ], babelTypes.blockStatement([
                // if (!root.childNodes[i]) return;
                babelTypes.ifStatement(
                  babelTypes.unaryExpression("!", babelTypes.memberExpression(
                    babelTypes.memberExpression(babelTypes.identifier("root"), babelTypes.identifier("childNodes")),
                    babelTypes.identifier("i"),
                    true,
                  )),
                  babelTypes.blockStatement([babelTypes.returnStatement()]),
                ),
                // if (node.isEqualNode(nextNode)) return;
                babelTypes.ifStatement(
                  babelTypes.callExpression(
                    babelTypes.memberExpression(
                      babelTypes.identifier("node"),
                      babelTypes.identifier("isEqualNode"),
                    ),
                    [
                      babelTypes.memberExpression(babelTypes.identifier("nextNodes"), babelTypes.identifier("i"), true),
                    ],
                  ),
                  babelTypes.blockStatement([babelTypes.returnStatement()]),
                ),
                // root.replaceChild(nextNode.cloneNode(true), root.childNodes[i]);
                babelTypes.expressionStatement(
                  babelTypes.callExpression(
                    babelTypes.memberExpression(
                      babelTypes.identifier("root"),
                      babelTypes.identifier("replaceChild"),
                    ),
                    [
                      babelTypes.callExpression(
                        babelTypes.memberExpression(
                          babelTypes.memberExpression(babelTypes.identifier("nextNodes"), babelTypes.identifier("i"), true),
                          babelTypes.identifier("cloneNode"),
                        ),
                        [babelTypes.booleanLiteral(true)],
                      ),
                      babelTypes.memberExpression(
                        babelTypes.memberExpression(babelTypes.identifier("root"), babelTypes.identifier("childNodes")),
                        babelTypes.identifier("i"),
                        true,
                      ),
                    ],
                  ),
                ),
              ]))],
            ),
          ),
          // イベント再バインド
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_attachEvents")),
              [],
            ),
          ),
          // _prevHtml更新
          babelTypes.expressionStatement(
            babelTypes.assignmentExpression(
              "=",
              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("_prevHtml")),
              babelTypes.identifier("newHtml"),
            ),
          ),
        ]),
      ),
      uniqueEventBindings.length > 0
        ? babelTypes.classMethod(
            "method",
            babelTypes.identifier("_attachEvents"),
            [],
            babelTypes.blockStatement([
              ...uniqueEventBindings.map((binding: any) =>
                babelTypes.blockStatement([
                  babelTypes.variableDeclaration("const", [
                    babelTypes.variableDeclarator(
                      babelTypes.identifier("elList"),
                      babelTypes.callExpression(
                        babelTypes.memberExpression(
                          babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot")),
                          babelTypes.identifier("querySelectorAll"),
                        ),
                        [babelTypes.stringLiteral(binding.selector)],
                      ),
                    ),
                  ]),
                  babelTypes.expressionStatement(
                    babelTypes.callExpression(
                      babelTypes.memberExpression(
                        babelTypes.identifier("elList"),
                        babelTypes.identifier("forEach"),
                      ),
                      [babelTypes.arrowFunctionExpression([
                        babelTypes.identifier("el"),
                      ], babelTypes.blockStatement([
                        babelTypes.expressionStatement(
                          babelTypes.callExpression(
                            babelTypes.memberExpression(
                              babelTypes.identifier("el"),
                              babelTypes.identifier("removeEventListener"),
                            ),
                            [
                              babelTypes.stringLiteral(binding.event),
                              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(`_on${capitalize(binding.handler)}`)),
                            ],
                          ),
                        ),
                        babelTypes.expressionStatement(
                          babelTypes.callExpression(
                            babelTypes.memberExpression(
                              babelTypes.identifier("el"),
                              babelTypes.identifier("addEventListener"),
                            ),
                            [
                              babelTypes.stringLiteral(binding.event),
                              babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier(`_on${capitalize(binding.handler)}`)),
                            ],
                          ),
                        ),
                      ]))],
                    ),
                  ),
                ]),
              ),
            ].flat()),
          )
        : babelTypes.classMethod(
            "method",
            babelTypes.identifier("_attachEvents"),
            [],
            babelTypes.blockStatement([]),
          ),
      ...uniqueEventBindings.map((binding: any) =>
        babelTypes.classProperty(
          babelTypes.identifier(`_on${capitalize(binding.handler)}`),
          handlerMap[binding.handler]
            ? babelTypes.arrowFunctionExpression(
                handlerMap[binding.handler].params,
                replaceSignalCalls(handlerMap[binding.handler].body, signals),
              )
            : babelTypes.arrowFunctionExpression([], babelTypes.blockStatement([])),
          undefined,
          undefined,
          false,
        ),
      ),
      babelTypes.classProperty(
        babelTypes.identifier("_prevHtml"),
        babelTypes.stringLiteral(""),
      ),
      _jsxReturn
        ? babelTypes.classMethod(
            "method",
            babelTypes.identifier("_renderHtml"),
            [],
            babelTypes.blockStatement([
              babelTypes.returnStatement(jsxToHtmlAst(_jsxReturn, signals)),
            ]),
          )
        : babelTypes.classMethod(
            "method",
            babelTypes.identifier("_renderHtml"),
            [],
            babelTypes.blockStatement([
              babelTypes.returnStatement(babelTypes.stringLiteral("<div>JSX変換未実装</div>")),
            ]),
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
