let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let produtoSelecionado = null;

let frete = 0;

const lista = document.getElementById("lista-produtos");

/* ================= PRODUTOS ================= */
fetch("produtos.json")
  .then(res => res.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
    atualizarCarrinho();
  });

function renderizarProdutos() {
  lista.innerHTML = "";

  produtos.forEach((p, index) => {
    let img = p.imagens || [p.imagem];

    lista.innerHTML += `
      <div class="produto">
        <img src="${img[0]}" onclick="abrirModal(${index})">
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>

        <button onclick="abrirModal(${index})">Comprar</button>
        <button onclick="adicionarAoCarrinho(${index})">Adicionar</button>
      </div>
    `;
  });
}

/* ================= MODAL ================= */
function abrirModal(index) {
  produtoSelecionado = produtos[index];

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;

  let imagens = produtoSelecionado.imagens || [produtoSelecionado.imagem];

  document.getElementById("modal-imagens").innerHTML = `
    <img id="img-principal" src="${imagens[0]}" style="width:100%">

    <label>Cor</label>
    <select id="cor"></select>

    <label>Tamanho</label>
    <select id="tamanho">
      <option>P</option>
      <option>M</option>
      <option>G</option>
    </select>

    <button onclick="adicionarDoModal()">Adicionar ao carrinho</button>

    <div style="display:flex; gap:10px; margin-top:10px;">
      ${imagens.map(img => `
        <img src="${img}" onclick="trocarImagem('${img}')" style="width:60px; cursor:pointer">
      `).join("")}
    </div>
  `;

  setTimeout(() => {
    const cor = document.getElementById("cor");

    if (produtoSelecionado.cores) {
      cor.innerHTML = produtoSelecionado.cores
        .split(",")
        .map(c => `<option value="${c.trim()}">${c.trim()}</option>`)
        .join("");
    } else {
      cor.innerHTML = `<option>Única</option>`;
    }
  }, 0);
}

function trocarImagem(src) {
  document.getElementById("img-principal").src = src;
}

function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

/* ================= CARRINHO ================= */
function adicionarAoCarrinho(index) {
  const p = produtos[index];

  carrinho.push({
    nome: p.nome,
    preco: p.valor,
    quantidade: 1,
    cor: p.cores ? p.cores.split(",")[0].trim() : "Única",
    tamanho: "M"
  });

  atualizarCarrinho();
}

function adicionarDoModal() {
  const cor = document.getElementById("cor").value;
  const tamanho = document.getElementById("tamanho").value;

  carrinho.push({
    nome: produtoSelecionado.nome,
    preco: produtoSelecionado.valor,
    quantidade: 1,
    cor,
    tamanho
  });

  atualizarCarrinho();
}

/* ================= CONTROLES ================= */
function aumentar(i) {
  carrinho[i].quantidade++;
  atualizarCarrinho();
}

function diminuir(i) {
  if (carrinho[i].quantidade > 1) {
    carrinho[i].quantidade--;
    atualizarCarrinho();
  }
}

function remover(i) {
  carrinho.splice(i, 1);
  atualizarCarrinho();
}

/* ================= CARRINHO UI ================= */
function abrirCarrinho() {
  document.getElementById("carrinho-lateral").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("carrinho-lateral").classList.remove("ativo");
}

/* ================= FRETE ================= */
function calcularFrete() {
  frete = 10.00; // Belém fixo
}

/* ================= ATUALIZAR ================= */
function atualizarCarrinho() {
  const box = document.getElementById("itens-carrinho");
  box.innerHTML = "";

  let subtotal = 0;

  carrinho.forEach((item, i) => {
    subtotal += item.preco * item.quantidade;

    box.innerHTML += `
      <div class="item-carrinho">
        <b>${item.nome}</b><br>
        Cor: ${item.cor}<br>
        Tamanho: ${item.tamanho}<br>
        R$ ${item.preco.toFixed(2)}<br>

        <button onclick="diminuir(${i})">-</button>
        ${item.quantidade}
        <button onclick="aumentar(${i})">+</button>

        <button onclick="remover(${i})">X</button>
      </div>
    `;
  });

  calcularFrete();

  let totalFinal = subtotal + frete;

  document.getElementById("total").innerText =
    `Subtotal: R$ ${subtotal.toFixed(2)} | Frete: R$ ${frete.toFixed(2)} | Total: R$ ${totalFinal.toFixed(2)}`;

  document.getElementById("contador").innerText = carrinho.length;

  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

/* ================= WHATSAPP ================= */
function enviarCarrinhoWhatsApp() {
  if (carrinho.length === 0) return;

  let msg = "🛍 PEDIDO:%0A%0A";
  let subtotal = 0;

  carrinho.forEach(p => {
    msg += `- ${p.nome} | ${p.cor} | ${p.tamanho} x${p.quantidade} = R$ ${p.preco}%0A`;
    subtotal += p.preco * p.quantidade;
  });

  calcularFrete();

  let totalFinal = subtotal + frete;

  msg += `%0A🚚 Frete: R$ ${frete.toFixed(2)}`;
  msg += `%0A💰 TOTAL FINAL: R$ ${totalFinal.toFixed(2)}`;

  window.open(`https://wa.me/5591985144347?text=${msg}`, "_blank");
      }
