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
   ADICIONAR AO CARRINHO
================================ */
function adicionarCarrinho() {
  carrinho.push({
    nome: produtoSelecionado.nome,
    preco: produtoSelecionado.preco,
    valor: parseFloat(
      produtoSelecionado.preco
        .replace("R$", "")
        .replace(",", ".")
    ),
    cor: document.getElementById("cor").value,
    tamanho: document.getElementById("tamanho").value
  });

  document.getElementById("contador-carrinho").innerText = carrinho.length;
  fecharModal();
}

/* ===============================
   ABRIR CARRINHO
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
          Cor: ${item.cor} | Tamanho: ${item.tamanho}<br>
          Preço: ${item.preco}<br>
          <button onclick="removerItem(${index})">❌ Remover</button>
        </p>
        <hr>
      `;
    });

    lista.innerHTML += `
      <p><strong>Total:</strong> R$ <span id="total-final">0.00</span></p>
      <button onclick="finalizarWhatsApp()">Finalizar no WhatsApp</button>
    `;
  }

  document.getElementById("modal-carrinho").style.display = "flex";
  atualizarTotal();
}

/* ===============================
   REMOVER ITEM
================================ */
function removerItem(index) {
  carrinho.splice(index, 1);
  document.getElementById("contador-carrinho").innerText = carrinho.length;
  abrirCarrinho();
}

function fecharCarrinho() {
  document.getElementById("modal-carrinho").style.display = "none";
}

/* ===============================
   TOTAL + ENTREGA / RETIRADA
================================ */
function atualizarTotal() {
  let total = carrinho.reduce((soma, item) => soma + item.valor, 0);

  const entregaSelecionada = document.querySelector(
    'input[name="recebimento"]:checked'
  );

  if (entregaSelecionada && entregaSelecionada.value === "entrega") {
    total += 10;
  }

  document.getElementById("total-final").innerText = total.toFixed(2);
}

/* ===============================
   FINALIZAR NO WHATSAPP
================================ */
function finalizarWhatsApp() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio");
    return;
  }

  let mensagem = "🛍️ Pedido Bella Flor:%0A%0A";
  let total = carrinho.reduce((soma, item) => soma + item.valor, 0);

  carrinho.forEach((item, i) => {
    mensagem += `${i + 1}. ${item.nome}%0A`;
    mensagem += `Cor: ${item.cor}%0A`;
    mensagem += `Tamanho: ${item.tamanho}%0A`;
    mensagem += `Preço: ${item.preco}%0A%0A`;
  });

  const entregaSelecionada = document.querySelector(
    'input[name="recebimento"]:checked'
  );

  if (entregaSelecionada && entregaSelecionada.value === "entrega") {
    mensagem += "🚚 Entrega: R$ 10,00%0A";
    total += 10;
  } else {
    mensagem += "📦 Retirada no local%0A";
  }

  mensagem += `%0A💰 Total: R$ ${total.toFixed(2)}`;

  window.open(
    "https://wa.me/5591985144347?text=" + mensagem,
    "_blank"
  );
      }
