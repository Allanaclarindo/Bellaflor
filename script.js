let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let produtoSelecionado = null;
let frete = 0;
let usuarioUF = '';

const lista = document.getElementById("lista-produtos");

// ================= PRODUTOS =================
fetch("produtos.json")
  .then(res => res.json())
  .then(data => {
    produtos = data;
    renderizarProdutos();
    atualizarCarrinho();
    atualizarFavoritos();
  });

function renderizarProdutos(listaFiltrada = null) {
  lista.innerHTML = "";
  const produtosRender = listaFiltrada || produtos;
  
  produtosRender.forEach((p, index) => {
    const img = p.imagens || [p.imagem];
    const isFavorito = favoritos.some(f => f.nome === p.nome && f.valor === p.valor);
    const imgSrc = img[0] || '';

    lista.innerHTML += `
      <div class="produto" data-index="${index}">
        <div class="produto-imagem">
          <img src="${imgSrc}" onclick="abrirModal(${index})">
          <button class="btn-favorito" onclick="toggleFavorito(${index})" title="Favorito">
            ${isFavorito ? '❤️' : '🤍'}
          </button>
        </div>
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${index})">Comprar</button>
        <button onclick="adicionarAoCarrinho(${index})">Adicionar</button>
      </div>
    `;
  });
}

// ================= FAVORITOS =================
function toggleFavorito(index) {
  const produto = produtos[index];
  const existente = favoritos.findIndex(f => f.nome === produto.nome && f.valor === produto.valor);
  
  if (existente >= 0) {
    favoritos.splice(existente, 1);
  } else {
    favoritos.push({
      nome: produto.nome,
      valor: produto.valor,
      preco: produto.preco,
      imagem: produto.imagem || (produto.imagens && produto.imagens[0]),
      cores: produto.cores,
      tamanhos: produto.tamanhos
    });
  }
  
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  renderizarProdutos();
  atualizarFavoritos();
}

function atualizarFavoritos() {
  // Não precisa de contador visível, mas mantemos no localStorage
}

function abrirFavoritos() {
  if (favoritos.length === 0) {
    alert("Você ainda não tem produtos favoritos. ❤️");
    return;
  }
  renderizarProdutos(favoritos);
}

// ================= MODAL =================
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
         style="width:100%; border-radius:10px; max-height:400px; object-fit:cover;">
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

// ================= CARRINHO =================
function adicionarAoCarrinho(index) {
  const p = produtos[index];
  carrinho.push({
    nome: p.nome,
    preco: p.valor,
    quantidade: 1,
    cor: p.cores ? p.cores.split(",")[0].trim() : "Única",
    tamanho: p.tamanhos ? p.tamanhos.split(",")[0].trim() : "Único",
    imagem: p.imagem || (p.imagens && p.imagens[0])
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
    tamanho: tamanho,
    imagem: produtoSelecionado.imagem || (produtoSelecionado.imagens && produtoSelecionado.imagens[0])
  });
  atualizarCarrinho();
  fecharModal();
}

// ================= CONTROLES CARRINHO =================
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

// ================= ABRIR/FECHAR CARRINHO =================
function abrirCarrinho() {
  document.getElementById("carrinho-lateral").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("carrinho-lateral").classList.remove("ativo");
}

// ================= FRETE POR CEP =================
async function calcularFretePorCEP() {
  const cepInput = document.getElementById("cep-frete");
  const cepDigitado = cepInput.value.replace(/\D/g, '');
  
  if (cepDigitado.length !== 8) {
    alert("Digite um CEP válido com 8 números.");
    return;
  }

  try {
    const dados = await consultarCEP(cepDigitado);
    usuarioUF = dados.uf;
    frete = calcularFretePorUF(usuarioUF);
    
    document.getElementById("frete-info").innerHTML = `
      ✅ ${dados.localidade}/${dados.uf}: R$ ${frete.toFixed(2)}
    `;
    
    atualizarCarrinho();
  } catch (erro) {
    alert(erro.message);
    frete = 0;
    document.getElementById("frete-info").innerHTML = "❌ CEP não encontrado";
  }
}

// ================= ATUALIZAR CARRINHO =================
function atualizarCarrinho() {
  const box = document.getElementById("itens-carrinho");
  box.innerHTML = "";
  let subtotal = 0;
  
  carrinho.forEach((item, i) => {
    subtotal += item.preco * item.quantidade;
    box.innerHTML += `
      <div class="item-carrinho">
        <div style="display:flex; align-items:center; gap:10px;">
          ${item.imagem ? `<img src="${item.imagem}" style="width:45px; height:45px; object-fit:cover; border-radius:8px;">` : ''}
          <div>
            <b>${item.nome}</b><br>
            Cor: ${item.cor}<br>
            Tamanho: ${item.tamanho}<br>
            R$ ${item.preco.toFixed(2)}
          </div>
        </div>
        <div style="margin-top:8px;">
          <button onclick="diminuir(${i})">−</button>
          <strong>${item.quantidade}</strong>
          <button onclick="aumentar(${i})">+</button>
          <button onclick="remover(${i})">🗑️</button>
        </div>
      </div>
    `;
  });

  const totalFinal = subtotal + frete;
  document.getElementById("total").innerHTML = `
    <b>Subtotal:</b> R$ ${subtotal.toFixed(2)}<br>
    <b>Frete:</b> R$ ${frete.toFixed(2)}<br>
    <b>Total:</b> R$ ${totalFinal.toFixed(2)}
  `;
  
  document.getElementById("contador").innerText = carrinho.length;
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

// ================= WHATSAPP =================
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
  
  const totalFinal = subtotal + frete;
  msg += `🚚 Frete: R$ ${frete.toFixed(2)}%0A`;
  msg += `💰 Total: R$ ${totalFinal.toFixed(2)}`;
  
  if (usuarioUF) {
    msg += `%0A📍 UF: ${usuarioUF}`;
  }
  
  window.open(
    `https://wa.me/5591985144347?text=${msg}`,
    "_blank"
  );
}

// ================= BUSCA E FILTROS =================
function buscarProdutos() {
  const termo = document.getElementById("buscar").value.toLowerCase();
  const filtrados = produtos.filter(p => 
    p.nome.toLowerCase().includes(termo) ||
    (p.categoria && p.categoria.toLowerCase().includes(termo))
  );
  renderizarProdutos(filtrados);
}

function filtrarCategoria(categoria) {
  const botoes = document.querySelectorAll('.filtro-btn');
  botoes.forEach(btn => btn.classList.remove('ativo'));
  
  if (categoria === 'Todos') {
    renderizarProdutos(produtos);
    document.querySelector('.filtro-btn:first-child').classList.add('ativo');
    return;
  }
  
  const filtrados = produtos.filter(p => 
    p.categoria && p.categoria.toLowerCase() === categoria.toLowerCase()
  );
  renderizarProdutos(filtrados);
  
  botoes.forEach(btn => {
    if (btn.textContent === categoria) btn.classList.add('ativo');
  });
}

// ================= INICIALIZAÇÃO =================
atualizarCarrinho();
