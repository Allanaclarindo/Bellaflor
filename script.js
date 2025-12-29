let carrinho = [];
let produtoSelecionado = null;

/* ===============================
   CARREGAR PRODUTOS
================================ */
fetch('produtos.json')
  .then(response => response.json())
  .then(produtos => {
    const lista = document.getElementById('lista-produtos');
    lista.innerHTML = '';

    produtos.forEach(p => {
      lista.innerHTML += `
        <div class="produto">
          <img src="${p.imagem}" alt="${p.nome}" onclick='abrirModal(${JSON.stringify(p)})'>
          <h3>${p.nome}</h3>
          <p>${p.preco}</p>
          <p><strong>Cores:</strong> ${p.cores}</p>
          <p><strong>Tamanhos:</strong> ${p.tamanhos}</p>
        </div>
      `;
    });
  });

/* ===============================
   MODAL DO PRODUTO
================================ */
function abrirModal(produto) {
  produtoSelecionado = produto;

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produto.nome;

  document.getElementById("cor").innerHTML =
    produto.cores.split(",").map(c => `<option>${c.trim()}</option>`).join("");

  document.getElementById("tamanho").innerHTML =
    produto.tamanhos.split(",").map(t => `<option>${t.trim()}</option>`).join("");
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

/* ===============================
   CARRINHO
================================ */
function adicionarCarrinho() {
  carrinho.push({
    nome: produtoSelecionado.nome,
    preco: produtoSelecionado.preco,
    cor: document.getElementById("cor").value,
    tamanho: document.getElementById("tamanho").value
  });

  document.getElementById("contador-carrinho").innerText = carrinho.length;
  fecharModal();
}

/* ===============================
   ABRIR CARRINHO (NÃO VAI PRO WHATS)
================================ */
function abrirCarrinho() {
  const lista = document.getElementById("lista-carrinho");
  lista.innerHTML = "";

  if (carrinho.length === 0) {
    lista.innerHTML = "<p>Seu carrinho está vazio</p>";
  } else {
    carrinho.forEach((item, index) => {
      lista.innerHTML += `
        <p>
          <strong>${item.nome}</strong><br>
          Cor: ${item.cor} | Tamanho: ${item.tamanho}
          <br>
          <button onclick="removerItem(${index})">❌ Remover</button>
        </p>
        <hr>
      `;
    });
  }

  document.getElementById("modal-carrinho").style.display = "flex";
}

function removerItem(index) {
  carrinho.splice(index, 1);
  document.getElementById("contador-carrinho").innerText = carrinho.length;
  abrirCarrinho();
}

function fecharCarrinho() {
  document.getElementById("modal-carrinho").style.display = "none";
}

/* ===============================
   FINALIZAR NO WHATSAPP
================================ */
function finalizarWhatsApp() {
  let mensagem = "🛍️ Pedido Bella Flor:%0A%0A";

  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}. ${item.nome}%0A`;
    mensagem += `Cor: ${item.cor}%0A`;
    mensagem += `Tamanho: ${item.tamanho}%0A%0A`;
  });

  window.open(
    "https://wa.me/5591985144347?text=" + mensagem,
    "_blank"
  );
}
  
  
