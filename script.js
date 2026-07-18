let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let produtoSelecionado = null;
let frete = 0;
let freteCalculado = false;
const lista = document.getElementById("lista-produtos");

/* Tabela de frete aproximada por estado (UF).
   Ajuste os valores livremente conforme sua transportadora. */
const tabelaFrete = {
  AC: 35, AL: 30, AP: 35, AM: 35, BA: 25,
  CE: 30, DF: 20, ES: 18, GO: 20, MA: 30,
  MT: 25, MS: 22, MG: 18, PA: 32, PB: 28,
  PR: 15, PE: 28, PI: 30, RJ: 18, RN: 28,
  RS: 18, RO: 32, RR: 38, SC: 15, SP: 12,
  SE: 28, TO: 28
};

/* ================= PRODUTOS ================= */
fetch("produtos.json")
  .then(res => res.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
    atualizarCarrinho();
  });

function renderizarProdutos(dados) {
  const itens = dados || produtos;
  lista.innerHTML = "";

  if (itens.length === 0) {
    lista.innerHTML = "<p style='text-align:center;width:100%;'>Nenhum produto encontrado.</p>";
    return;
  }

  itens.forEach(p => {
    const index = produtos.indexOf(p); // índice real no array original
    const img = p.imagens || [p.imagem];
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

/* ================= FILTRO POR CATEGORIA ================= */
function filtrarCategoria(categoria) {
  if (categoria === "Todos") {
    renderizarProdutos(produtos);
    return;
  }
  const filtrados = produtos.filter(p =>
    p.categoria && p.categoria.trim().toLowerCase() === categoria.trim().toLowerCase()
  );
  renderizarProdutos(filtrados);
}

/* ================= BUSCA ================= */
function buscarProdutos() {
  const termo = document.getElementById("buscar").value.trim().toLowerCase();
  if (termo === "") {
    renderizarProdutos(produtos);
    return;
  }
  const filtrados = produtos.filter(p =>
    p.nome.toLowerCase().includes(termo) ||
    (p.categoria && p.categoria.toLowerCase().includes(termo))
  );
  renderizarProdutos(filtrados);
}

/* ================= MODAL ================= */
function abrirModal(index) {
  produtoSelecionado = produtos[index];
  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produtoSelecionado.nome;
  const imagens = produtoSelecionado.imagens || [produtoSelecionado.imagem];
  const cores = produtoSelecionado.cores
    ? produtoSelecionado.cores.split(",").map(c => c.trim())
    : ["Única"];
  const tamanhos = produtoSelecionado.tamanhos
    ? produtoSelecionado.tamanhos.split(",").map(t => t.trim())
    : ["Único"];
  document.getElementById("modal-imagens").innerHTML = `
    <img id="img-principal"
         src="${imagens[0]}"
         style="width:100%; border-radius:10px;">
    <label>Cor</label>
    <select id="cor">
      ${cores.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
    <label>Tamanho</label>
    <select id="tamanho">
      ${tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>
    <button onclick="adicionarDoModal()">
      Adicionar ao carrinho
    </button>
    <div style="display:flex;gap:10px;margin-top:10px;flex-wrap:wrap;">
      ${imagens.map(img => `
        <img src="${img}"
             onclick="trocarImagem('${img}')"
             style="width:60px;height:60px;object-fit:cover;cursor:pointer;border-radius:8px;">
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

/* ================= CARRINHO ================= */
function adicionarAoCarrinho(index) {
  const p = produtos[index];
  carrinho.push({
    nome: p.nome,
    preco: p.valor,
    quantidade: 1,
    cor: p.cores ? p.cores.split(",")[0].trim() : "Única",
    tamanho: p.tamanhos ? p.tamanhos.split(",")[0].trim() : "Único"
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
    cor: cor,
    tamanho: tamanho
  });
  atualizarCarrinho();
  fecharModal();
}

/* ================= CONTROLES ================= */
function aumentar(i) {
  carrinho[i].quantidade++;
  atualizarCarrinho();
}
function diminuir(i) {
  if (carrinho[i].quantidade > 1) {
    carrinho[i].quantidade--;
  } else {
    carrinho.splice(i, 1);
  }
  atualizarCarrinho();
}
function remover(i) {
  carrinho.splice(i, 1);
  atualizarCarrinho();
}

/* ================= CARRINHO (abrir/fechar) ================= */
function abrirCarrinho() {
  document.getElementById("carrinho-lateral").classList.add("ativo");
}
function fecharCarrinho() {
  document.getElementById("carrinho-lateral").classList.remove("ativo");
}

/* ================= FRETE ================= */
function calcularFrete() {
  if (!freteCalculado) {
    frete = 10.00; // valor padrão até o cliente informar o CEP
  }
}

/* Formata o CEP como 00000-000 enquanto o usuário digita */
function formatarCep(input) {
  let v = input.value.replace(/\D/g, "").slice(0, 8);
  if (v.length > 5) v = v.slice(0, 5) + "-" + v.slice(5);
  input.value = v;
}

/* Consulta o CEP na API gratuita ViaCEP e aplica o valor
   de frete conforme o estado (UF) do endereço encontrado. */
async function calcularFreteCep() {
  const cepInput = document.getElementById("cep");
  const infoBox = document.getElementById("frete-info");
  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length !== 8) {
    infoBox.innerText = "CEP inválido. Digite os 8 números.";
    return;
  }

  infoBox.innerText = "Calculando frete...";

  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const dados = await res.json();

    if (dados.erro) {
      infoBox.innerText = "CEP não encontrado.";
      return;
    }

    const valorFrete = tabelaFrete[dados.uf] || 25;
    frete = valorFrete;
    freteCalculado = true;

    infoBox.innerText = `Entrega para ${dados.localidade}/${dados.uf}: R$ ${valorFrete.toFixed(2)}`;
    atualizarCarrinho();
  } catch (e) {
    infoBox.innerText = "Erro ao consultar o CEP. Tente novamente.";
  }
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
        R$ ${item.preco.toFixed(2)}<br><br>
        <button onclick="diminuir(${i})">−</button>
        <strong>${item.quantidade}</strong>
        <button onclick="aumentar(${i})">+</button>
        <button onclick="remover(${i})">🗑️</button>
      </div>
    `;
  });
  calcularFrete();
  const totalFinal = subtotal + frete;
  document.getElementById("total").innerHTML = `
    <b>Subtotal:</b> R$ ${subtotal.toFixed(2)}<br>
    <b>Frete:</b> R$ ${frete.toFixed(2)}<br>
    <b>Total:</b> R$ ${totalFinal.toFixed(2)}
  `;
  document.getElementById("contador").innerText = carrinho.length;
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

/* ================= WHATSAPP ================= */
function enviarCarrinhoWhatsApp() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }
  let subtotal = 0;
  let msg = "🛍 *PEDIDO BELLA FLOR*%0A%0A";
  carrinho.forEach(item => {
    subtotal += item.preco * item.quantidade;
    msg += `• ${item.nome}%0A`;
    msg += `Cor: ${item.cor}%0A`;
    msg += `Tamanho: ${item.tamanho}%0A`;
    msg += `Quantidade: ${item.quantidade}%0A`;
    msg += `Valor: R$ ${(item.preco * item.quantidade).toFixed(2)}%0A%0A`;
  });
  calcularFrete();
  const totalFinal = subtotal + frete;
  const cepDigitado = document.getElementById("cep")?.value || "não informado";
  msg += `📍 CEP: ${cepDigitado}%0A`;
  msg += `🚚 Frete: R$ ${frete.toFixed(2)}%0A`;
  msg += `💰 Total: R$ ${totalFinal.toFixed(2)}`;
  window.open(
    `https://wa.me/5591985144347?text=${msg}`,
    "_blank"
  );
}

atualizarCarrinho();
