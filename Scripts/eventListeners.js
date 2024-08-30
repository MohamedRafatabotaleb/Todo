import {
  inputElement,
  TaskListElement,
  TaskAddBarButton,
  getCheckboxElements,
  clearBtn,
  TaskFilterAll,
  TaskFilterCompleted,
  TaskFilterActive,
  filterButtons,
} from "./elements";

import {
  fetchData,
  deleteTask,
  addTask,
  toggleTask,
  renderTaskList,
  updateTaskCount,
  initializeObserver,
  clearCompletedTasks,
  inputElementTask,
  initDarkModeToggle,
} from "./utils";

// Initialize clear completed tasks button listener
const initClearCompletedListener = () => {
  clearBtn.addEventListener("click", () => {
    const tasks = fetchData("tasks");
    clearCompletedTasks(
      tasks,
      TaskListElement,
      inputElement,
      initTaskListeners
    );
  });
};

// Setup Task Filter Event Handlers
const TaskFilters = () => {
  TaskFilterAll.addEventListener("click", () => {
    TaskListElement.classList.remove("TaskList__list--hideCompleted");
    TaskListElement.classList.remove("TaskList__list--showCompleted");
  });

  TaskFilterActive.addEventListener("click", () => {
    TaskListElement.classList.remove("TaskList__list--showCompleted");
    TaskListElement.classList.add("TaskList__list--hideCompleted");
  });

  TaskFilterCompleted.addEventListener("click", () => {
    TaskListElement.classList.remove("TaskList__list--hideCompleted");
    TaskListElement.classList.add("TaskList__list--showCompleted");
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons
      filterButtons.forEach((btn) => {
        btn.classList.remove("is-active");
      });

      // Add active class to the clicked button
      button.classList.add("is-active");
    });
  });
};

// Initialize event listeners
const initEventListeners = () => {
  initDarkModeToggle(); // Initialize dark mode toggle listener
  initTaskListeners(); // Initialize task listeners

  TaskAddBarButton.addEventListener("click", (e) => {
    const tasks = fetchData("tasks");
    addTask(
      e,
      tasks,
      inputElement,
      renderTaskList,
      TaskListElement,
      initTaskListeners
    );
  });

  TaskFilters();

  // Call the function to update the count when the page loads
  document.addEventListener("DOMContentLoaded", () => {
    updateTaskCount(); // Update the number when the page loads
    initializeObserver(); // Start monitoring changes
  });

  initClearCompletedListener(); // Initialize clear completed tasks listener
};

// Initialize Event Listeners for Task Interactions
const initTaskListeners = () => {
  const tasks = fetchData("tasks");

  const deleteIcons = document.querySelectorAll(".TaskList__deleteIcon");

  // Initialize Event Listeners for Delete Icons
  deleteIcons.forEach((icon) => {
    icon.addEventListener("click", (e) =>
      deleteTask(
        e,
        tasks,
        renderTaskList,
        TaskListElement,
        inputElement,
        initTaskListeners
      )
    );
  });

  // Initialize Event Listeners for Task Toggle Actions
  getCheckboxElements().forEach((box, index) => {
    // Handle Task Toggle on Enter Key Press
    box.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        toggleTask(
          e,
          index,
          tasks,
          renderTaskList,
          TaskListElement,
          inputElement,
          initTaskListeners
        );
      }
    });
    // Handle Task Toggle on Click
    box.addEventListener("click", (e) => {
      toggleTask(
        e,
        index,
        tasks,
        renderTaskList,
        TaskListElement,
        inputElement,
        initTaskListeners
      );
    });
  });

  inputElementTask();
};

export { initEventListeners, initTaskListeners };
