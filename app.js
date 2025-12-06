let catalog = [];
let cart = [];

async function loadCatalog() {
  const res = await fetch("catalog.json");
  const data = await res.json();
  catalog = data.products;
  return catalog;
}

function setPage(page) {
  if (page === "catalog") renderCatalog();
  if (page === "about") renderAbout();
  if (page === "contact") renderContact();
}

document.addEventListener("DOMContentLoaded", () => {
  loadCatalog().then(() => renderCatalog());

  document.querySelectorAll("#menu button").forEach(btn => {
    btn.onclick = () => setPage(btn.dataset.page);
  });
});

function renderCatalog() {
  const content = document.getElementById("content");
  content.innerHTML = catalog
    .map(item => `
      <div class="product-card" onclick="openProduct('${item.id}')">
        <img src="${item.images[0] || ''}" />
        <h3>${item.name}</h3>
        <p>${item.brand}</p>
        <span class="price">от ${item.prices["5"]} ₽</span>
      </div>
    `)
    .join("");
}

function openProduct(id) {
  const p = catalog.find(x => x.id === id);
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="product-images">
      ${p.images.map(img => `<img src="${img || ''}">`).join("")}
    </div>

    <h2>${p.name}</h2>
    <h4>${p.brand}</h4>

    <p>${p.description}</p>
    <div class="notes">${p.notes}</div>
    <p><b>Сезон:</b> ${p.season}</p>
    <p><b>Время суток:</b> ${p.daytime}</p>

    <h3>Выберите объём</h3>
    <div class="choose-volume">
      ${Object.entries(p.prices).map(
        ([vol, price]) =>
          `<button onclick="addToCart('${id}', ${vol}, ${price})">${vol} мл — ${price} ₽</button>`
      ).join("")}
    </div>
  `;
}

function addToCart(id, volume, price) {
  cart.push({ id, volume, price });
  Telegram.WebApp.HapticFeedback.impactOccurred("medium");
  openCart();
}

function openCart() {
  const content = document.getElementById("content");

  if (cart.length === 0) {
    content.innerHTML = "<p>Корзина пуста</p>";
    return;
  }

  let total = cart.reduce((s, i) => s + i.price, 0);

  content.innerHTML = `
    <h2>Ваш заказ</h2>
    ${cart
      .map(
        item => `
        <p>${item.volume} мл — ${item.price} ₽</p>
      `
      )
      .join("")}

    <h3>Итого: ${total} ₽</h3>

    <button onclick="sendOrder()">Отправить заказ</button>
  `;
}

function sendOrder() {
  Telegram.WebApp.sendData(JSON.stringify(cart));
}

function renderAbout() {
  document.getElementById("content").innerHTML = `
    <h2>О нас</h2>
    <p>Hasan Parfum — ароматы с душой. Создаём премиальную парфюмерию на маслах LUZI, Robertet и других мировых производителей.</p>
  `;
}

function renderContact() {
  document.getElementById("content").innerHTML = `
    <h2>Контакты</h2>
    <p>Связаться с администратором:</p>
    <a href="https://t.me/Hasan_parfum_admin" style="color: var(--gold);">Написать</a>
  `;
}
