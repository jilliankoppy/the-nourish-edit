"use strict";

const main = document.querySelector("main");
const modal = document.querySelector("dialog");
const nav = document.querySelector("nav");
const menu = document.querySelector("#menu");
const notice = document.querySelector("#notice");
const byId = new Map(recipes.map((recipe) => [recipe.id, recipe]));
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const meals = ["Breakfast", "Lunch", "Dinner", "Snack"];
const pages = [
  "home",
  "recipes",
  "planner",
  "grocery",
  "favorites",
  "finder",
  "kitchen",
];
const storageKey = "nourish-edit-v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch {
    return {};
  }
}

const state = {
  plan: {},
  favorites: [],
  custom: [],
  checked: {},
  hidden: {},
  finder: {},
  kitchen: "",
  ...load(),
};
const filters = { category: "All", tags: new Set(), query: "" };
let page;
let announcementTimer;
let dragSource;

function announce(message) {
  notice.textContent = message;
  clearTimeout(announcementTimer);
  announcementTimer = setTimeout(() => {
    notice.textContent = "";
  }, 3000);
}

function save(message) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    message =
      (message ? message + " " : "") +
      "Browser storage is unavailable for this session.";
  }
  if (message) announce(message);
}

function removeRetiredRecipe(id) {
  const slots = Object.keys(state.plan).filter((key) => state.plan[key].id === id);
  const wasFavorite = state.favorites.includes(id);
  if (!slots.length && !wasFavorite) return;
  slots.forEach((key) => delete state.plan[key]);
  state.favorites = state.favorites.filter((favoriteId) => favoriteId !== id);
  save("White Bean Tomato Toast was retired and removed from your planner and favorites.");
}

removeRetiredRecipe("white-bean-tomato-toast");

function h(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
}

function option(value, label = value, selected = "") {
  return (
    '<option value="' +
    h(value) +
    '"' +
    (value === selected ? " selected" : "") +
    ">" +
    h(label) +
    "</option>"
  );
}

function btn(label, action, value = "", css = "quiet small", extra = "") {
  return (
    '<button type="button" class="' +
    css +
    '" data-action="' +
    action +
    '" data-value="' +
    h(value) +
    '" ' +
    extra +
    ">" +
    h(label) +
    "</button>"
  );
}

function link(label, target, css = "button outline") {
  return '<a href="#' + target + '" class="' + css + '">' + h(label) + "</a>";
}

