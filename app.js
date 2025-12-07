let catalog = [];
let cart = [];
let currentGenderFilter = "all";
let currentMainImage = null;
let currentSelectedVolume = null;
let currentSelectedType = null;

const tg = (typeof Telegram !== "undefined" && Telegram.WebApp) ? Telegram.WebApp : null;

async function loadCatalog() {
  const res = await fetch("catalog.json");
  const data = await res.json();
  catalog = data.products;
  return catalog;
}

document.addEventListener("DOMContentLoaded", () => {
  loadCatalog().then(() => renderCatalog());

  document.querySelectorAll("#menu button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll("#menu button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      setPage(btn.dataset.page);
    };
  });

  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentGenderFilter = btn.dataset.gender;
      renderCatalog();
    };
  });
});

function setPage(page) {
  if (page === "catalog") renderCatalog();
  if (page === "about") renderAbout();
  if (page === "contact") renderContact();
  if (page === "cart") openCart();
}

function getFilteredCatalog() {
  if (currentGenderFilter === "all") return catalog;
  return catalog.filter(p => p.gender === currentGenderFilter);
}

function renderCatalog() {
  const content = document.getElementById("content");
  const items = getFilteredCatalog();

  if (!items || items.length === 0) {
    content.innerHTML = "<p>Нет ароматов для выбранной категории.</p>";
    return;
  }

  content.innerHTML = `
    <div class="catalog-grid">
      ${items.map(item => `
        <div class="product-card" onclick="openProduct('${item.id}')">
          <img src="${item.images[0] || ""}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>${item.brand}</p>
          <div class="badge-row">
            ${item.category_raw ? `<span class="badge">${item.category_raw}</span>` : ""}
            ${item.season ? `<span class="badge">${item.season}</span>` : ""}
            ${item.daytime ? `<span class="badge">${item.daytime}</span>` : ""}
          </div>
          <span class="price">от ${item.prices.perfume["5"] || item.prices.oil["3"] || ""} ₽</span>
        </div>
      `).join("")}
    </div>
  `;
}

function openProduct(id) {
  const p = catalog.find(x => x.id === id);
  const content = document.getElementById("content");

  currentSelectedVolume = null;
  currentSelectedType = null;

  const images = p.images && p.images.length ? p.images : [""];
  currentMainImage = images[0];

  content.innerHTML = `
    <div class="product-page">
      <div class="product-hero">
        <img src="${currentMainImage}" class="product-main-img" id="main-image" alt="${p.name}">
        <div class="thumb-row">
          ${images.map((img, idx) => `
            <img src="${img}" class="${idx === 0 ? "active" : ""}" onclick="setMainImage('${img}', this)" alt="${p.name}">
          `).join("")}
        </div>
      </div>

      <h2>${p.name}</h2>
      <h4>${p.brand}</h4>

      <div class="badge-row-large">
        ${p.category_raw ? `<span class="badge-large">${p.category_raw}</span>` : ""}
        ${p.season ? `<span class="badge-large">${p.season}</span>` : ""}
        ${p.daytime ? `<span class="badge-large">${p.daytime}</span>` : ""}
      </div>

      <div>
        <div class="section-title">Описание</div>
        <p class="description">${p.description}</p>
      </div>

      <div>
        <div class="section-title">Ноты</div>
        <p class="notes">${p.notes}</p>
      </div>

      <div class="volume-section">
        <div class="section-title">Выбор объёма</div>

        <div class="volume-group">
          <div class="volume-group-title">Масло</div>
          <div class="volume-buttons">
            ${Object.entries(p.prices.oil)
              .filter(([vol, price]) => price)
              .map(([vol, price]) => `
                <button class="volume-btn" data-type="oil" data-vol="${vol}" onclick="selectVolume('${id}', 'oil', '${vol}', ${price}, this)">
                  ${vol} мл — ${price} ₽
                </button>
              `).join("")}
          </div>
        </div>

        <div class="volume-group">
          <div class="volume-group-title">Духи</div>
          <div class="volume-buttons">
            ${Object.entries(p.prices.perfume)
              .filter(([vol, price]) => price)
              .map(([vol, price]) => `
                <button class="volume-btn" data-type="perfume" data-vol="${vol}" onclick="selectVolume('${id}', 'perfume', '${vol}', ${price}, this)">
                  ${vol} мл — ${price} ₽
                </button>
              `).join("")}
          </div>
        </div>

        <button class="primary-btn" id="add-to-cart-btn" onclick="handleAddToCart('${id}')">Добавить в корзину</button>
      </div>
    </div>
  `;
}

function setMainImage(img, thumbEl) {
  currentMainImage = img;
  const main = document.getElementById("main-image");
  if (main) main.src = img;

  document.querySelectorAll(".thumb-row img").forEach(t => t.classList.remove("active"));
  if (thumbEl) thumbEl.classList.add("active");
}

function selectVolume(id, type, volume, price, btnEl) {
  currentSelectedType = type;
  currentSelectedVolume = { id, type, volume, price };

  document.querySelectorAll(".volume-btn").forEach(b => b.classList.remove("active"));
  if (btnEl) btnEl.classList.add("active");

  const addBtn = document.getElementById("add-to-cart-btn");
  if (addBtn && addBtn.classList.contains("secondary")) {
    addBtn.classList.remove("secondary");
    addBtn.textContent = "Добавить в корзину";
  }
}

function handleAddToCart(id) {
  const addBtn = document.getElementById("add-to-cart-btn");
  const p = catalog.find(x => x.id === id);

  if (!currentSelectedVolume) {
    if (addBtn) {
      addBtn.classList.add("secondary");
    }
    alert("Пожалуйста, выберите объём перед добавлением в корзину.");
    return;
  }

  const { type, volume, price } = currentSelectedVolume;

  cart.push({
    id,
    type,
    volume,
    price,
    name: p.name,
    brand: p.brand
  });

  if (addBtn) {
    addBtn.textContent = "Добавлено в корзину";
  }

  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred("medium");
  }
}

function openCart() {
  const content = document.getElementById("content");

  if (!cart.length) {
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
          <span>${item.type === "oil" ? "Масло" : "Духи"}, ${item.volume} мл — ${item.price} ₽</span>
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
