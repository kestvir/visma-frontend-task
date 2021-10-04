let pizzas = loadPizzas() || [];
let activePizzaName = "";

const form = document.querySelector(".add-pizza-form");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const heatInput = document.getElementById("heat");
const toppingsTextarea = document.getElementById("toppings");
const images = document.querySelector(".add-pizza-form__images");
const pizzasContainer = document.querySelector(".pizzas");
const pizzasList = document.querySelector(".pizzas__list");
const modal = document.querySelector(".modal");
const modalClose = document.querySelector(".modal__close");
const cancelDeleteButton = document.querySelector(".modal__cancel-button");
const modalButtons = document.querySelector(".modal__buttons");
const sortSelect = document.querySelector(".pizzas__sort-select");

/////////////////////////// Session storage
function persistPizzas() {
  sessionStorage.setItem("pizzas", JSON.stringify(pizzas));
}

function loadPizzas() {
  const parsedPizzas = JSON.parse(sessionStorage.getItem("pizzas"));

  if (parsedPizzas) {
    return parsedPizzas.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/////////////////////////// Get checked elements and values
function getCheckedImages() {
  return images.querySelectorAll("input[type=checkbox]:checked");
}

function getCheckedImageSrc() {
  const checkedElements = getCheckedImages();

  return checkedElements.length === 1 ? checkedElements[0].value : "";
}

/////////////////////////// Uncheck
function uncheckImage() {
  const checkedImage = images.querySelector("input[type=checkbox]:checked");
  if (checkedImage) checkedImage.checked = false;
}

function uncheckPrevImage(event) {
  if (event.target.type === "checkbox") {
    const checkedImages = getCheckedImages();

    if (checkedImages.length > 1) {
      const prevCheckedImage = Array.from(checkedImages).find((element) => {
        if (element.value !== event.target.value) return element;
      });

      prevCheckedImage.checked = false;
    }
  }
}

/////////////////////////// Add
function addPizza(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const price = priceInput.value;
  const toppings = getToppingsArray();
  const validationArray = validateForm(name, price, toppings);

  if (validationArray.some((isError) => isError === false)) return;

  const heat = heatInput.value || 1;
  const image = getCheckedImageSrc();

  const pizza = {
    createdAt: Date.now(),
    name: name.trim(),
    price: parseFloat(price).toFixed(2),
    heat: parseInt(heat),
    toppings,
    image,
  };

  pizzas.push(pizza);
  persistPizzas();
  clearForm();
  renderPizzas();
  alert(`Pizza ${pizza.name} added!`);
}

//////////////////////////// Delete
function deletePizza() {
  const pizza = document.querySelector(`[data-name='${activePizzaName}']`);

  pizza.remove();
  pizzas = pizzas.filter((pizza) => pizza.name !== activePizzaName);

  persistPizzas();
  checkIfRenderPizzasContainer();

  activePizzaName = "";
  modal.style.display = "none";
}

/////////////////////////// Render
function renderPizza(pizza) {
  const pizzasList = document.querySelector(".pizzas__list");
  const node = document.createElement("li");
  const placeholderImageSrc =
    "https://www.theyearinpictures.co.uk/images//image-placeholder.png";
  const pepperMarkup = `<img src="assets/pepper.svg" alt="chilli pepper icon"/>`;

  node.setAttribute("data-name", pizza.name);

  const cardMarkup = `<div class="pizza-card">
  <img src=${
    pizza.image ? pizza.image : placeholderImageSrc
  } class="pizza-card__image image" alt="${pizza.name} image"/>
      <div class="pizza-card__body">
        <h4 class="pizza-card__name"><b>${pizza.name}</b></h4>
        <p class="pizza-card__price">${pizza.price} &#8364;</p>
        <p class="pizza-card__heat">${pepperMarkup.repeat(pizza.heat)}</p>
        <p class="pizza-card__toppings">${pizza.toppings.join(", ")}</p>
        <button class="pizza-card__delete-button button">Delete</button>
      </div>
    </div>`;

  node.innerHTML = cardMarkup;
  pizzasList.append(node);
}

function renderPizzas() {
  pizzasList.innerHTML = "";

  sortPizzas();
  pizzas.forEach((pizza) => {
    renderPizza(pizza);
  });
  checkIfRenderPizzasContainer();
}

/////////////////////////// Validation
function isValidName(nameValue) {
  const nameError = document.querySelector(".name-error");
  let errorMessage = "";

  if (!nameValue) {
    errorMessage = "Name cannot be empty.";
  } else if (nameValue.length > 30) {
    errorMessage = "Name cannot exceed 30 characters.";
  } else if (pizzas.find((pizza) => pizza.name === nameValue)) {
    errorMessage = "Pizza names have to be unique.";
  }

  nameError.innerHTML = errorMessage;
  toggleValidationErrorDisplay(errorMessage, nameError, nameInput);

  if (errorMessage) return false;
  return true;
}

function isValidPrice(priceValue) {
  const priceError = document.querySelector(".price-error");
  let errorMessage = "";

  if (priceValue === "") {
    errorMessage = "Price cannot be empty.";
  } else if (parseFloat(priceValue) <= 0) {
    errorMessage = "Price has to be more than 0.";
  }

  priceError.innerHTML = errorMessage;
  toggleValidationErrorDisplay(errorMessage, priceError, priceInput);

  if (errorMessage) return false;
  return true;
}

function isValidToppings(toppingsArray) {
  const toppingsError = document.querySelector(".toppings-error");
  let errorMessage = "";

  if (toppingsArray.length < 2) {
    errorMessage = "At least two kinds of unique toppings have to be entered.";
  }

  toppingsError.innerHTML = errorMessage;
  toggleValidationErrorDisplay(errorMessage, toppingsError, toppingsTextarea);

  if (errorMessage) return false;
  return true;
}

function validateForm(nameValue, priceValue, toppingsArray) {
  return [
    isValidName(nameValue),
    isValidPrice(priceValue),
    isValidToppings(toppingsArray),
  ];
}

function toggleValidationErrorDisplay(errorMessage, errorElement, formElement) {
  if (errorMessage) {
    errorElement.setAttribute("aria-invalid", true);
    errorElement.style.display = "block";
    formElement && formElement.classList.add("invalid");
  } else {
    errorElement.setAttribute("aria-hidden", false);
    errorElement.style.display = "none";
    formElement && formElement.classList.remove("invalid");
  }
}

//////////////////////////// Clear form
function clearForm() {
  nameInput.value = "";
  priceInput.value = "";
  heat.value = "";
  toppingsTextarea.value = "";

  uncheckImage();
}

//////////////////////////// Modal
function closeModal(event) {
  if (
    event.target === modal ||
    event.target === modalClose ||
    event.target === cancelDeleteButton
  ) {
    modal.style.display = "none";
  }
}

function openModal(event) {
  if (event.target.classList.contains("pizza-card__delete-button")) {
    const pizzaName = event.target.closest("li").dataset.name;

    modal.style.display = "block";
    modal.querySelector(
      ".modal__text"
    ).innerHTML = `Are you sure you want to delete ${pizzaName}?`;

    activePizzaName = pizzaName;
  }
}

function modalAction(event) {
  if (event.target.classList.contains("modal__delete-button")) {
    deletePizza();
  } else if (event.target.classList.contains("modal__cancel")) {
    activePizzaName = "";
  }
}

//////////////////////////// Sort
function sortAlphabeticallyAZ() {
  pizzas.sort((a, b) => a.name.localeCompare(b.name));
}

function sortAlphabeticallyZA() {
  pizzas.sort((a, b) => b.name.localeCompare(a.name));
}

function sortByHeatLowerHigher() {
  pizzas.sort((a, b) => a.heat - b.heat);
}

function sortByHeatHigherLower() {
  pizzas.sort((a, b) => b.heat - a.heat);
}

function sortByPriceLowerHigher() {
  pizzas.sort((a, b) => a.price - b.price);
}

function sortByPriceHigherLower() {
  pizzas.sort((a, b) => b.price - a.price);
}

function sortPizzas() {
  switch (sortSelect.value) {
    case "a-z":
      sortAlphabeticallyAZ();
      break;
    case "z-a":
      sortAlphabeticallyZA();
      break;
    case "lh-mh":
      sortByHeatLowerHigher();
      break;
    case "mh-lh":
      sortByHeatHigherLower();
      break;
    case "pl-ph":
      sortByPriceLowerHigher();
      break;
    case "ph-pl":
      sortByPriceHigherLower();
      break;
  }
}

//////////////////////////// Toggle pizza container display
function checkIfRenderPizzasContainer() {
  if (pizzas.length) pizzasContainer.style.display = "block";
  else pizzasContainer.style.display = "none";
}

//////////////////////////  Get toppings array
function getToppingsArray() {
  const toppingArray = toppingsTextarea.value
    .split(",")
    .map((topping) => topping.trim());
  const filteredArray = toppingArray.filter(Boolean);
  const uniqueToppingsArray = Array.from(new Set(filteredArray));

  return uniqueToppingsArray;
}

form.addEventListener("submit", addPizza);
images.addEventListener("click", uncheckPrevImage);
window.addEventListener("click", closeModal);
pizzasList.addEventListener("click", openModal);
modalClose.addEventListener("click", closeModal);
modalButtons.addEventListener("click", modalAction);
sortSelect.addEventListener("change", renderPizzas);
document.addEventListener("DOMContentLoaded", renderPizzas);