function total(recipe) {
  return recipe.prep + recipe.cook;
}
function favorite(recipe) {
  return state.favorites.includes(recipe.id);
}
function heart(recipe, icon = false) {
  const saved = favorite(recipe);
  const label =
    (saved ? "Remove from favorites" : "Save to favorites") +
    " · " +
    recipe.name;
  return btn(
    icon ? (saved ? "♥" : "♡") : saved ? "♥ Saved" : "♡ Save to favorites",
    "favorite",
    recipe.id,
    icon ? "heart" : "outline",
    'aria-pressed="' + saved + '" aria-label="' + h(label) + '"',
  );
}
function photo(recipe) {
  return (
    '<img src="' +
    recipe.photo +
    '" alt="' +
    h(recipe.name) +
    '" loading="lazy" width="512" height="512">'
  );
}
function card(recipe, note = "") {
  return (
    '<article class="card"><button type="button" class="card-photo" data-action="view" data-value="' +
    recipe.id +
    '" aria-label="View ' +
    h(recipe.name) +
    '">' +
    photo(recipe) +
    "</button>" +
    heart(recipe, true) +
    '<div class="card-body"><p class="meta">' +
    recipe.category +
    " · " +
    total(recipe) +
    " min</p><h3>" +
    recipe.name +
    '</h3><div class="tags">' +
    recipe.tags.map((tag) => '<span class="tag">' + tag + "</span>").join("") +
    "</div>" +
    (note ? "<p>" + h(note) + "</p>" : "") +
    '<div class="actions">' +
    btn("View recipe", "view", recipe.id, "outline small") +
    btn(
      "+ Plan",
      "add",
      recipe.id,
      "small",
      'aria-label="Plan ' + h(recipe.name) + '"',
    ) +
    "</div></div></article>"
  );
}
function grid(list) {
  return (
    '<div class="grid">' +
    list.map((recipe) => card(recipe)).join("") +
    "</div>"
  );
}
function empty(title, text, action = "") {
  return (
    '<div class="empty"><h2>' +
    title +
    "</h2><p>" +
    text +
    "</p>" +
    action +
    "</div>"
  );
}
function heading(title, subtitle, content) {
  return (
    '<section class="page wrap"><header><h1>' +
    title +
    "</h1><p>" +
    subtitle +
    "</p></header>" +
    content +
    "</section>"
  );
}
const hero = main.innerHTML;
function collection(
  title,
  intro,
  list,
  tint = "",
  action = link("Browse recipes", "recipes"),
) {
  return (
    '<section class="section ' +
    tint +
    '"><div class="wrap"><div class="section-head"><div><h2>' +
    title +
    "</h2><p>" +
    intro +
    "</p></div>" +
    action +
    "</div>" +
    grid(list) +
    "</div></section>"
  );
}
function home() {
  return (
    hero +
    collection(
      "The weekly edit",
      "Fresh ideas for breakfast, lunch, and dinner.",
      [recipes[0], recipes[5], recipes[8]],
    ) +
    collection(
      "Quick & easy",
      "Meals you can put together in under 20 minutes.",
      [recipes[1], recipes[6], recipes[10]],
      "tint",
      btn("See quick meals", "collection", "Quick meals", "outline"),
    ) +
    collection(
      "High-protein favorites",
      "Three satisfying recipes to add to the rotation.",
      [recipes[4], recipes[12], recipes[20]],
      "",
      btn("See high-protein", "collection", "High-protein", "outline"),
    ) +
    '<section class="section tint"><div class="wrap"><h2>How meal planning works</h2><div class="how-grid">' +
    "<article><h3>Find your recipes</h3><p>Search by ingredients, save a favorite, or try Find My Meal.</p></article>" +
    "<article><h3>Build your week</h3><p>Add recipes to your calendar and set the servings you need.</p></article>" +
    "<article><h3>Shop your list</h3><p>Your planner puts ingredients into a grocery list you can check off as you go.</p></article>" +
    "</div>" +
    link("Create my weekly menu", "planner", "button") +
    "</div></section>"
  );
}

const filterTags = [...Object.values(dietaryTags), "Quick meals"];
function hasTag(recipe, tag) {
  return tag === "Quick meals" ? total(recipe) < 20 : recipe.tags.includes(tag);
}
function searchMatches(recipe, query) {
  const haystack = [recipe.name, ...recipe.ingredients.map((item) => item.name)]
    .join(" ")
    .toLowerCase();
  return query
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .every((word) => haystack.includes(word));
}
function library() {
  const chips = (labels, action, active) =>
    labels
      .map((label) =>
        btn(
          label,
          action,
          label,
          "chip outline small",
          'aria-pressed="' + active(label) + '"',
        ),
      )
      .join("");
  return heading(
    "Discover recipes",
    "Search by name or ingredient, then narrow the library by meal or dietary preference.",
    '<div class="controls"><label for="recipe-search">Search recipes<input id="recipe-search" type="search" placeholder="Try salmon or avocado" value="' +
      h(filters.query) +
      '"></label><div class="chips" role="group" aria-label="Meal category">' +
      chips(
        ["All", ...meals],
        "category",
        (label) => filters.category === label,
      ) +
      '</div><div class="chips" role="group" aria-label="Recipe filters">' +
      chips(filterTags, "tag", (label) => filters.tags.has(label)) +
      '</div></div><div id="recipe-results"></div>',
  );
}
function libraryResults() {
  const matches = recipes.filter(
    (recipe) =>
      (filters.category === "All" || recipe.category === filters.category) &&
      [...filters.tags].every((tag) => hasTag(recipe, tag)) &&
      searchMatches(recipe, filters.query),
  );
  document.querySelector("#recipe-results").innerHTML =
    '<p class="results-label meta" role="status">' +
    matches.length +
    (matches.length === 1 ? " recipe" : " recipes") +
    "</p>" +
    (matches.length
      ? grid(matches)
      : empty(
          "No recipes match",
          "Try a different ingredient or clear the selected filters.",
          btn("Clear filters", "clear-filters"),
        ));
}

