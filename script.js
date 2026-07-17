let produtos = [];
let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];
let produtoSelecionado = null;
let frete = 0;
let usuarioUF = '';
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
  if (!lista) return;
  lista.innerHTML = "";
  produtos.forEach((p, index) => {
    const img = p.imagens || [p.imagem];
    const isFavorito = favoritos.some(f => f.nome === p.nome && f.valor === p.valor);
    
    lista.innerHTML += `
      <div class="produto">
        <button class="btn-favorito ${isFavorito ? 'favoritado' : ''}" onclick="event.stopPropagation(); toggleFavorito(${index})">
          ${isFavorito ? '❤️' : '🤍'}
        </button>
        <img src="${img[0]}" onclick="abrirModal(${index})">
        <h3>${p.nome}</h3>
        <p>${p.preco}</p>
        <button onclick="abrirModal(${index})">Comprar</button>
        <button onclick="adicionarAoCarrinho(${index})">Adicionar</button>
      </div>
    `;
  });
}

/* ================= MODAL DE SELEÇÃO ================= */
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
    <img id="img-principal" src="${imagens[0]}">
    
    <label>Cor</label>
    <select id="cor">
      ${cores.map(c => `<option value="${c}">${c}</option>`).join("")}
    </select>
    
    <label>Tamanho</label>
    <select id="tamanho">
      ${tamanhos.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>
    
    <button onclick="adicionarDoModal()">Adicionar ao carrinho</button>
    <button onclick="fecharModal()" class="modal-btn-fechar-baixo">Fechar</button>
    
    <div class="miniaturas-container">
      ${imagens.map(img => `
        <img src="${img}" onclick="trocarImagem('${img}')">
      `).join("")}
    </div>
  `;
}

function trocarImagem(src) {
  const imgPrincipal = document.getElementById("img-principal");
  if (imgPrincipal) imgPrincipal.src = src;
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

function abrirCarrinho() {
  document.getElementById("carrinho-lateral").classList.add("ativo");
}

function fecharCarrinho() {
  document.getElementById("carrinho-lateral").classList.remove("ativo");
}

function calcularFrete() {
  if (frete === undefined || frete === null) {
    frete = 0;
  }
}

function atualizarCarrinho() {
  const box = document.getElementById("itens-carrinho");
  if (!box) return;
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
  
  const totalElem = document.getElementById("total");
  if (totalElem) {
    totalElem.innerHTML = `
      <b>Subtotal:</b> R$ ${subtotal.toFixed(2)}<br>
      <b>Frete:</b> R$ ${frete.toFixed(2)}<br>
      <b>Total:</b> R$ ${totalFinal.toFixed(2)}
    `;
  }
  
  const contadorElem = document.getElementById("contador");
  if (contadorElem) contadorElem.innerText = carrinho.length;
  
  localStorage.setItem("carrinho", JSON.stringify(carrinho));
}

function enviarCarrinhoWhatsApp() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }
  let subtotal = 0;
  let msg = "🛍️ *PEDIDO BELLA FLOR*%0A%0A";
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
  msg += `🚚 Frete: R$ ${frete.toFixed(2)}%0A`;
  msg += `💰 Total: R$ ${totalFinal.toFixed(2)}`;
  
  if (usuarioUF) {
    msg += `%0A📍 UF: ${usuarioUF}`;
  }
  
  window.open(`https://wa.me/5591985144347?text=${msg}`, "_blank");
}

function buscarProdutos(){
  const texto = document.getElementById("buscar").value.toLowerCase();
  const cards = document.querySelectorAll(".produto");
  cards.forEach(card=>{
    const nome = card.querySelector("h3").innerText.toLowerCase();
    if(nome.includes(texto)){
      card.style.display="flex";
    }else{
      card.style.display="none";
    }
  });
}

function filtrarCategoria(categoria){
    if(categoria==="Todos"){
        renderizarProdutos();
        return;
    }
    lista.innerHTML="";
    produtos
    .filter(p=>p.categoria===categoria)
    .forEach((p,index)=>{
        let img=p.imagens || [p.imagem];
        const isFavorito = favoritos.some(f => f.nome === p.nome && f.valor === p.valor);
        const originalIndex = produtos.indexOf(p);
        lista.innerHTML+=`
        <div class="produto">
            <button class="btn-favorito ${isFavorito ? 'favoritado' : ''}" onclick="event.stopPropagation(); toggleFavorito(${originalIndex})">
                ${isFavorito ? '❤️' : '🤍'}
            </button>
            <img src="${img[0]}" onclick="abrirModal(${originalIndex})">
            <h3>${p.nome}</h3>
            <p>${p.preco}</p>
            <button onclick="abrirModal(${originalIndex})">Comprar</button>
            <button onclick="adicionarAoCarrinho(${originalIndex})">Adicionar</button>
        </div>
        `;
    });
}

/* ================= FAVORITOS ================= */
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
      imagem: produto.imagem || (produto.imagens && produto.imagens[0])
    });
  }
  
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
  renderizarProdutos();
}

/* ================= FRETE POR CEP ================= */
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
    
    document.getElementById("frete-info").innerHTML = `✅ ${dados.localidade}/${dados.uf}: R$ ${frete.toFixed(2)}`;
    atualizarCarrinho();
  } catch (erro) {
    alert(erro.message);
    frete = 0;
    document.getElementById("frete-info").innerHTML = "❌ CEP não encontrado";
  }
}
