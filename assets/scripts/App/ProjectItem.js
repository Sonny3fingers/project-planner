import { DOMHelper } from "../Utility/DOMHelper.js";
// import { Tooltip } from "./Tooltip.js";

console.log("Project Item Created!");

export class ProjectItem {
  constructor(id, updateProjectListsFunction, type) {
    this.id = id;
    this.updateProjectListsFunctionHandler = updateProjectListsFunction;
    this.connectMoreInfoBtn();
    this.connectSwitchBtn(type);
    this.connectDrag();
  }

  hasActiveTooltip = false;

  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }
    const projectElement = document.getElementById(this.id);
    const tooltipText = projectElement.dataset.extraInfo;
    import("./Tooltip.js").then((module) => {
      const tooltip = new module.Tooltip(
        () => {
          this.hasActiveTooltip = false;
        },
        tooltipText,
        this.id
      );
      tooltip.show();
      this.hasActiveTooltip = true;
    });
  }

  connectDrag() {
    const projectItemElement = document.getElementById(this.id);
    projectItemElement.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", this.id);
    });
  }

  connectMoreInfoBtn() {
    const projectItemElement = document.getElementById(this.id);
    let moreInfoBtn = projectItemElement.querySelector("button:first-of-type");
    moreInfoBtn.addEventListener("click", this.showMoreInfoHandler.bind(this));
  }

  connectSwitchBtn(type) {
    const projectItemElement = document.getElementById(this.id);
    let switchedBtn = projectItemElement.querySelector("button:last-of-type");
    switchedBtn = DOMHelper.clearEventListeners(switchedBtn);
    switchedBtn.textContent = type === "active" ? "Finished" : "Activate";
    switchedBtn.addEventListener(
      "click",
      this.updateProjectListsFunctionHandler.bind(null, this.id)
    );
  }

  update(updateProjectListsFunction, type) {
    this.updateProjectListsFunctionHandler = updateProjectListsFunction;
    this.connectSwitchBtn(type);
  }
}
