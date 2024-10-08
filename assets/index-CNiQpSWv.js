(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver((s) => {
    for (const n of s)
      if (n.type === "childList")
        for (const i of n.addedNodes)
          i.tagName === "LINK" && i.rel === "modulepreload" && r(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function o(s) {
    const n = {};
    return (
      s.integrity && (n.integrity = s.integrity),
      s.referrerPolicy && (n.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (n.credentials = "include")
        : s.crossOrigin === "anonymous"
        ? (n.credentials = "omit")
        : (n.credentials = "same-origin"),
      n
    );
  }
  function r(s) {
    if (s.ep) return;
    s.ep = !0;
    const n = o(s);
    fetch(s.href, n);
  }
})();
const y = document.querySelector(".DarkThemeToggle"),
  g = document.querySelector(".App"),
  c = document.querySelector(".TaskAddBar__input"),
  a = document.querySelector(".TaskList__list"),
  T = document.querySelector(".TaskAddBar__button"),
  _ = document.getElementById("taskCount"),
  h = document.querySelector(".TaskList__filter--all"),
  E = document.querySelector(".TaskList__filter--active"),
  C = document.querySelector(".TaskList__filter--completed"),
  L = document.querySelectorAll(".TaskList__filter"),
  b = () => document.querySelectorAll(".TaskList__checkbox"),
  A = document.querySelector(".clear-btn"),
  u = (e) => {
    const t = localStorage.getItem(e);
    return t ? JSON.parse(t) : [];
  },
  m = (e, t) => {
    localStorage.setItem(e, JSON.stringify(t));
  },
  S = (e, t, o, r, s, n) => {
    const i = e.target.getAttribute("data-index");
    confirm("Are you sure you want to delete this task?") &&
      (t.splice(i, 1), m("tasks", t), o(t, r, s, n));
  },
  q = (e, t, o, r, s, n) => {
    e.preventDefault();
    const i = o.value;
    if (!i) return;
    const p = { value: i, isCompleted: !1 };
    t.push(p), m("tasks", t), r(t, s, o, n);
  },
  f = (e, t, o, r, s, n, i) => {
    (o[t].isCompleted = !o[t].isCompleted), m("tasks", o), r(o, s, n, i);
  },
  d = (e, t, o, r) => {
    if (!t) {
      console.error("TaskListElement is undefined");
      return;
    }
    if (e.length === 0) {
      w(t);
      return;
    }
    let s = "";
    e.forEach((n, i) => {
      s += `<li class="TaskList__taskContent${
        n.isCompleted ? " TaskList__taskContent--isCompleted" : ""
      }" data-id="${i}">
        <div class='TaskList__valueContent'>
        <img src="./assets/icon-cross.svg"
               class='TaskList__deleteIcon'
               alt="basket-icon"
               data-index="${i}"
          />
          <p class='TaskList__value'>
            ${n.value}
          </p>
        </div>
        <div class='TaskList__checkbox' tabindex="0" role="button">
        </div>
      </li>`;
    }),
      (t.innerHTML = s),
      (o.value = ""),
      r(),
      D(t);
  };
document.addEventListener("DOMContentLoaded", () => {
  const e = u("tasks");
  d(e, a, c, l), k(), v();
});
const w = (e) => {
    e.innerHTML = `<li class='EmptyList'>
      <img class='EmptyList__img' src="./assets/icon-empty.svg" alt="list is empty" />
      <p>The task list is empty</p>
    </li>`;
  },
  k = () => {
    const e = a.querySelectorAll("li:not(.EmptyList)");
    _.textContent = e.length > 0 ? e.length : 0;
  },
  v = () => {
    const e = new MutationObserver(k),
      t = { childList: !0, subtree: !0 };
    e.observe(a, t);
  },
  O = (e, t, o, r) => {
    if (!confirm("Are you sure you want to delete all completed tasks?"))
      return;
    const n = e.filter((i) => !i.isCompleted);
    m("tasks", n), d(n, t, o, r);
  },
  D = (e) => {
    new Sortable(e, {
      animation: 150,
      onEnd: (t) => {
        const o = u("tasks"),
          r = o.splice(t.oldIndex, 1)[0];
        o.splice(t.newIndex, 0, r), m("tasks", o), d(o, e, c, l);
      },
    });
  },
  I = () => {
    c.addEventListener("input", function () {
      const e = c.value;
      /[\u0600-\u06FF]/.test(e)
        ? ((c.style.direction = "rtl"),
          (c.style.textAlign = "right"),
          (c.placeholder = "قم بإضافة مهمة ..."))
        : ((c.style.direction = "ltr"),
          (c.style.textAlign = "left"),
          (c.placeholder = "Type your task"));
    });
  },
  B = () => {
    y.addEventListener("click", () => {
      g.classList.toggle("App--isDark");
    });
  },
  M = () => {
    A.addEventListener("click", () => {
      const e = u("tasks");
      O(e, a, c, l);
    });
  },
  x = () => {
    h.addEventListener("click", () => {
      a.classList.remove("TaskList__list--hideCompleted"),
        a.classList.remove("TaskList__list--showCompleted");
    }),
      E.addEventListener("click", () => {
        a.classList.remove("TaskList__list--showCompleted"),
          a.classList.add("TaskList__list--hideCompleted");
      }),
      C.addEventListener("click", () => {
        a.classList.remove("TaskList__list--hideCompleted"),
          a.classList.add("TaskList__list--showCompleted");
      }),
      L.forEach((e) => {
        e.addEventListener("click", () => {
          L.forEach((t) => {
            t.classList.remove("is-active");
          }),
            e.classList.add("is-active");
        });
      });
  },
  F = () => {
    document.addEventListener("DOMContentLoaded", () => {
      var e = document.querySelector("main"),
        t = document.body;
      function o() {
        e.classList.contains("App--isDark")
          ? (t.style.backgroundColor = "hsl(235, 21%, 11%)")
          : (t.style.backgroundColor = "hsl(234, 39%, 85%)");
      }
      o();
      var r = new MutationObserver(o);
      r.observe(e, { attributes: !0, attributeFilter: ["class"] });
    });
  },
  l = () => {
    const e = u("tasks");
    document.querySelectorAll(".TaskList__deleteIcon").forEach((o) => {
      o.addEventListener("click", (r) => S(r, e, d, a, c, l));
    }),
      b().forEach((o, r) => {
        o.addEventListener("keydown", (s) => {
          s.key === "Enter" && f(s, r, e, d, a, c, l);
        }),
          o.addEventListener("click", (s) => {
            f(s, r, e, d, a, c, l);
          });
      }),
      I();
  },
  N = () => {
    B(),
      l(),
      T.addEventListener("click", (e) => {
        const t = u("tasks");
        q(e, t, c, d, a, l);
      }),
      x(),
      document.addEventListener("DOMContentLoaded", () => {
        k(), v();
      }),
      M(),
      F();
  };
N();
