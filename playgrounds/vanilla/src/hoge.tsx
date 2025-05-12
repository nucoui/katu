import { effect } from "/@fs/Users/kanekotakuma/dev/web-component/katu/packages/reactivity/dist/main.mjs";
import "/src/main.css";
import { signal } from "/@fs/Users/kanekotakuma/dev/web-component/katu/packages/reactivity/dist/main.mjs";
class App extends HTMLElement {
  #time = signal(0);
  #clickCount = signal(0);
  a = "hoge";
  props = {};
  static get observedAttributes() {
    return ["name"];
  }
  static getPropsFromAttributes(el) {
    const props = {};
    if (!el.attributes) {
      return props;
    }
    for (let i = 0; i < el.attributes.length; i++) {
      const attr = el.attributes[i];
      props[this.constructor(attrNameToPropName, attr.name)] = attr.value;
    }
    return props;
  }
  static attrNameToPropName(attr) {
    return attr.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  }
  constructor() {
    super();
    setInterval(() => {
      this.#time[1](t => t + 1);
    }, 1e3);
    this.#clickCount[1](0);
  }
  connectedCallback() {
    this.props = this.constructor.getPropsFromAttributes(this);
    if (!this.shadowRoot) {
      this.attachShadow({
        mode: "open"
      });
    }
    this._patchDom(this._renderHtml());
    effect(() => {
      this._patchDom(this._renderHtml());
    });
  }
  attributeChangedCallback(name, oldValue, newValue) {
    this.props = this.constructor.getPropsFromAttributes(this);
    this._patchDom(this._renderHtml());
  }
  _patchDom(newHtml) {
    if (!this.shadowRoot) {
      return;
    }
    if (this._prevHtml === "") {
      this.shadowRoot.innerHTML = newHtml;
      this._attachEvents();
      this._prevHtml = newHtml;
      return;
    }
    if (this._prevHtml === newHtml) {
      return;
    }
    const prev = document.createElement("div");
    prev.innerHTML = this._prevHtml;
    const next = document.createElement("div");
    next.innerHTML = newHtml;
    const prevNodes = Array.from(prev.childNodes);
    const nextNodes = Array.from(next.childNodes);
    const root = this.shadowRoot;
    if (prevNodes.length !== nextNodes.length) {
      root.innerHTML = newHtml;
      this._attachEvents();
      this._prevHtml = newHtml;
      return;
    }
    prevNodes.forEach((node, i) => {
      if (!root.childNodes[i]) {
        return;
      }
      if (node.isEqualNode(nextNodes[i])) {
        return;
      }
      root.replaceChild(nextNodes[i].cloneNode(true), root.childNodes[i]);
    });
    this._attachEvents();
    this._prevHtml = newHtml;
  }
  _attachEvents() {
    {
      const elList = this.shadowRoot.querySelectorAll("[data-katu-evt=\"click-0\"]");
      elList.forEach(el => {
        el.removeEventListener("click", this._onHandleClick);
        el.addEventListener("click", this._onHandleClick);
      });
    }
    {
      const elList = this.shadowRoot.querySelectorAll("[data-katu-evt=\"click-1\"]");
      elList.forEach(el => {
        el.removeEventListener("click", this._onHandleClick2);
        el.addEventListener("click", this._onHandleClick2);
      });
    }
    {
      const elList = this.shadowRoot.querySelectorAll("[data-katu-evt=\"click-2\"]");
      elList.forEach(el => {
        el.removeEventListener("click", this._onHandleClick3);
        el.addEventListener("click", this._onHandleClick3);
      });
    }
  }
  _onHandleClick = () => {
    this.#clickCount[1](count => count + 1);
  };
  _onHandleClick2 = () => {
    this.#clickCount[1](count => count + 2);
  };
  _onHandleClick3 = () => {
    this.#clickCount[1](count => count + 3);
  };
  _prevHtml = "";
  _renderHtml() {
    return ["\n      ", "<h1>" + (["Hello World, ", String(this.a)].join("") + "</h1>"), "\n      ", "<ul>" + ([["foo", "bar", "baz"].map(i => "<li>" + ([String(i)].join("") + "</li>")).join("")].join("") + "</ul>"), "\n      ", "<p>" + (["Count: ", this.#time[0]()].join("") + "</p>"), "\n      ", "", "\n      ", "<button data-katu-evt='click-0'>" + (["Click : ", this.#clickCount[0]()].join("") + "</button>"), "\n      ", "<button data-katu-evt='click-1'>" + (["Click +2 : ", this.#clickCount[0]()].join("") + "</button>"), "\n      ", "<button data-katu-evt='click-2'>" + (["Click +3 : ", this.#clickCount[0]()].join("") + "</button>"), "\n    "].join("");
  }
}
customElements.define("katu-app", App);
const app = document.getElementById("app");
const element = document.createElement("katu-app");
element.setAttribute("name", "name1");
app.appendChild(element);
setTimeout(() => {
  element.setAttribute("name", "name2");
}, 2e3);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1haW4udHN4Il0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBcIi4vbWFpbi5jc3NcIlxuXG5pbXBvcnQgeyBzaWduYWwgfSBmcm9tIFwiQGthdHUvcmVhY3Rpdml0eVwiO1xuXG5jb25zdCBBcHAgPSBkZWZpbmVDdXN0b21FbGVtZW50KCh7IHByb3BzLCBvbkF0dHJpYnV0ZUNoYW5nZWQsIGNvbnN0cnVjdG9yIH0pID0+IHtcbiAgY29uc3QgW3RpbWUsIHNldFRpbWVdID0gc2lnbmFsKDApO1xuICBjb25zdCBbY2xpY2tDb3VudCwgc2V0Q2xpY2tDb3VudF0gPSBzaWduYWwoMCk7XG4gIGNvbnN0IGhhbmRsZUNsaWNrID0gKCkgPT4geyBzZXRDbGlja0NvdW50KChjb3VudCkgPT4gY291bnQgKyAxKTsgfTtcbiAgY29uc3QgaGFuZGxlQ2xpY2syID0gKCkgPT4geyBzZXRDbGlja0NvdW50KChjb3VudCkgPT4gY291bnQgKyAyKTsgfTtcbiAgY29uc3QgaGFuZGxlQ2xpY2szID0gKCkgPT4geyBzZXRDbGlja0NvdW50KChjb3VudCkgPT4gY291bnQgKyAzKTsgfTtcbiAgY29uc3QgYSA9IFwiaG9nZVwiXG5cbiAgY29uc3RydWN0b3IoKCkgPT4ge1xuICAgIHNldEludGVydmFsKCgpID0+IHsgc2V0VGltZSgodCkgPT4gdCArIDEpOyB9LCAxMDAwKTtcbiAgICBzZXRDbGlja0NvdW50KDApO1xuICB9KTtcblxuICByZXR1cm4gKFxuICAgIDw+XG4gICAgICA8aDE+SGVsbG8gV29ybGQsIHthfTwvaDE+XG4gICAgICA8dWw+e1tcImZvb1wiLFwiYmFyXCIsXCJiYXpcIl0ubWFwKGkgPT4gKDxsaT57aX08L2xpPikpfTwvdWw+XG4gICAgICA8cD5Db3VudDoge3RpbWUoKX08L3A+XG4gICAgICB7LyogPHA+e3Byb3BzLm5hbWV9PC9wPiAqL31cbiAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlQ2xpY2t9PkNsaWNrIDoge2NsaWNrQ291bnQoKX08L2J1dHRvbj5cbiAgICAgIDxidXR0b24gb25DbGljaz17aGFuZGxlQ2xpY2syfT5DbGljayArMiA6IHtjbGlja0NvdW50KCl9PC9idXR0b24+XG4gICAgICA8YnV0dG9uIG9uQ2xpY2s9e2hhbmRsZUNsaWNrM30+Q2xpY2sgKzMgOiB7Y2xpY2tDb3VudCgpfTwvYnV0dG9uPlxuICAgIDwvPlxuICApO1xufSwge1xuICBzaGFkb3dSb290OiB0cnVlLFxuICBzaGFkb3dSb290TW9kZTogJ29wZW4nXG59KTtcblxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKFwia2F0dS1hcHBcIiwgQXBwKTtcblxuY29uc3QgYXBwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhcHBcIik7XG5jb25zdCBlbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImthdHUtYXBwXCIpO1xuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIFwibmFtZTFcIik7XG5hcHAhLmFwcGVuZENoaWxkKGVsZW1lbnQpO1xuc2V0VGltZW91dCgoKSA9PiB7XG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKFwibmFtZVwiLCBcIm5hbWUyXCIpO1xufSwgMjAwMCk7Il0sIm1hcHBpbmdzIjoiQUFBQSxPQUFPO0FBRVAsU0FBUyxjQUFjO0FBRXZCLE1BQU0sTUFBTSxvQkFBb0IsQ0FBQyxFQUFFLE9BQU8sb0JBQW9CLFlBQVksTUFBTTtBQUM5RSxRQUFNLENBQUMsTUFBTSxPQUFPLElBQUksT0FBTyxDQUFDO0FBQ2hDLFFBQU0sQ0FBQyxZQUFZLGFBQWEsSUFBSSxPQUFPLENBQUM7QUFDNUMsUUFBTSxjQUFjLE1BQU07QUFBRSxrQkFBYyxDQUFDLFVBQVUsUUFBUSxDQUFDO0FBQUEsRUFBRztBQUNqRSxRQUFNLGVBQWUsTUFBTTtBQUFFLGtCQUFjLENBQUMsVUFBVSxRQUFRLENBQUM7QUFBQSxFQUFHO0FBQ2xFLFFBQU0sZUFBZSxNQUFNO0FBQUUsa0JBQWMsQ0FBQyxVQUFVLFFBQVEsQ0FBQztBQUFBLEVBQUc7QUFDbEUsUUFBTSxJQUFJO0FBRVYsY0FBWSxNQUFNO0FBQ2hCLGdCQUFZLE1BQU07QUFBRSxjQUFRLENBQUMsTUFBTSxJQUFJLENBQUM7QUFBQSxJQUFHLEdBQUcsR0FBSTtBQUNsRCxrQkFBYyxDQUFDO0FBQUEsRUFDakIsQ0FBQztBQUVELFNBQ0UsRUFBRTtBQUFBLE1BQ0EsQ0FBQyxHQUFHLGNBQWMsRUFBRSxFQUFuQixHQUF3QjtBQUFBLE1BQ3pCLENBQUMsSUFBSSxDQUFDLE9BQU0sT0FBTSxLQUFLLEVBQUUsSUFBSSxPQUFNLENBQUMsSUFBSSxFQUFFLEVBQU4sR0FBWSxFQUFFLEVBQWpELEdBQXNEO0FBQUEsTUFDdkQsQ0FBQyxFQUFFLFFBQVEsS0FBSyxFQUFFLEVBQWpCLEVBQXFCO0FBQUE7QUFBQTtBQUFBLEdBQ0s7QUFBQSxNQUMzQixDQUFDLE9BQU8sU0FBUyxhQUFhLFNBQVMsV0FBVyxFQUFFLEVBQW5ELE9BQTREO0FBQUEsTUFDN0QsQ0FBQyxPQUFPLFNBQVMsY0FBYyxZQUFZLFdBQVcsRUFBRSxFQUF2RCxPQUFnRTtBQUFBLE1BQ2pFLENBQUMsT0FBTyxTQUFTLGNBQWMsWUFBWSxXQUFXLEVBQUUsRUFBdkQsT0FBZ0U7QUFBQSxJQUNuRTtBQUVKLEdBQUc7QUFBQSxFQUNELFlBQVk7QUFBQSxFQUNaLGdCQUFnQjtBQUNsQixDQUFDO0FBRUQsZUFBZSxPQUFPLFlBQVksR0FBRztBQUVyQyxNQUFNLE1BQU0sU0FBUyxlQUFlLEtBQUs7QUFDekMsTUFBTSxVQUFVLFNBQVMsY0FBYyxVQUFVO0FBQ2pELFFBQVEsYUFBYSxRQUFRLE9BQU87QUFDcEMsSUFBSyxZQUFZLE9BQU87QUFDeEIsV0FBVyxNQUFNO0FBQ2YsVUFBUSxhQUFhLFFBQVEsT0FBTztBQUN0QyxHQUFHLEdBQUk7IiwibmFtZXMiOltdfQ==