export class RenderPage {
  element?: string | HTMLElement;
  afterRender?: () => void;
  state: Record<string, any> = {};

  setState(newState: Record<string, any>) {
    this.state = { ...this.state, ...newState };
  }

  render() {
    (window as any).befforeUnMount?.();

    (window as any).befforeUnMount = undefined;

    const app = document.querySelector("#app");

    if (app && this.element) {
      app.innerHTML = "";

      if (typeof this.element === "string") app.innerHTML = this.element;
      else if (typeof this.element === "object") app.appendChild(this.element);

      this.afterRender?.();
    }
  }
}
