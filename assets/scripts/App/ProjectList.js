import { ProjectItem } from "./ProjectItem.js";
import {
  moveElement,
  DOMHelper,
  clearEventListeners,
} from "../Utility/DOMHelper.js";

export class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;

    const projectItems = document.querySelectorAll(`#${type}-projects li`);
    for (const item of projectItems) {
      this.projects.push(
        new ProjectItem(item.id, this.switchProject.bind(this), this.type)
      );
    }
    this.connectDroppable();
  }

  connectDroppable() {
    const list = document.querySelector(`#${this.type}-projects ul`);
    // Must have drag enter and drag over so that drop can be trigger
    list.addEventListener("dragenter", (event) => {
      event.preventDefault();
      list.parentElement.classList.add("dragging");
    });
    list.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    list.addEventListener("dragleave", (event) => {
      // Problem is because listener trigger even when we are above child element so it leaves the list here when we enter child item
      // Solution: only remove class if we left into non-child item
      // Use event related target
      if (event.relatedTarget.closest(`#${this.type}-projects ul`) !== list) {
        list.parentElement.classList.remove("dragging");
      }
    });
    list.addEventListener("drop", (event) => {
      const projectId = event.dataTransfer.getData("text/plain");
      if (this.projects.find((p) => p.id === projectId)) {
        return;
      }
      list.parentElement.classList.remove("dragging");
      document
        .getElementById(projectId)
        .querySelector("button:last-of-type")
        .click();
    });
  }

  // this is for app init
  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }

  addProject(project) {
    this.projects.push(project);
    DOMHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }
  // this is for project item
  switchProject(projectId) {
    this.switchHandler(this.projects.find((p) => p.id === projectId));
    this.projects = this.projects.filter((p) => p.id !== projectId);
  }
}
