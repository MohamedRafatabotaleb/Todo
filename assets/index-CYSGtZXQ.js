(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) i(s);
  new MutationObserver((s) => {
    for (const o of s)
      if (o.type === "childList")
        for (const r of o.addedNodes)
          r.tagName === "LINK" && r.rel === "modulepreload" && i(r);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(s) {
    const o = {};
    return (
      s.integrity && (o.integrity = s.integrity),
      s.referrerPolicy && (o.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === "use-credentials"
        ? (o.credentials = "include")
        : s.crossOrigin === "anonymous"
        ? (o.credentials = "omit")
        : (o.credentials = "same-origin"),
      o
    );
  }
  function i(s) {
    if (s.ep) return;
    s.ep = !0;
    const o = n(s);
    fetch(s.href, o);
  }
})();
const T = document.querySelector(".DarkThemeToggle"),
  y = document.querySelector(".App"),
  c = document.querySelector(".TaskAddBar__input"),
  l = document.querySelector(".TaskList__list"),
  _ = document.querySelector(".TaskAddBar__button"),
  g = document.getElementById("taskCount"),
  h = document.querySelector(".TaskList__filter--all"),
  E = document.querySelector(".TaskList__filter--active"),
  C = document.querySelector(".TaskList__filter--completed"),
  L = document.querySelectorAll(".TaskList__filter"),
  A = () => document.querySelectorAll(".TaskList__checkbox"),
  S = document.querySelector(".clear-btn"),
  u = (e) => {
    const t = localStorage.getItem(e);
    return t ? JSON.parse(t) : [];
  },
  m = (e, t) => {
    localStorage.setItem(e, JSON.stringify(t));
  },
  b = (e, t, n, i, s, o) => {
    const r = e.target.getAttribute("data-index");
    confirm("Are you sure you want to delete this task?") &&
      (t.splice(r, 1), m("tasks", t), n(t, i, s, o));
  },
  q = (e, t, n, i, s, o) => {
    e.preventDefault();
    const r = n.value;
    if (!r) return;
    const p = { value: r, isCompleted: !1 };
    t.push(p), m("tasks", t), i(t, s, n, o);
  },
  f = (e, t, n, i, s, o, r) => {
    (n[t].isCompleted = !n[t].isCompleted), m("tasks", n), i(n, s, o, r);
  },
  d = (e, t, n, i) => {
    if (!t) {
      console.error("TaskListElement is undefined");
      return;
    }
    if (e.length === 0) {
      w(t);
      return;
    }
    let s = "";
    e.forEach((o, r) => {
      s += `<li class="TaskList__taskContent${
        o.isCompleted ? " TaskList__taskContent--isCompleted" : ""
      }" data-id="${r}">
        <div class='TaskList__valueContent'>
        <img src="/assets/icon-cross.svg"
               class='TaskList__deleteIcon'
               alt="basket-icon"
               data-index="${r}"
          />
          <p class='TaskList__value'>
            ${o.value}
          </p>
        </div>
        <div class='TaskList__checkbox' tabindex="0" role="button">
        </div>
      </li>`;
    }),
      (t.innerHTML = s),
      (n.value = ""),
      i(),
      I(t);
  };
document.addEventListener("DOMContentLoaded", () => {
  const e = u("tasks");
  d(e, l, c, a), k(), v();
});
const w = (e) => {
    e.innerHTML = `<li class='EmptyList'>
      <img class='EmptyList__img' src="/assets/icon-empty.svg" alt="list is empty" />
      <p>The task list is empty</p>
    </li>`;
  },
  k = () => {
    const e = l.querySelectorAll("li:not(.EmptyList)");
    g.textContent = e.length > 0 ? e.length : 0;
  },
  v = () => {
    const e = new MutationObserver(k),
      t = { childList: !0, subtree: !0 };
    e.observe(l, t);
  },
  O = (e, t, n, i) => {
    if (!confirm("Are you sure you want to delete all completed tasks?"))
      return;
    const o = e.filter((r) => !r.isCompleted);
    m("tasks", o), d(o, t, n, i);
  },
  I = (e) => {
    new Sortable(e, {
      animation: 150,
      onEnd: (t) => {
        const n = u("tasks"),
          i = n.splice(t.oldIndex, 1)[0];
        n.splice(t.newIndex, 0, i), m("tasks", n), d(n, e, c, a);
      },
    });
  },
  D = () => {
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
  x = () => {
    T.addEventListener("click", () => {
      y.classList.toggle("App--isDark");
    });
  },
  B = () => {
    S.addEventListener("click", () => {
      const e = u("tasks");
      O(e, l, c, a);
    });
  },
  M = () => {
    h.addEventListener("click", () => {
      l.classList.remove("TaskList__list--hideCompleted"),
        l.classList.remove("TaskList__list--showCompleted");
    }),
      E.addEventListener("click", () => {
        l.classList.remove("TaskList__list--showCompleted"),
          l.classList.add("TaskList__list--hideCompleted");
      }),
      C.addEventListener("click", () => {
        l.classList.remove("TaskList__list--hideCompleted"),
          l.classList.add("TaskList__list--showCompleted");
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
    x(),
      a(),
      _.addEventListener("click", (e) => {
        const t = u("tasks");
        q(e, t, c, d, l, a);
      }),
      M(),
      document.addEventListener("DOMContentLoaded", () => {
        k(), v();
      }),
      B();
  },
  a = () => {
    const e = u("tasks");
    document.querySelectorAll(".TaskList__deleteIcon").forEach((n) => {
      n.addEventListener("click", (i) => b(i, e, d, l, c, a));
    }),
      A().forEach((n, i) => {
        n.addEventListener("keydown", (s) => {
          s.key === "Enter" && f(s, i, e, d, l, c, a);
        }),
          n.addEventListener("click", (s) => {
            f(s, i, e, d, l, c, a);
          });
      }),
      D();
  };
F();