function formatAmount(amount) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(
    amount,
  );
}
function quantity(amount, unit) {
  if (unit === "each" || !unit) return formatAmount(amount);
  return (
    formatAmount(amount) +
    " " +
    (unit === "cup" && amount !== 1
      ? "cups"
      : unit === "slices" && amount === 1
        ? "slice"
        : unit)
  );
}
function dialog(title, body) {
  modal.innerHTML =
    '<div class="dialog-body"><div class="dialog-top"><h2 id="dialog-title">' +
    h(title) +
    "</h2>" +
    btn("Close", "close", "", "quiet small", "autofocus") +
    "</div>" +
    body +
    "</div>";
  if (!modal.open) modal.showModal();
  else modal.querySelector("[autofocus]").focus();
}
function details(recipe) {
  dialog(
    recipe.name,
    photo(recipe) +
      "<p>" +
      recipe.description +
      '</p><p class="meta">' +
      recipe.servings +
      (recipe.servings === 1 ? " serving" : " servings") +
      " · " +
      recipe.prep +
      " min prep · " +
      recipe.cook +
      ' min cook</p><div class="actions">' +
      btn("Add to weekly planner", "add", recipe.id, "") +
      heart(recipe) +
      '</div><div class="recipe-detail"><div><h3>Ingredients</h3><ul>' +
      recipe.ingredients
        .map(
          (item) =>
            "<li>" +
            quantity(item.amount, item.unit) +
            " " +
            item.name +
            "</li>",
        )
        .join("") +
      "</ul></div><div><h3>Method</h3><ol>" +
      recipe.steps.map((step) => "<li>" + step + "</li>").join("") +
      "</ol></div></div>",
  );
}

