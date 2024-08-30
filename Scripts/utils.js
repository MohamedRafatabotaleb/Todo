import {
  taskCountElement,
  TaskListElement,
  inputElement,
  darkThemeToggleElement,
  appElement,
} from "./elements";

import { initTaskListeners } from "./eventListeners";

// Fetch data from localStorage
const fetchData = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Save data to localStorage
const saveToDB = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Delete a task
const deleteTask = (
  e,
  tasks,
  renderTaskList,
  TaskListElement,
  inputElement,
  initTaskListeners
) => {
  const index = e.target.getAttribute("data-index");
  const answer = confirm("Are you sure you want to delete this task?");

  if (!answer) {
    return;
  }

  tasks.splice(index, 1);
  saveToDB("tasks", tasks);
  renderTaskList(tasks, TaskListElement, inputElement, initTaskListeners);
};

// Add a new task
const addTask = (
  e,
  tasks,
  inputElement,
  renderTaskList,
  TaskListElement,
  initTaskListeners
) => {
  e.preventDefault();

  const taskValue = inputElement.value;

  if (!taskValue) {
    return;
  }

  const task = {
    value: taskValue,
    isCompleted: false,
  };

  tasks.push(task);
  saveToDB("tasks", tasks);
  renderTaskList(tasks, TaskListElement, inputElement, initTaskListeners);
};

// Toggle task completion status
const toggleTask = (
  e,
  index,
  tasks,
  renderTaskList,
  TaskListElement,
  inputElement,
  initTaskListeners
) => {
  tasks[index].isCompleted = !tasks[index].isCompleted;
  saveToDB("tasks", tasks);
  renderTaskList(tasks, TaskListElement, inputElement, initTaskListeners);
};

// Render the task list
const renderTaskList = (
  tasks,
  TaskListElement,
  inputElement,
  initTaskListeners
) => {
  if (!TaskListElement) {
    console.error("TaskListElement is undefined");
    return;
  }

  if (tasks.length === 0) {
    renderEmptyState(TaskListElement);
    return;
  }

  let taskListHTML = "";
  tasks.forEach((task, index) => {
    taskListHTML += `<li class="TaskList__taskContent${
      task.isCompleted ? " TaskList__taskContent--isCompleted" : ""
    }" data-id="${index}">
        <div class='TaskList__valueContent'>
        <img src="./images/icon-cross.svg"
               class='TaskList__deleteIcon'
               alt="basket-icon"
               data-index="${index}"
          />
          <p class='TaskList__value'>
            ${task.value}
          </p>
        </div>
        <div class='TaskList__checkbox' tabindex="0" role="button">
        </div>
      </li>`;
  });

  TaskListElement.innerHTML = taskListHTML;
  inputElement.value = "";

  // Attach event listeners to the delete icons after rendering the tasks
  initTaskListeners();

  // Initialize drag and drop
  initializeDragAndDrop(TaskListElement);
};

// Retrieve tasks saved in localStorage when page loads
document.addEventListener("DOMContentLoaded", () => {
  const tasks = fetchData("tasks");
  renderTaskList(tasks, TaskListElement, inputElement, initTaskListeners);
  updateTaskCount(); // Update the number when the page loads
  initializeObserver(); // Start monitoring changes
});

// Render an empty state if no tasks exist
const renderEmptyState = (TaskListElement) => {
  TaskListElement.innerHTML = `<li class='EmptyList'>
      <img class='EmptyList__img' src="./assets/icon-empty.svg" alt="list is empty" />
      <p>The task list is empty</p>
    </li>`;
};

// Update the number of items
const updateTaskCount = () => {
  // Count the number of <li> elements that do not have an `EmptyList` class.
  const taskItems = TaskListElement.querySelectorAll("li:not(.EmptyList)");

  // Update the text to reflect the number of elements, and display 0 if there are no non-empty elements.
  taskCountElement.textContent = taskItems.length > 0 ? taskItems.length : 0;
};

// Create a monitor for changes in the DOM
const initializeObserver = () => {
  const observer = new MutationObserver(updateTaskCount);

  // Observer options
  const observerConfig = {
    childList: true,
    subtree: true,
  };

  observer.observe(TaskListElement, observerConfig);
};

// Clear Completed Tasks with User Confirmation
const clearCompletedTasks = (
  tasks,
  TaskListElement,
  inputElement,
  initTaskListeners
) => {
  const answer = confirm(
    "Are you sure you want to delete all completed tasks?"
  );
  if (!answer) {
    return;
  }

  const remainingTasks = tasks.filter((task) => !task.isCompleted);
  saveToDB("tasks", remainingTasks);
  renderTaskList(
    remainingTasks,
    TaskListElement,
    inputElement,
    initTaskListeners
  );
};

// Initialize Drag and Drop Functionality for Task List
const initializeDragAndDrop = (TaskListElement) => {
  const sortable = new Sortable(TaskListElement, {
    animation: 150,
    onEnd: (evt) => {
      const tasks = fetchData("tasks");
      const movedTask = tasks.splice(evt.oldIndex, 1)[0];
      tasks.splice(evt.newIndex, 0, movedTask);
      saveToDB("tasks", tasks);
      renderTaskList(tasks, TaskListElement, inputElement, initTaskListeners);
    },
  });
};

// Adjust Input Field Direction, Alignment, and Placeholder Based on Language
const inputElementTask = () => {
  inputElement.addEventListener("input", function () {
    const value = inputElement.value;

    const isArabic = /[\u0600-\u06FF]/.test(value);

    if (isArabic) {
      inputElement.style.direction = "rtl";
      inputElement.style.textAlign = "right";
      inputElement.placeholder = "قم بإضافة مهمة ..."; // Arabic placeholder
    } else {
      inputElement.style.direction = "ltr";
      inputElement.style.textAlign = "left";
      inputElement.placeholder = "Type your task"; // English placeholder
    }
  });
};

// Enable dark mode toggle
const initDarkModeToggle = () => {
  darkThemeToggleElement.addEventListener("click", () => {
    appElement.classList.toggle("App--isDark");
  });
};

export {
  fetchData,
  saveToDB,
  deleteTask,
  addTask,
  toggleTask,
  renderTaskList,
  renderEmptyState,
  updateTaskCount,
  initializeObserver,
  clearCompletedTasks,
  initializeDragAndDrop,
  inputElementTask,
  initDarkModeToggle,
};
