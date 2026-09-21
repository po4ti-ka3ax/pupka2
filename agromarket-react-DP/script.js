const btn = document.querySelector(`#greetBtn`);
const btnTheme = document.querySelector(`#themeBtn`);
const btnShow = document.querySelector(`#showBtn`);
const title = document.querySelector(`h1`);

let countClick = 0;

let cartClick = 0;
let hasError = false;

btn.addEventListener("click", function () {
  btn.textContent = "Привет!";
  countClick += 1;
});

btnShow.addEventListener("click", function () {
  alert(`Кнопка была нажата - ${countClick} раз`);
});

btnTheme.addEventListener("click", function () {
  if (document.body.style.backgroundColor === "rgb(34, 34, 34)") {
    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    currentTheme.textContent = "Светлая";
  } else {
    document.body.style.backgroundColor = "#111111";
    document.body.style.color = "#fff";
    currentTheme.textContent = "Темная";
  }
});

async function loadProducts() {
  try {
    const response = await fetch("http://localhost:3001/products");
    const products = await response.json();
    renderProducts(products);
  } catch (error) {
    hasError = !hasError;
  }
}

function renderProducts(products) {
  const catalog = document.querySelector(".catalog");
  if (!hasError) {
    products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.price} тг</p>
      <button>В корзину</button>
    `;
      const itemCount = document.querySelector("#items_count");
      const cartCount = document.querySelector("#cart_count");
      card.querySelector("button").addEventListener("click", function () {
        cartClick++;

        cartCount.textContent = `В корзине: ${cartClick}`;
      });
      itemCount.textContent = `Количество товаров: ${products.length}`;
      catalog.appendChild(card);
    });

  } else {
    const hasNoElement = document.createElement("p").textContent = "Данные отсутствуют"
    catalog.appendChild(hasNoElement)
  }
}

loadProducts();