function slotName(key) {
  const [day, meal] = key.split(":").map(Number);
  return days[day] + " " + meals[meal].toLowerCase();
}
function periodFields(day, meal) {
  return (
    '<label>Day<select name="day">' +
    days.map((dayName, i) => option(String(i), dayName, String(day))).join("") +
    '</select></label><label>Meal<select name="meal">' +
    meals
      .map((mealName, i) => option(String(i), mealName, String(meal)))
      .join("") +
    "</select></label>"
  );
}
function planner() {
  const week = days
    .map(
      (day, d) =>
        '<article class="day"><h2>' +
        day +
        "</h2>" +
        meals
          .map((meal, m) => {
            const key = d + ":" + m;
            const entry = state.plan[key];
            const recipe = entry && byId.get(entry.id);
            return (
              '<div class="slot" data-slot="' +
              key +
              '"><span class="slot-label">' +
              (meal === "Snack" ? "Snacks" : meal) +
              "</span>" +
              btn(
                recipe ? recipe.name + " · " + entry.servings : "+ Add meal",
                "slot",
                key,
                "meal",
                'aria-label="' +
                  h(
                    slotName(key) +
                      " · " +
                      (recipe
                        ? recipe.name + ", " + entry.servings + " servings"
                        : "add meal"),
                  ) +
                  '"' +
                  (recipe ? ' draggable="true"' : ""),
              ) +
              "</div>"
            );
          })
          .join("") +
        btn(
          "Clear day",
          "clear-day",
          d,
          "quiet small day-clear",
          'aria-label="Clear ' +
            day +
            '"' +
            (Object.keys(state.plan).some((key) => key.startsWith(d + ":"))
              ? ""
              : " hidden"),
        ) +
        "</article>",
    )
    .join("");
  return heading(
    "My weekly planner",
    "Choose a slot to add a meal or adjust servings. Drag a meal to move it, or use Move in its edit menu.",
    '<div class="actions">' +
      link("View grocery list", "grocery", "button") +
      link("Browse recipes", "recipes") +
      (Object.keys(state.plan).length ? btn("Reset week", "reset-week") : "") +
      '</div><div class="week">' +
      week +
      "</div>",
  );
}
function planForm({ recipe, key }) {
  const entry = key && state.plan[key];
  const selected = recipe || (entry && byId.get(entry.id));
  const [day, meal] = key
    ? key.split(":")
    : ["0", String(meals.indexOf(recipe.category))];
  const choices = meals
    .map(
      (category) =>
        '<optgroup label="' +
        category +
        '">' +
        recipes
          .filter((item) => item.category === category)
          .map((item) => option(item.id, item.name, selected?.id))
          .join("") +
        "</optgroup>",
    )
    .join("");
  dialog(
    key ? slotName(key) : "Add to weekly planner",
    '<form id="plan-form" data-fixed="' +
      h(key) +
      '"><div class="fields"><label>Recipe<select name="recipe" required>' +
      option("", "Choose a recipe") +
      choices +
      '</select></label><label>Servings<input name="servings" type="number" required min="1" max="99" value="' +
      (entry?.servings || selected?.servings || 1) +
      '"></label>' +
      (key ? "" : periodFields(day, meal)) +
      '</div><p id="slot-summary" aria-live="polite"></p><div class="actions"><button>Save meal</button>' +
      (entry
        ? btn("Move meal", "move", key) + btn("Remove meal", "remove-slot", key)
        : "") +
      "</div></form>",
  );
  slotSummary(modal.querySelector("form"));
}
function slotSummary(form) {
  const key = form.dataset.fixed || form.day.value + ":" + form.meal.value;
  const existing = state.plan[key];
  form.querySelector("#slot-summary").textContent = existing
    ? "Currently planned: " +
      byId.get(existing.id).name +
      ". Saving updates this slot."
    : "";
}
function moveForm(key) {
  const [day, meal] = key.split(":");
  dialog(
    "Move " + byId.get(state.plan[key].id).name,
    "<p>If the destination already has a meal, the two meals swap slots.</p>" +
      '<form id="move-form" data-source="' +
      key +
      '"><div class="fields">' +
      periodFields(day, meal) +
      '</div><div class="actions"><button>Move meal</button>' +
      btn("Back", "slot", key) +
      "</div></form>",
  );
}
function moveMeal(source, target) {
  if (source === target || !state.plan[source]) return false;
  const other = state.plan[target];
  state.plan[target] = state.plan[source];
  if (other) state.plan[source] = other;
  else delete state.plan[source];
  save("Meal moved to " + slotName(target) + ".");
  return true;
}

function ingredientTerms(value) {
  return value
    .toLowerCase()
    .split(/[,;]+/)
    .map((term) => term.trim())
    .filter(Boolean);
}
function finder() {
  const picks = state.finder;
  return heading(
    "Find my meal",
    "Choose what sounds good and see which recipes fit.",
    '<form class="panel" id="finder-form"><div class="fields"><label>What meal are you looking for?<select name="meal">' +
      meals.map((meal) => option(meal, meal, picks.meal)).join("") +
      '</select></label><label>How much time do you have?<select name="time">' +
      [
        ["15", "15 minutes"],
        ["30", "30 minutes"],
        ["all", "45+ minutes · no time limit"],
      ]
        .map(([value, label]) => option(value, label, picks.time))
        .join("") +
      '</select></label><label>What are you in the mood for?<select name="mood">' +
      ["Balanced", "High-protein", "Vegetarian", "Something quick"]
        .map((mood) => option(mood, mood, picks.mood))
        .join("") +
      '</select></label><label>Ingredients to use, if any<input name="ingredients" placeholder="e.g. avocado, lime" value="' +
      h(picks.ingredients) +
      '"></label></div><div class="actions"><button>Find recipes</button></div></form><div id="finder-results" class="below" aria-live="polite"></div>',
  );
}
function finderResults() {
  const { meal, time, mood, ingredients: query } = state.finder;
  const terms = ingredientTerms(query);
  const matches = recipes
    .filter(
      (recipe) =>
        recipe.category === meal &&
        (time === "all" || total(recipe) <= Number(time)) &&
        (mood === "Balanced" ||
          hasTag(recipe, mood === "Something quick" ? "Quick meals" : mood)) &&
        terms.every((term) =>
          recipe.ingredients.some((item) =>
            item.name.toLowerCase().includes(term),
          ),
        ),
    )
    .sort((a, b) => total(a) - total(b));
  document.querySelector("#finder-results").innerHTML = matches.length
    ? '<div class="section-head"><h2>Your matches</h2></div>' + grid(matches)
    : empty(
        "No exact matches",
        "Try allowing more time, changing your mood, or removing one of the ingredients.",
        link("Browse all recipes", "recipes"),
      );
}

