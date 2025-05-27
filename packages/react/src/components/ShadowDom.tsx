"use client";

import type { ChatoraWrapper } from "@/components/ChatoraWrapper";
import type { FunctionalCustomElementOptions } from "chatora";
import type { ComponentProps, FC, useId } from "react";
import { functionalCustomElement } from "chatora";
import { Fragment, useLayoutEffect } from "react";
import { createRoot } from "react-dom/client";
import { jsx } from "react/jsx-runtime";

type Props = ComponentProps<typeof ChatoraWrapper> & {
  id: ReturnType<typeof useId>;
} & FunctionalCustomElementOptions;

export const ShadowDom: FC<Props> = ({ tag, component, children, id, ...option }) => {
  const defineElement = () => {
    if (!customElements || customElements.get(tag)) {
      return;
    }

    const element = functionalCustomElement(
      component,
      option,
    );

    customElements.define(tag, element);
  };

  useLayoutEffect(() => {
    const handleContainer = async () => {
      document.querySelectorAll(`tora-container[id="${id}"]`).forEach(async (el) => {
        // children を DOM に追加
        if (children) {
          // React の children を DOM に追加するためのラッパー要素
          const tempContainer = document.createElement("div");

          // React要素をレンダリングしてHTMLに変換
          const reactElement = jsx(Fragment, { children });

          const root = createRoot(tempContainer);
          root.render(reactElement);

          // レンダリング完了を待つために少し待機
          // MicrotaskQueueを使用することでよりクリーンな実装に
          await new Promise(resolve => setTimeout(resolve, 0));

          // tempContainerの中身を取り出して兄弟要素として追加
          while (tempContainer.firstChild) {
            // tora-containerの後ろに兄弟要素として追加
            el.after(tempContainer.firstChild);
          }

          // tora-container要素を削除
          el.remove();
        }
        else {
          // childrenがない場合はtora-container要素をそのまま削除
          el.remove();
        }
      });
    };

    handleContainer();
    defineElement();
  }, [tag, id, children]);

  return null;
};
