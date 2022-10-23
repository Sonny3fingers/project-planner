export class Tooltip {
  constructor(closeNotifier, tooltipText, hostElementId) {
    this.closeNotifier = closeNotifier;
    this.tooltipText = tooltipText;
    this.hostElementId = hostElementId;
  }

  closeTooltip() {
    this.remove();
    this.closeNotifier();
  }

  remove() {
    this.element.remove();
  }

  show() {
    const tooltipElement = document.createElement("div");
    tooltipElement.className = "card";
    const tooltipTemplateElement = document.getElementById("tooltip");
    const tooltipBody = document.importNode(
      tooltipTemplateElement.content,
      true
    );
    tooltipBody.querySelector("p").textContent = this.tooltipText;
    tooltipElement.append(tooltipBody);
    tooltipElement.addEventListener("click", this.closeTooltip.bind(this));

    const hostElement = document.getElementById(this.hostElementId);
    const hostElPosLeft = hostElement.offsetLeft;
    const hostElPosTop = hostElement.offsetTop;
    const hostElHeight = hostElement.clientHeight;
    const parentElScrolling = hostElement.parentElement.scrollTop;

    const x = hostElPosLeft + 20;
    let y = hostElPosTop + hostElHeight - parentElScrolling - 10;
    console.log(y);

    tooltipElement.style.position = "absolute";
    tooltipElement.style.left = x + "px";
    tooltipElement.style.top = y + "px";

    hostElement.insertAdjacentElement("beforeend", tooltipElement);
    this.element = tooltipElement;
  }
}