function kitchen() {
  return heading(
    "What’s in my kitchen?",
    "Start with what you have. Recipes with the fewest missing ingredients come first.",
    '<form id="kitchen-form" class="panel"><label class="controls">Ingredients you have<input name="ingredients" list="ingredients" required placeholder="e.g. egg, avocado, bread" value="' +
      h(state.kitchen) +
      '"></label><datalist id="ingredients">' +
      Object.keys(ingredients)
        .sort()
        .map((name) => option(name))
        .join("") +
      '</datalist><button>Search my kitchen</button></form><div id="kitchen-results" class="below" aria-live="polite"></div>',
  );
}
function kitchenResults() {
  const terms = ingredientTerms(state.kitchen);
  const ranked = recipes
    .map((recipe) => ({
      recipe,
      missing: recipe.ingredients.filter(
        (item) =>
          item.name !== "Water" &&
          !terms.some((term) => item.name.toLowerCase().includes(term)),
      ),
      count: recipe.ingredients.filter((item) => item.name !== "Water").length,
    }))
    .filter((entry) => entry.missing.length < entry.count)
    .sort(
      (a, b) =>
        a.missing.length - b.missing.length ||
        a.missing.length / a.count - b.missing.length / b.count,
    );
  document.querySelector("#kitchen-results").innerHTML = ranked.length
    ? '<div class="grid">' +
      ranked
        .map(({ recipe, missing }) =>
          card(
            recipe,
            missing.length
              ? "Still need " +
                  missing.map((item) => item.name.toLowerCase()).join(", ") +
                  "."
              : "You have everything listed.",
          ),
        )
        .join("") +
      "</div>"
    : empty(
        "No ingredient matches",
        "Try an ingredient such as rice, avocado, or oats.",
      );
}

