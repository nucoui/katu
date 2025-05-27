import { render } from "@testing-library/react";
import { functionalDeclarativeCustomElement } from "chatora";
import { describe, expect, it, vi } from "vitest";
import { DeclarativeShadowDom } from "../src/components/DeclarativeShadowDom";
import { hastToJsx } from "../src/utils/hastToJsx";

// モック
vi.mock("chatora", async () => ({
  functionalDeclarativeCustomElement: vi.fn(() => "mocked-hast"),
}));
vi.mock("@/utils/hastToJsx", async () => ({
  hastToJsx: vi.fn(() => <div data-testid="hast-jsx" />),
}));

const mockComponent = {} as any;
const mockId = "test-id";

describe("declarativeShadowDom", () => {
  it("should call functionalDeclarativeCustomElement and hastToJsx with correct arguments", () => {
    const tag = "mock-tag";
    const children = <span>child</span>;
    const option = { foo: "bar" };

    render(
      <DeclarativeShadowDom
        tag={tag}
        id={mockId}
        component={mockComponent}
        {...option}
      >
        {children}
      </DeclarativeShadowDom>,
    );

    expect(vi.mocked(functionalDeclarativeCustomElement)).toHaveBeenCalledWith(
      mockComponent,
      option,
    );
    expect(vi.mocked(hastToJsx)).toHaveBeenCalledWith(
      tag,
      mockId,
      "mocked-hast",
      children,
    );
  });

  it("should render the result of hastToJsx", () => {
    const { getByTestId } = render(
      <DeclarativeShadowDom
        tag="mock-tag"
        id={mockId}
        component={mockComponent}
      />,
    );
    expect(getByTestId("hast-jsx")).toBeTruthy();
  });
});
