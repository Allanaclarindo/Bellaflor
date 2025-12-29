let carrinho = [];
let produtoSelecionado = null;

// CARREGA PRODUTOS
fetch('produtos.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Erro ao carregar produtos.json');
    }
    return response.json();
  })
  .then(produtos => {
    const lista = document.getElementById('lista-produtos');
    lista.innerHTML = '';

    produtos.forEach(p => {
      lista.innerHTML += `
        <div class="produto" onclick='abrirModal(${JSON.stringify(p)})'>
          <img src="${p.imagem}" alt="${p.nome}">
          <h3>${p.nome}</h3>
          <p>${p.preco}</p>
          <p><strong>Cores:</strong> ${p.cores}</p>
          <p><strong>Tamanhos:</strong> ${p.tamanhos}</p>
        </div>
      `;
    });
  })
  .catch(error => {
    console.error(error);
    document.getElementById('lista-produtos').innerHTML =
      '<p>Erro ao carregar o catálogo.</p>';
  });

// ABRIR MODAL
function abrirModal(produto) {
  produtoSelecionado = produto;

  document.getElementById("modal").style.display = "flex";
  document.getElementById("modal-nome").innerText = produto.nome;

  const cores = produto.cores.split(",");
  const tamanhos = produto.tamanhos.split(",");

  document.getElementById("cor").innerHTML =
    cores.map(c => `<option>${c.trim()}</option>`).join("");

  document.getElementById("tamanho").innerHTML =
    tamanhos.map(t => `<option>${t.trim()}</option>`).join("");
}

// FECHAR MODAL
function fecharModal() {
  document.getElementById("modal").style.display = "none";
}

// ADICIONAR AO CARRINHO
function adicionarCarrinho() {
  const cor = document.getElementById("cor").value;
  const tamanho = document.getElementById("tamanho").value;

  carrinho.push({
    nome: produtoSelecionado.nome,
    preco: produtoSelecionado.preco,
    cor,
    tamanho
  });

  document.getElementById("contador-carrinho").innerText = carrinho.length;
  fecharModal();
}

// FINALIZAR NO WHATSAPP
function abrirCarrinho() {
  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio");
    return;
  }

  let mensagem = "🛍️ Pedido Bella Flor:%0A%0A";

  carrinho.forEach((item, index) => {
    mensagem += `${index + 1}. ${item.nome}%0A`;
    mensagem += `Cor: ${item.cor}%0A`;
    mensagem += `Tamanho: ${item.tamanho}%0A%0A`;
  });

  mensagem += "Finalizar pedido 💜";

  window.open(
    `https://wa.me/5591985144347?text=${mensagem}`,
    "_blank"
  );
}
    
  
