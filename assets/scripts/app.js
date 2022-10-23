class DOMHelper {
  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
    element.scrollIntoView({ behavior: "smooth" });
  }

  static clearEventListeners(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }
}

class Tooltip {
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
    // tooltipElement.textContent = this.tooltipText;
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
    // document.body.append(tooltipElement);
  }
}

class ProjectItem {
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
    const tooltip = new Tooltip(
      () => {
        this.hasActiveTooltip = false;
      },
      tooltipText,
      this.id
    );
    tooltip.show();
    this.hasActiveTooltip = true;
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

class ProjectList {
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

class App {
  static init() {
    const activeProjectList = new ProjectList("active");
    const finishedProjectList = new ProjectList("finished");
    activeProjectList.setSwitchHandlerFunction(
      finishedProjectList.addProject.bind(finishedProjectList)
    );
    finishedProjectList.setSwitchHandlerFunction(
      activeProjectList.addProject.bind(activeProjectList)
    );
  }
}

App.init();
