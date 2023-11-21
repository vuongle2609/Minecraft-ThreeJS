export class RenderPage {
  element?: string | HTMLElement;
  afterRender?: () => void;

  render() {
    const app = document.querySelector("#app");

    if (app && this.element) {
      app.innerHTML = "";

      if (typeof this.element === "string") app.innerHTML = this.element;
      else if (typeof this.element === "object") app.appendChild(this.element);

      this.afterRender?.();
    }
  }
}
