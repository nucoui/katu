import type * as t from "@babel/types";
import type { EventBinding, SignalInfo } from "./types";
import * as babelTypes from "@babel/types";
import { extractEventHandlersAndMark } from "./extractEventHandlers.js";
import { jsxToHtmlAst } from "./jsxToHtmlAst.js";
import { replaceSignalCalls } from "./replaceSignalCalls.js";

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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
    // --- 追加: _renderHtmlで参照されるsignal getterを抽出する ---
    /**
     * _renderHtmlのASTからthis.#xxx[0]()形式のsignal getter呼び出しを全て抽出する
     * @param node ASTノード
     * @returns signal getter呼び出し式の配列
     */
    function extractSignalGetters(node: t.Node): t.Expression[] {
      const getters: t.Expression[] = [];
      const seen = new Set<string>();
      function astToKey(n: t.CallExpression): string {
        // 例: this.#clickCount[0]() → 'this.#clickCount[0]()'
        if (
          n.callee.type === "MemberExpression"
          && n.callee.object.type === "MemberExpression"
          && n.callee.object.object.type === "ThisExpression"
          && n.callee.object.property.type === "PrivateName"
          && n.callee.object.property.id.type === "Identifier"
          && n.callee.property.type === "NumericLiteral"
        ) {
          return `this.#${n.callee.object.property.id.name}[${n.callee.property.value}]()`;
        }
        return JSON.stringify(n);
      }
      function walk(n: any) {
        if (!n || typeof n !== "object")
          return;
        if (
          n.type === "CallExpression"
          && n.callee.type === "MemberExpression"
          && n.callee.object.type === "MemberExpression"
          && n.callee.object.object.type === "ThisExpression"
          && n.callee.object.property.type === "PrivateName"
          && n.callee.object.property.id.type === "Identifier"
          && n.callee.property.type === "NumericLiteral"
          && n.callee.property.value === 0
          && n.arguments.length === 0
        ) {
          const key = astToKey(n);
          if (!seen.has(key)) {
            seen.add(key);
            getters.push(n);
          }
        }
        for (const key in n) {
          if (Array.isArray(n[key])) {
            n[key].forEach(walk);
          }
          else if (n[key] && typeof n[key] === "object" && n[key].type) {
            walk(n[key]);
          }
        }
      }
      walk(node);
      return getters;
    }
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
    const signals: SignalInfo[] = [];
    let constructorBody: t.BlockStatement | null = null;
    let _jsxReturn: t.JSXElement | t.JSXFragment | null = null;
    let observedAttributes: string[] = [];
    const handlerMap: Record<string, t.FunctionExpression | t.ArrowFunctionExpression> = {};
    const renderVars: t.VariableDeclarator[] = [];
    const filteredBody: t.Statement[] = [];
    const renderVarNames: string[] = [];
    if (fn && (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") && fn.body.type === "BlockStatement") {
      (fn.body.body as t.Statement[]).forEach((stmt: t.Statement) => {
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
          return;
        }
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
          _jsxReturn = replaceVarToThis(stmt.argument);
        }
        filteredBody.push(stmt);
      });
    }
    // 変数参照をthis.に置換するユーティリティ
    function replaceVarToThis<T extends t.Node>(node: T): T {
      function walk(n: any, parent: any = null): any {
        if (!n || typeof n !== "object")
          return n;
        if (
          n.type === "Identifier"
          && renderVarNames.includes(n.name)
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

    /**
     * BlockStatement内のノードを再帰的に変換するユーティリティ
     * Utility to recursively transform nodes in a BlockStatement
     * @param statements BlockStatementのbody配列
     * @returns 変換後のStatement配列
     */
    function transformBlockStatements(statements: t.Statement[]): t.Statement[] {
      return statements.map((stmt) => {
        if (stmt.type === "IfStatement") {
          // 条件式もthis変換
          const test = replaceVarToThis(stmt.test);
          const consequent = stmt.consequent.type === "BlockStatement"
            ? babelTypes.blockStatement(transformBlockStatements(stmt.consequent.body))
            : replaceVarToThis(stmt.consequent);
          const alternate = stmt.alternate
            ? (stmt.alternate.type === "BlockStatement"
                ? babelTypes.blockStatement(transformBlockStatements(stmt.alternate.body))
                : stmt.alternate.type
                  ? transformBlockStatements([stmt.alternate])[0]
                  : null)
            : null;
          return babelTypes.ifStatement(test, consequent, alternate || null);
        }
        if (stmt.type === "ReturnStatement" && stmt.argument) {
          if (stmt.argument.type === "JSXElement" || stmt.argument.type === "JSXFragment") {
            return babelTypes.returnStatement(
              jsxToHtmlAst(replaceVarToThis(stmt.argument), signals),
            );
          }
          else {
            // return式もthis変換
            return babelTypes.returnStatement(replaceVarToThis(stmt.argument));
          }
        }
        // その他の文もthis変換
        return replaceVarToThis(stmt);
      });
    }

    // renderコールバックのBlockStatement全体を_renderHtmlのbodyに移植し、return JSX/JSXFragmentのみHTML変換
    let _renderHtmlBody: t.BlockStatement | null = null;
    if (fn && (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") && fn.body.type === "BlockStatement") {
      // BlockStatement内のrender呼び出しを探す
      const renderCall = fn.body.body.find(
        (stmt): stmt is t.ExpressionStatement & { expression: t.CallExpression } => stmt.type === "ExpressionStatement"
          && stmt.expression.type === "CallExpression"
          && stmt.expression.callee.type === "Identifier"
          && stmt.expression.callee.name === "render"
          && stmt.expression.arguments.length > 0,
      );
      if (renderCall) {
        const cb = renderCall.expression.arguments[0];
        if ((cb.type === "ArrowFunctionExpression" || cb.type === "FunctionExpression") && cb.body.type === "BlockStatement") {
          _renderHtmlBody = babelTypes.blockStatement(transformBlockStatements(cb.body.body));
        }
        else if ((cb.type === "ArrowFunctionExpression" || cb.type === "FunctionExpression") && (cb.body.type === "JSXElement" || cb.body.type === "JSXFragment")) {
          _renderHtmlBody = babelTypes.blockStatement([
            babelTypes.returnStatement(jsxToHtmlAst(replaceVarToThis(cb.body), signals)),
          ]);
        }
      }
    }
    else if (fn && (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") && (fn.body.type === "JSXElement" || fn.body.type === "JSXFragment")) {
      _renderHtmlBody = babelTypes.blockStatement([
        babelTypes.returnStatement(jsxToHtmlAst(replaceVarToThis(fn.body), signals)),
      ]);
    }

    if (constructorBody) {
      constructorBody = replaceVarToThis(constructorBody);
    }
    if (_jsxReturn) {
      _jsxReturn = replaceVarToThis(_jsxReturn);
    }
    const renderVarProps = renderVars.map(vd =>
      babelTypes.classProperty(
        babelTypes.identifier((vd.id as t.Identifier).name),
        vd.init || null,
        undefined,
        undefined,
        false,
      ),
    );
    // handlerMapに登録された関数をクラスのメンバとして追加
    const handlerProps = Object.entries(handlerMap).map(([name, fn]) =>
      babelTypes.classProperty(
        babelTypes.identifier(name),
        // signal参照やsetterもthis.#xxx[0]()/[1]()に変換
        (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression")
          ? babelTypes.arrowFunctionExpression(
              fn.params,
              replaceSignalCalls(replaceVarToThis(fn.body), signals),
            )
          : fn,
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
    // effect依存に全signal getterを参照させる
    // signalGetterExprsはconnectedCallback生成直前で定義
    let signalGetterExprs: t.Expression[] = [];
    if (_renderHtmlBody) {
      signalGetterExprs = extractSignalGetters(_renderHtmlBody);
    }
    const classBody: t.ClassBody = babelTypes.classBody([
      ...signals.map(sig =>
        babelTypes.classPrivateProperty(
          babelTypes.privateName(babelTypes.identifier(sig.name)),
          babelTypes.callExpression(babelTypes.identifier("signal"), [sig.init]),
        ),
      ),
      ...renderVarProps,
      ...handlerProps,
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
          // effect: 依存signal getterを全て参照する
          babelTypes.expressionStatement(
            babelTypes.callExpression(
              babelTypes.identifier("effect"),
              [babelTypes.arrowFunctionExpression(
                [],
                babelTypes.blockStatement([
                  // 依存getter参照
                  ...signalGetterExprs.map((expr: t.Expression) => babelTypes.expressionStatement(expr)),
                  // 本来のパッチ処理
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
      // _patchDom: Node/Node[]ベースの差し替えロジック
      babelTypes.classMethod(
        "method",
        babelTypes.identifier("_patchDom"),
        [babelTypes.identifier("newDom")],
        babelTypes.blockStatement([
          babelTypes.ifStatement(
            babelTypes.unaryExpression("!", babelTypes.memberExpression(babelTypes.thisExpression(), babelTypes.identifier("shadowRoot"))),
            babelTypes.blockStatement([babelTypes.returnStatement()]),
          ),
          // newDomが配列でなければ配列化し、stringならTextノード化
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
        ]),
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
      _renderHtmlBody
        ? babelTypes.classMethod(
            "method",
            babelTypes.identifier("_renderHtml"),
            [],
            _renderHtmlBody,
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
