let produtos = [];
let carrinho = [];
let produtoSelecionado = null;

const lista = document.getElementById('lista-produtos');

/* VISUALIZAR IMAGEM */
function verImagem(src) {
  window.open(src, "_blank");
}

/* CARREGAR PRODUTOS */
fetch('produtos.json')
  .then(response => response.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
  });

/* RENDERIZAR PRODUTOS — UMA IMAGEM */
function renderizarProdutos() {
  lista.innerHTML = '';

  produtos.forEach((p, index) => {
    lista.innerHTML += `
      <div class="produto">
        <img src="${p.imagem}" alt="${p.nome}" onclick="verImagem('${p.imagem}')">
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${index})">Comprar</button>
      </div>
    `;
  });
}

/* MODAL */
function abrirModal(index) {
  produtoSelecionado = produtos[index];
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;

  document.getElementById("cor").innerHTML =
    produtoSelecionado.cores.split(",").map(c => `<option>${c.trim()}</option>`).join("");

  document.getElementById("tamanho").innerHTML =
    produtoSelecionado.tamanhos.split(",").map(t => `<option>${t.trim()}</option>`).join("");
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

/* CARRINHO */
function adicionarCarrinho() {
  carrinho.push({
    nome: produtoSelecionado.nome,
    preco: produtoSelecionado.preco,
    valor: parseFloat(produtoSelecionado.preco.replace("R$", "").replace(",", ".")),
    cor: document.getElementById("cor").value,
    tamanho: document.getElementById("tamanho").value
  });

  document.getElementById("contador-carrinho").innerText = carrinho.length;
  fecharModal();
}

/* EXPOR FUNÇÕES */
window.abrirModal = abrirModal;
window.fecharModal = fecharModal;
window.adicionarCarrinho = adicionarCarrinho;
