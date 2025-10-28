const qInput = document.getElementById('q');
const searchBtn = document.getElementById('searchBtn');
const resultsEl = document.getElementById('results');
const listEl = document.getElementById('shoppingList');
const clearBtn = document.getElementById('clear');

function renderList() {
  const list = JSON.parse(localStorage.getItem('shoppingList') || '[]');
  listEl.innerHTML = '';
  list.forEach((it, idx) => {
    const li = document.createElement('li');
    li.textContent = `${it.title} ${it.price ? '('+it.price+')' : ''}`;
    const rem = document.createElement('button');
    rem.textContent = 'Kaldır';
    rem.style.marginLeft='8px';
    rem.onclick = () => {
      list.splice(idx,1);
      localStorage.setItem('shoppingList', JSON.stringify(list));
      renderList();
    };
    li.appendChild(rem);
    listEl.appendChild(li);
  });
}
clearBtn.onclick = () => { localStorage.removeItem('shoppingList'); renderList(); };

function addToList(item) {
  const list = JSON.parse(localStorage.getItem('shoppingList') || '[]');
  list.push(item);
  localStorage.setItem('shoppingList', JSON.stringify(list));
  renderList();
}

async function search(q) {
  resultsEl.innerHTML = 'Aranıyor...';
  try {
    const res = await fetch(`/.netlify/functions/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) {
      resultsEl.innerHTML = `<div>Hata: ${res.status}</div>`;
      return;
    }
    const data = await res.json();
    const items = data.items || [];
    resultsEl.innerHTML = '';
    if (items.length === 0) {
      resultsEl.innerHTML = '<div>Sonuç bulunamadı.</div>';
      return;
    }
    items.forEach(it => {
      const card = document.createElement('div');
      card.className = 'card';
      const img = document.createElement('img');
      img.src = it.image || 'https://via.placeholder.com/64x64?text=?';
      const meta = document.createElement('div');
      const h = document.createElement('div');
      h.textContent = it.title;
      const p = document.createElement('div');
      p.textContent = (it.market ? it.market + ' • ' : '') + (it.price || '');
      const btn = document.createElement('button');
      btn.textContent = 'Listeye ekle';
      btn.onclick = () => addToList(it);
      meta.appendChild(h); meta.appendChild(p); meta.appendChild(btn);
      card.appendChild(img); card.appendChild(meta);
      resultsEl.appendChild(card);
    });
  } catch (err) {
    resultsEl.innerHTML = `<div>Hata: ${err.message}</div>`;
  }
}

searchBtn.onclick = () => {
  const q = qInput.value.trim();
  if (!q) return alert('Lütfen arama terimi girin.');
  search(q);
};

renderList();