function groceryItems() {
  const combined = new Map();
  Object.values(state.plan).forEach((entry) => {
    const recipe = byId.get(entry.id);
    if (!recipe) return;
    recipe.ingredients.forEach((item) => {
      if (item.name === "Water") return;
      // Normalize common measures while keeping weight and volume distinct.
      const volume = { cup: 48, tbsp: 3, tsp: 1 };
      const unit = volume[item.unit] ? "volume" : item.unit;
      const key = "recipe:" + item.name + ":" + unit;
      if (!combined.has(key))
        combined.set(key, {
          key,
          name: item.name,
          group: item.group,
          unit,
          amount: 0,
        });
      combined.get(key).amount +=
        (item.amount * (volume[item.unit] || 1) * entry.servings) /
        recipe.servings;
    });
  });
  return [...combined.values(), ...state.custom].map((item) => {
    let { amount, unit } = item;
    if (unit === "volume") {
      const cups = amount / 48;
      const tablespoons = amount / 3;
      if (
        amount >= 48 ||
        (amount >= 12 && Math.abs(cups * 4 - Math.round(cups * 4)) < 0.0001)
      ) {
        amount = cups;
        unit = "cup";
      } else if (
        amount >= 3 &&
        Math.abs(tablespoons * 4 - Math.round(tablespoons * 4)) < 0.0001
      ) {
        amount = tablespoons;
        unit = "tbsp";
      } else unit = "tsp";
    }
    const signature = item.key.startsWith("custom:")
      ? item.quantity
      : quantity(amount, unit);
    return {
      ...item,
      signature,
      label: (signature ? signature + " " : "") + item.name,
    };
  });
}
function grocery() {
  const all = groceryItems();
  const visible = all.filter(
    (item) => state.hidden[item.key] !== item.signature,
  );
  const panels = [...Object.keys(ingredientGroups), "Other"]
    .map((group) => {
      const items = visible
        .filter((item) => item.group === group)
        .sort((a, b) => a.name.localeCompare(b.name));
      return items.length
        ? '<section class="panel"><h2>' +
            group +
            "</h2>" +
            items
              .map(
                (item) =>
                  '<div class="item"><label><input type="checkbox" data-grocery="' +
                  h(item.key) +
                  '"' +
                  (state.checked[item.key] === item.signature
                    ? " checked"
                    : "") +
                  "><span>" +
                  h(item.label) +
                  "</span></label>" +
                  btn(
                    "Remove",
                    "remove-grocery",
                    item.key,
                    "quiet small",
                    'aria-label="Remove ' + h(item.name) + '"',
                  ) +
                  "</div>",
              )
              .join("") +
            "</section>"
        : "";
    })
    .join("");
  const hiddenCount = all.length - visible.length;
  return heading(
    "Grocery list",
    "Your planned servings set the quantities. Check off what you pick up or add anything else you need.",
    '<div class="actions grocery-tools">' +
      link("Back to planner", "planner") +
      (visible.length
        ? btn("Copy list", "copy-list", "", "small") +
          btn("Print list", "print-list")
        : "") +
      (hiddenCount
        ? btn("Restore removed recipe items", "restore-grocery")
        : "") +
      "</div>" +
      (visible.length
        ? '<div class="grocery-grid">' + panels + "</div>"
        : '<div class="below">' +
          empty(
            "Your list is empty",
            "Plan a meal to bring in its ingredients, or add an item below.",
          ) +
          "</div>") +
      '<form id="grocery-form" class="custom-form"><label>Item<input name="name" required maxlength="80" placeholder="e.g. coffee"></label>' +
      '<label>Quantity<input name="quantity" maxlength="32" placeholder="e.g. 1 bag"></label><label>Category<select name="group">' +
      [...Object.keys(ingredientGroups), "Other"]
        .map((group) => option(group, group, "Other"))
        .join("") +
      "</select></label><button>Add item</button></form>",
  );
}
async function copyList() {
  const visible = groceryItems().filter(
    (item) => state.hidden[item.key] !== item.signature,
  );
  const content = [...Object.keys(ingredientGroups), "Other"]
    .map((group) => {
      const items = visible
        .filter((item) => item.group === group)
        .sort((a, b) => a.name.localeCompare(b.name));
      return items.length
        ? group +
            "\n" +
            items
              .map(
                (item) =>
                  (state.checked[item.key] === item.signature
                    ? "[x] "
                    : "[ ] ") + item.label,
              )
              .join("\n")
        : "";
    })
    .filter(Boolean)
    .join("\n\n");
  try {
    await navigator.clipboard.writeText(content);
    announce("Grocery list copied.");
  } catch {
    dialog(
      "Copy grocery list",
      '<label>Shopping list<textarea rows="12" readonly style="width:100%">' +
        h(content) +
        "</textarea></label>",
    );
    const field = modal.querySelector("textarea");
    field.focus();
    field.select();
  }
}
function favorites() {
  const saved = recipes.filter(favorite);
  return heading(
    "My favorites",
    "Keep the recipes you want to make again within reach.",
    saved.length
      ? grid(saved)
      : empty(
          "Nothing saved yet",
          "Tap the heart on a recipe to save it here.",
          link("Find a favorite", "recipes", "button"),
        ),
  );
}
const views = {
  home,
  recipes: library,
  planner,
  grocery,
  favorites,
  finder,
  kitchen,
};

