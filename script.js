let produtos = [];
let carrinho = [];
let produtoSelecionado = null;
function verImagem(src) {
   window.open(src, "_blank");
}
const lista = document.getElementById('lista-produtos');

/* ===============================
   CARREGAR PRODUTOS DO JSON
================================ */
fetch('produtos.json')
  .then(response => response.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
  })
  .catch(error => console.error('Erro ao carregar produtos:', error));

/* ===============================
   RENDERIZAR PRODUTOS
================================ */
function renderizarProdutos() {
  lista.innerHTML = '';
  produtos.forEach((p, index) => {
  let imagensHTML = '';

if (p.imagens && p.imagens.length > 1) {
  imagensHTML = `
    <img src="${p.imagens[0]}" alt="${p.nome}" onclick="verImagem('${p.imagens[0]}')">
    <img src="${p.imagens[1]}" alt="${p.nome}" onclick="verImagem('${p.imagens[1]}')">
  `;
} else {
  const img = p.imagem || p.imagens?.[0];
  imagensHTML = `
    <img src="${img}" alt="${p.nome}" onclick="verImagem('${img}')">
  `;
}

lista.innerHTML += `
  <div class="produto">
    ${imagensHTML}
    <h3>${p.nome}</h3>
    <p>${p.preco}</p>
    <p><strong>Cores:</strong> ${p.cores}</p>
    <p><strong>Tamanhos:</strong> ${p.tamanhos}</p>
    <button onclick="abrirModal(${index})">Comprar</button>
  </div>
`;
    `;
  });
}

/* ===============================
   MODAL DO PRODUTO
================================ */
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

/* ===============================
   ADICIONAR AO CARRINHO
================================ */
function adicionarCarrinho() {
  if(!produtoSelecionado) return;

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

/* ===============================
   ABRIR / FECHAR CARRINHO
================================ */
function abrirCarrinho() {
  const listaCarrinho = document.getElementById("lista-carrinho");
  listaCarrinho.innerHTML = "";

  if (carrinho.length === 0) {
    listaCarrinho.innerHTML = "<p>Seu carrinho está vazio</p>";
  } else {
    carrinho.forEach((item, index) => {
      listaCarrinho.innerHTML += `
        <p>
          <strong>${item.nome}</strong><br>
          Cor: ${item.cor} | Tamanho: ${item.tamanho}<br>
          Preço: ${item.preco}<br>
          <button onclick="removerItem(${index})">❌ Remover</button>
        </p>
        <hr>
      `;
    });
  }

  atualizarTotal();
  document.getElementById("modal-carrinho").style.display = "flex";
}

function fecharCarrinho() {
  document.getElementById("modal-carrinho").style.display = "none";
}

/* ===============================
   REMOVER ITEM
================================ */
function removerItem(index) {
  carrinho.splice(index, 1);
  document.getElementById("contador-carrinho").innerText = carrinho.length;
  abrirCarrinho();
}

/* ===============================
   TOTAL + ENTREGA / RETIRADA
================================ */
function atualizarTotal() {
  let total = carrinho.reduce((soma, item) => soma + item.valor, 0);

  const entregaSelecionada = document.querySelector('input[name="recebimento"]:checked');
  if(entregaSelecionada && entregaSelecionada.value === "entrega") {
    total += 10;
  }

  document.getElementById("total-final").innerText = total.toFixed(2);
}

/* ===============================
   FINALIZAR NO WHATSAPP
================================ */
function finalizarWhatsApp() {
  if(carrinho.length === 0){
    alert("Seu carrinho está vazio");
    return;
  }

  let mensagem = "🛍️ Pedido Bella Flor:%0A%0A";
  let total = carrinho.reduce((soma, item) => soma + item.valor, 0);

  carrinho.forEach((item, i) => {
    mensagem += `${i+1}. ${item.nome}%0A`;
    mensagem += `Cor: ${item.cor}%0A`;
    mensagem += `Tamanho: ${item.tamanho}%0A`;
    mensagem += `Preço: ${item.preco}%0A%0A`;
  });

  const entregaSelecionada = document.querySelector('input[name="recebimento"]:checked');
  if(entregaSelecionada && entregaSelecionada.value === "entrega"){
    mensagem += "🚚 Entrega: R$ 10,00%0A";
    total += 10;
  } else {
    mensagem += "📦 Retirada no local%0A";
  }

  mensagem += `%0A💰 Total: R$ ${total.toFixed(2)}`;

  window.open("https://wa.me/5591985144347?text=" + mensagem, "_blank");
}

/* ===============================
   EXPOR FUNÇÕES PARA O HTML
================================ */
window.adicionarCarrinho = adicionarCarrinho;
window.abrirCarrinho = abrirCarrinho;
window.fecharModal = fecharModal;
window.fecharCarrinho = fecharCarrinho;
window.removerItem = removerItem;
window.finalizarWhatsApp = finalizarWhatsApp;
window.atualizarTotal = atualizarTotal;
window.abrirModal = abrirModal;
