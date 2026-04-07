let produtos = [];
let carrinho = [];
let produtoSelecionado = null;

const lista = document.getElementById('lista-produtos');

/* CARREGAR PRODUTOS */
fetch('produtos.json')
  .then(response => response.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
  });

/* VITRINE */
function renderizarProdutos() {
  lista.innerHTML = '';

  produtos.forEach((p, index) => {
    let imagens = p.imagens || [p.imagem];

    lista.innerHTML += `
      <div class="produto">
        <img 
          src="${imagens[0]}" 
          onclick="abrirImagemFull(${index})"
        >
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${index})">Comprar</button>
      </div>
    `;
  });
}

/* MODAL PRODUTO */
function abrirModal(index) {
  produtoSelecionado = produtos[index];

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;

  const container = document.getElementById("modal-imagens");

  let imagens = produtoSelecionado.imagens || [produtoSelecionado.imagem];

  container.innerHTML = `
    <img id="img-principal" src="${imagens[0]}" style="width:100%">

    <div style="display:flex; gap:10px;">
      ${imagens.map(img => `
        <img src="${img}" onclick="trocarImagem('${img}')" style="width:60px">
      `).join("")}
    </div>
  `;
}

function trocarImagem(src) {
  document.getElementById("img-principal").src = src;
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

/* ===== TELA CHEIA ===== */

let imagensAtuais = [];
let indexAtual = 0;

function abrirImagemFull(index) {
  let produto = produtos[index];

  imagensAtuais = produto.imagens || [produto.imagem];
  indexAtual = 0;

  document.getElementById("modal-imagem-full").style.display = "flex";

  atualizarImagemFull();
}

function atualizarImagemFull() {
  document.getElementById("img-full").src = imagensAtuais[indexAtual];

  document.getElementById("miniaturas").innerHTML =
    imagensAtuais.map((img, i) => `
      <img src="${img}" onclick="irParaImagem(${i})" style="width:50px">
    `).join("");
}

function irParaImagem(i) {
  indexAtual = i;
  atualizarImagemFull();
}

function fecharImagemFull() {
  document.getElementById("modal-imagem-full").style.display = "none";
}

/* SWIPE */
let startX = 0;

document.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

document.addEventListener("touchend", e => {
  let endX = e.changedTouches[0].clientX;

  if (startX - endX > 50) {
    indexAtual = (indexAtual + 1) % imagensAtuais.length;
  } else if (endX - startX > 50) {
    indexAtual = (indexAtual - 1 + imagensAtuais.length) % imagensAtuais.length;
  }

  atualizarImagemFull();
});
