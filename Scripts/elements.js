const darkThemeToggleElement = document.querySelector(".DarkThemeToggle");

const appElement = document.querySelector(".App");

const inputElement = document.querySelector(".TaskAddBar__input");

const TaskListElement = document.querySelector(".TaskList__list");

const TaskAddBarButton = document.querySelector(".TaskAddBar__button");

const taskCountElement = document.getElementById("taskCount");

/* Task Filter */

const TaskFilterAll = document.querySelector(".TaskList__filter--all");

const TaskFilterActive = document.querySelector(".TaskList__filter--active");

const TaskFilterCompleted = document.querySelector(
  ".TaskList__filter--completed"
);

const filterButtons = document.querySelectorAll(".TaskList__filter");

/* End Task Filter */

const getDeleteIcons = () => document.querySelectorAll(".TaslList__deleteIcon");

const getCheckboxElements = () =>
  document.querySelectorAll(".TaskList__checkbox");

const clearBtn = document.querySelector(".clear-btn");

export {
  darkThemeToggleElement,
  appElement,
  inputElement,
  TaskListElement,
  getDeleteIcons,
  getCheckboxElements,
  TaskAddBarButton,
  taskCountElement,
  clearBtn,
  TaskFilterAll,
  TaskFilterActive,
  TaskFilterCompleted,
  filterButtons,
};