function render({ routeChange = false } = {}) {
  main.innerHTML = views[page]();
  if (page === "recipes") libraryResults();
  if (page === "finder" && state.finder.meal) finderResults();
  if (page === "kitchen" && state.kitchen) kitchenResults();
  document.querySelectorAll('.masthead a[href^="#"]').forEach((anchor) => {
    if (anchor.hash === "#" + page && !anchor.classList.contains("brand"))
      anchor.setAttribute("aria-current", "page");
    else anchor.removeAttribute("aria-current");
  });
  if (routeChange) {
    nav.classList.remove("open");
    menu.setAttribute("aria-expanded", "false");
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}
function route() {
  const hash = location.hash.slice(1);
  if (hash === "content") return;
  page = pages.includes(hash) ? hash : "home";
  if (modal.open) modal.close();
  render({ routeChange: true });
}
function updateFavorites(recipe) {
  const saved = favorite(recipe);
  state.favorites = saved
    ? state.favorites.filter((id) => id !== recipe.id)
    : [...state.favorites, recipe.id];
  save(saved ? "Removed from favorites." : "Saved to favorites.");
  if (page === "favorites") {
    render();
    (main.querySelector(".heart, .empty a") || main).focus();
  }
  document
    .querySelectorAll(
      '[data-action="favorite"][data-value="' + recipe.id + '"]',
    )
    .forEach((control) => {
      const replacement = document.createElement("template");
      replacement.innerHTML = heart(
        recipe,
        control.classList.contains("heart"),
      );
      const updated = replacement.content.firstElementChild;
      const focused = control === document.activeElement;
      control.replaceWith(updated);
      if (focused) updated.focus();
    });
}
function clearPlan(prefix) {
  for (const key of Object.keys(state.plan))
    if (!prefix || key.startsWith(prefix)) delete state.plan[key];
  save(prefix ? "Day cleared." : "Week reset.");
  modal.close();
  render();
  main.focus();
}
const actions = {
  view: (id) => details(byId.get(id)),
  add: (id) => planForm({ recipe: byId.get(id) }),
  slot: (key) => planForm({ key }),
  move: moveForm,
  favorite: (id) => updateFavorites(byId.get(id)),
  close: () => modal.close(),
  category: (value, control) => {
    filters.category = value;
    document
      .querySelectorAll('[data-action="category"]')
      .forEach((el) => el.setAttribute("aria-pressed", el === control));
    libraryResults();
  },
  tag: (value, control) => {
    if (filters.tags.has(value)) filters.tags.delete(value);
    else filters.tags.add(value);
    control.setAttribute("aria-pressed", filters.tags.has(value));
    libraryResults();
  },
  collection: (value) => {
    filters.category = "All";
    filters.query = "";
    filters.tags = new Set([value]);
    location.hash = "recipes";
  },
  "clear-filters": () => {
    filters.category = "All";
    filters.query = "";
    filters.tags.clear();
    render();
    document.querySelector("#recipe-search").focus();
  },
  "clear-day": (day) =>
    dialog(
      "Clear " + days[Number(day)] + "?",
      "<p>This removes the meals planned for this day.</p>" +
        btn("Clear day", "confirm-clear", day, "") +
        " " +
        btn("Cancel", "close"),
    ),
  "reset-week": () =>
    dialog(
      "Reset the week?",
      "<p>This removes every meal from your weekly planner.</p>" +
        btn("Reset week", "confirm-clear", "", "") +
        " " +
        btn("Cancel", "close"),
    ),
  "confirm-clear": (day) => clearPlan(day === "" ? "" : day + ":"),
  "remove-slot": (key) => {
    delete state.plan[key];
    save("Meal removed.");
    refreshSlot(key);
  },
  "remove-grocery": (key, control) => {
    const item = groceryItems().find((item) => item.key === key);
    if (key.startsWith("recipe:")) state.hidden[key] = item.signature;
    else state.custom = state.custom.filter((item) => item.key !== key);
    delete state.checked[key];
    save("Item removed.");
    const index = [
      ...main.querySelectorAll('[data-action="remove-grocery"]'),
    ].indexOf(control);
    render();
    const remaining = main.querySelectorAll('[data-action="remove-grocery"]');
    (
      remaining[Math.min(index, remaining.length - 1)] ||
      main.querySelector("#grocery-form input")
    ).focus();
  },
  "restore-grocery": () => {
    state.hidden = {};
    save("Recipe ingredients restored.");
    render();
    main.focus();
  },
  "copy-list": copyList,
  "print-list": () => window.print(),
};
function refreshSlot(key) {
  if (modal.open) modal.close();
  if (page === "planner") {
    render();
    main.querySelector('[data-slot="' + key + '"] button').focus();
  }
}
document.addEventListener("click", (event) => {
  const control = event.target.closest("[data-action]");
  if (control) actions[control.dataset.action](control.dataset.value, control);
});
menu.addEventListener("click", () =>
  menu.setAttribute("aria-expanded", nav.classList.toggle("open")),
);
document.addEventListener("input", (event) => {
  if (event.target.id === "recipe-search") {
    filters.query = event.target.value;
    libraryResults();
  }
});
document.addEventListener("change", (event) => {
  const target = event.target;
  if (target.form?.id === "plan-form") {
    if (target.name === "recipe" && target.value)
      target.form.servings.value = byId.get(target.value).servings;
    slotSummary(target.form);
  }
  if (target.dataset.grocery) {
    const item = groceryItems().find(
      (item) => item.key === target.dataset.grocery,
    );
    if (target.checked) state.checked[item.key] = item.signature;
    else delete state.checked[item.key];
    save();
  }
});
document.addEventListener("submit", (event) => {
  const form = event.target;
  const values = Object.fromEntries(new FormData(form));
  event.preventDefault();
  switch (form.id) {
    case "plan-form": {
      const key = form.dataset.fixed || values.day + ":" + values.meal;
      state.plan[key] = {
        id: values.recipe,
        servings: Number(values.servings),
      };
      save("Meal saved for " + slotName(key) + ".");
      refreshSlot(key);
      break;
    }
    case "move-form": {
      const key = values.day + ":" + values.meal;
      if (moveMeal(form.dataset.source, key)) refreshSlot(key);
      else refreshSlot(form.dataset.source);
      break;
    }
    case "grocery-form":
      if (!values.name.trim()) {
        form.elements.namedItem("name").value = "";
        form.reportValidity();
        break;
      }
      state.custom.push({
        key: "custom:" + (globalThis.crypto?.randomUUID?.() || Date.now()),
        name: values.name.trim(),
        group: values.group,
        quantity: values.quantity.trim(),
        amount: 0,
        unit: "",
      });
      save("Item added to your grocery list.");
      render();
      main.querySelector("#grocery-form input").focus();
      break;
    case "finder-form":
      state.finder = values;
      save();
      finderResults();
      break;
    case "kitchen-form":
      state.kitchen = values.ingredients.trim();
      save();
      kitchenResults();
      break;
  }
});
main.addEventListener("dragstart", (event) => {
  const button = event.target.closest(".meal[draggable=true]");
  if (!button) return;
  dragSource = button.dataset.value;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", dragSource);
});
main.addEventListener("dragover", (event) => {
  const slot = event.target.closest("[data-slot]");
  if (!slot || !dragSource) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = "move";
  slot.classList.add("over");
});
main.addEventListener("dragleave", (event) => {
  const slot = event.target.closest("[data-slot]");
  if (slot && !slot.contains(event.relatedTarget))
    slot.classList.remove("over");
});
main.addEventListener("drop", (event) => {
  const slot = event.target.closest("[data-slot]");
  if (!slot || !dragSource) return;
  event.preventDefault();
  const key = slot.dataset.slot;
  slot.classList.remove("over");
  if (moveMeal(dragSource, key)) refreshSlot(key);
  dragSource = null;
});
main.addEventListener("dragend", () => {
  dragSource = null;
  main
    .querySelectorAll(".over")
    .forEach((slot) => slot.classList.remove("over"));
});
document.addEventListener(
  "error",
  (event) => {
    if (event.target.tagName !== "IMG" || event.target.dataset.fallback) return;
    event.target.dataset.fallback = "true";
    event.target.src = "./assets/hero.webp";
  },
  true,
);
window.addEventListener("hashchange", route);
route();
