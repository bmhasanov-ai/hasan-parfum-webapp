let catalog = [];
let cart = [];

const tg = (typeof Telegram !== "undefined" && Telegram.WebApp) ? Telegram.WebApp : null;

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
  if (page === "cart") openCart();
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
        <img src="${item.images[0] || ""}" alt="${item.name}">
        <h3>${item.name}</h3>
        <p>${item.brand}</p>
        <div class="badge-row">
          ${item.category ? `<span class="badge">${item.category}</span>` : ""}
          ${item.season ? `<span class="badge">${item.season}</span>` : ""}
          ${item.daytime ? `<span class="badge">${item.daytime}</span>` : ""}
        </div>
        <span class="price">от ${item.prices["5"] || ""} ₽</span>
      </div>
    `)
    .join("");
}

function openProduct(id) {
  const p = catalog.find(x => x.id === id);
  const content = document.getElementById("content");

  content.innerHTML = `
    <div class="product-images">
      ${p.images.map(img => `<img src="${img}" alt="${p.name}">`).join("")}
    </div>

    <h2>${p.name}</h2>
    <h4>${p.brand}</h4>

    <div class="badge-row">
      ${p.category ? `<span class="badge">${p.category}</span>` : ""}
      ${p.season ? `<span class="badge">${p.season}</span>` : ""}
      ${p.daytime ? `<span class="badge">${p.daytime}</span>` : ""}
    </div>

    <h3 class="section-title">Описание</h3>
    <p class="description">${p.description}</p>

    <h3 class="section-title">Ноты</h3>
    <p class="notes">${p.notes}</p>

    <h3 class="section-title">Выберите объём</h3>
    <div class="choose-volume">
      ${Object.entries(p.prices)
        .filter(([vol, price]) => price)
        .map(
          ([vol, price]) =>
            `<button onclick="addToCart('${id}', ${vol}, ${price})">${vol} мл — ${price} ₽</button>`
        ).join("")}
    </div>

    <button class="primary-btn" onclick="openCart()">Перейти в корзину</button>
  `;
}

function addToCart(id, volume, price) {
  const product = catalog.find(x => x.id === id);
  cart.push({ id, volume, price, name: product.name, brand: product.brand });

  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("medium");
  }
  openCart();
}

function openCart() {
  const content = document.getElementById("content");

  if (cart.length === 0) {
    content.innerHTML = "<p>Ваша корзина пуста.</p>";
    return;
  }

  let total = cart.reduce((s, i) => s + (i.price || 0), 0);

  content.innerHTML = `
    <h2>Ваш заказ</h2>
    ${cart
      .map(
        (item, idx) => `
        <div class="cart-item">
          <span><b>${item.name}</b> (${item.brand})</span>
          <span>${item.volume} мл — ${item.price} ₽</span>
        </div>
      `
      )
      .join("")}

    <h3>Итого: ${total} ₽</h3>

    <button class="primary-btn" onclick="sendOrder()">Отправить заказ администратору</button>
  `;
}

function sendOrder() {
  if (tg) {
    tg.sendData(JSON.stringify(cart));
    tg.close();
  } else {
    alert("Заказ будет отправлен администратору через Telegram WebApp.");
  }
}

function renderAbout() {
  document.getElementById("content").innerHTML = `
    <div class="about-block">
      <h3>Кто мы и что за продукт мы производим 🌿</h3>
      <p>Всё началось с того, что мы с товарищем решили приобрести себе парфюм и занялись поиском того, где бы можно было купить хорошие ароматы по доступной цене.</p>
      <p>Результаты поисков нас не очень удовлетворили: где-то было откровенно дорого, а где-то — совсем некачественно. А самое интересное — не только мы одни были в поисках!</p>
      <p>Тогда мы решили попробовать закупить сырьё самостоятельно — порадовать себя и знакомых. Начали с малого, но этого нам хватило, чтобы понять: это то, чего не хватает людям.</p>
      <p>Мы решили пробовать дальше. Закупали снова и снова, экспериментировали с концентрацией и компонентами, проверяли заводы и поставщиков.</p>
      <p>У нас было много обратной связи — наверное, каждый третий из нашего окружения приобрёл наш продукт. И это стоило того. Мы проработали ошибки, прочувствовали сырьё и желания людей.</p>
      <p>Теперь мы решили выйти в массы и совершенствоваться дальше. Главное для нас — сделать наших покупателей хоть чуть счастливее, оставить их довольными, сделать мир немного лучше.</p>
      <p>Присоединяйтесь к нам, к числу этих счастливых, и помогите нам стать лучше 🤍</p>

      <h3>Как мы создаём парфюм 🌿</h3>
      <p>У нас всё довольно просто и понятно. Мы закупаем концентраты ароматов в виде масел, фиксатор аромата и парфюмерную воду. По проверенной формуле смешиваем все компоненты и разливаем во флаконы.</p>
      <p>Хоть каждый элемент важен, главный из них — разумеется, масло. Мы нашли для себя лучших представителей в этой отрасли — <a href="https://luzi.ru/" target="_blank">LUZI</a> и <a href="https://www.robertet.com/en/accueil-en/" target="_blank">ROBERTET</a>. Это профессионалы в создании парфюмерии, и большинство нашей продукции производится на их маслах.</p>
      <p>Также среди нашей продукции есть масла производства <a href="https://www.symrise.com/scent-and-care/fragrance/" target="_blank">Symrise</a>, <a href="https://cplaromas.com/" target="_blank">CPL</a>, <a href="https://epsfragrances.com/" target="_blank">EPS</a>, <a href="https://www.iff.com/" target="_blank">IFF</a>, <a href="https://www.takasago.com/en/fragrances" target="_blank">Takasago</a> и <a href="https://www.givaudan.com/" target="_blank">Givaudan</a>. Они приятно удивляют нас своим качеством, и среди них мы берём в производство только лучшее ✨</p>
      <p>Как вы уже могли понять — мы закупаем ароматы по мотивам известных брендов. Эти ароматы проверены временем и влюбили в себя миллионы.</p>
      <p>Благодаря нам у вас есть возможность наслаждаться этими ароматами — доступно, качественно и с душой, как для самих себя 🤍</p>
    </div>
`;
}

function renderContact() {
  document.getElementById("content").innerHTML = `
    <h2>Контакты</h2>
    <p>Связаться с администратором:</p>
    <p><a href="https://t.me/Hasan_parfum_admin" target="_blank">@Hasan_parfum_admin</a></p>
  `;
}
