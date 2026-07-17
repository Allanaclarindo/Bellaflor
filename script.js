/* ==========================================
   BELLA FLOR
   SCRIPT.JS - PARTE 1
========================================== */

let produtos = [];

let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

let produtoSelecionado = null;

let frete = 0;

const lista = document.getElementById("lista-produtos");

/* =======================
   CARREGAR PRODUTOS
======================= */

fetch("produtos.json")
.then(res => res.json())
.then(data => {

    produtos = data;

    renderizarProdutos(produtos);

    atualizarCarrinho();

});

/* =======================
   FAVORITOS
======================= */

function favoritar(index){

    if(favoritos.includes(index)){

        favoritos = favoritos.filter(i => i !== index);

    }else{

        favoritos.push(index);

    }

    localStorage.setItem(
        "favoritos",
        JSON.stringify(favoritos)
    );

    renderizarProdutos(produtos);

}

/* =======================
   MOSTRAR FAVORITOS
======================= */

function mostrarFavoritos(){

    const listaFavoritos = produtos.filter((p,i)=>
        favoritos.includes(i)
    );

    renderizarProdutos(listaFavoritos);

}

/* =======================
   MOSTRAR TODOS
======================= */

function mostrarTodos(){

    renderizarProdutos(produtos);

}

/* =======================
   PESQUISA
======================= */

function pesquisarProdutos(){

    const texto = document
        .getElementById("pesquisa")
        .value
        .toLowerCase();

    const resultado = produtos.filter(produto =>

        produto.nome.toLowerCase().includes(texto)

    );

    renderizarProdutos(resultado);

}

/* =======================
   RENDERIZAR PRODUTOS
======================= */

function renderizarProdutos(listaProdutos){

    lista.innerHTML = "";

    listaProdutos.forEach(produto =>{

        const indiceOriginal =
            produtos.indexOf(produto);

        const imagens =
            produto.imagens || [produto.imagem];

        lista.innerHTML += `

        <div class="produto">

            <span
            class="favorito"
            onclick="favoritar(${indiceOriginal})">

            ${
                favoritos.includes(indiceOriginal)
                ? "❤️"
                : "🤍"
            }

            </span>

            <img
            src="${imagens[0]}"
            onclick="abrirModal(${indiceOriginal})">

            <h3>${produto.nome}</h3>

            <p>${produto.preco}</p>

            <button
            onclick="abrirModal(${indiceOriginal})">

            Comprar

            </button>

            <button
            onclick="adicionarAoCarrinho(${indiceOriginal})">

            Adicionar

            </button>

        </div>

        `;

    });

}
/* ==========================================
   MODAL DO PRODUTO
========================================== */

function abrirModal(index){

    produtoSelecionado = produtos[index];

    document.getElementById("modal").style.display="flex";

    document.getElementById("modal-nome").innerText=
        produtoSelecionado.nome;

    const imagens =
        produtoSelecionado.imagens || [produtoSelecionado.imagem];

    const cores =
        produtoSelecionado.cores
        ? produtoSelecionado.cores.split(",").map(c=>c.trim())
        : ["Única"];

    const tamanhos =
        produtoSelecionado.tamanhos
        ? produtoSelecionado.tamanhos.split(",").map(t=>t.trim())
        : ["Único"];

    document.getElementById("modal-imagens").innerHTML=`

        <img
        id="img-principal"
        src="${imagens[0]}"
        style="width:100%;border-radius:12px;">

        <br><br>

        <label>Cor</label>

        <select id="cor">

            ${cores.map(c=>`<option>${c}</option>`).join("")}

        </select>

        <br><br>

        <label>Tamanho</label>

        <select id="tamanho">

            ${tamanhos.map(t=>`<option>${t}</option>`).join("")}

        </select>

        <br><br>

        <button onclick="adicionarDoModal()">

            Adicionar ao Carrinho

        </button>

        <div style="display:flex;gap:10px;margin-top:15px;flex-wrap:wrap;">

        ${imagens.map(img=>`

            <img
            src="${img}"
            onclick="trocarImagem('${img}')"
            style="width:70px;height:70px;object-fit:cover;border-radius:8px;cursor:pointer;">

        `).join("")}

        </div>

    `;

}

function trocarImagem(src){

    document.getElementById("img-principal").src=src;

}

function fecharModal(){

    document.getElementById("modal").style.display="none";

}

/* ==========================================
   CARRINHO
========================================== */

function adicionarAoCarrinho(index){

    const p = produtos[index];

    carrinho.push({

        nome:p.nome,

        preco:p.valor,

        quantidade:1,

        cor:p.cores
            ? p.cores.split(",")[0].trim()
            : "Única",

        tamanho:p.tamanhos
            ? p.tamanhos.split(",")[0].trim()
            : "Único"

    });

    atualizarCarrinho();

}

function adicionarDoModal(){

    carrinho.push({

        nome:produtoSelecionado.nome,

        preco:produtoSelecionado.valor,

        quantidade:1,

        cor:document.getElementById("cor").value,

        tamanho:document.getElementById("tamanho").value

    });

    atualizarCarrinho();

    fecharModal();

}

function aumentar(i){

    carrinho[i].quantidade++;

    atualizarCarrinho();

}

function diminuir(i){

    if(carrinho[i].quantidade>1){

        carrinho[i].quantidade--;

    }else{

        carrinho.splice(i,1);

    }

    atualizarCarrinho();

}

function remover(i){

    carrinho.splice(i,1);

    atualizarCarrinho();

}

function abrirCarrinho(){

    document
    .getElementById("carrinho-lateral")
    .classList
    .add("ativo");

}

function fecharCarrinho(){

    document
    .getElementById("carrinho-lateral")
    .classList
    .remove("ativo");

}

/* ==========================================
   FRETE
========================================== */

function calcularFrete(){

    const cep =
        document
        .getElementById("cep")
        .value
        .replace(/\D/g,"");

    if(cep.length!=8){

        alert("Digite um CEP válido.");

        return;

    }

    if(cep.startsWith("66")){

        frete = 15.00;

        document.getElementById("resultado-frete").innerHTML=

        "🚚 Entrega para Belém e região<br>Frete: R$ 15,00";

    }else{

        frete = 25.00;

        document.getElementById("resultado-frete").innerHTML=

        "🚚 Outras localidades<br>Frete: R$ 25,00";

    }

    atualizarCarrinho();

}
/* ==========================================
   ATUALIZAR CARRINHO
========================================== */

function atualizarCarrinho(){

    const box = document.getElementById("itens-carrinho");

    box.innerHTML = "";

    let subtotal = 0;

    carrinho.forEach((item,i)=>{

        subtotal += item.preco * item.quantidade;

        box.innerHTML += `

        <div class="item-carrinho">

            <strong>${item.nome}</strong><br>

            Cor: ${item.cor}<br>

            Tamanho: ${item.tamanho}<br>

            Valor: R$ ${item.preco.toFixed(2)}<br><br>

            <button onclick="diminuir(${i})">−</button>

            <strong>${item.quantidade}</strong>

            <button onclick="aumentar(${i})">+</button>

            <button onclick="remover(${i})">🗑️</button>

        </div>

        `;

    });

    const total = subtotal + frete;

    document.getElementById("total").innerHTML = `

        <hr>

        <p><b>Subtotal:</b> R$ ${subtotal.toFixed(2)}</p>

        <p><b>Frete:</b> R$ ${frete.toFixed(2)}</p>

        <h3>Total: R$ ${total.toFixed(2)}</h3>

    `;

    document.getElementById("contador").innerText = carrinho.length;

    localStorage.setItem(
        "carrinho",
        JSON.stringify(carrinho)
    );

}

/* ==========================================
   WHATSAPP
========================================== */

function enviarCarrinhoWhatsApp(){

    if(carrinho.length===0){

        alert("Seu carrinho está vazio.");

        return;

    }

    let subtotal = 0;

    let mensagem = "🛍️ *PEDIDO BELLA FLOR*%0A%0A";

    carrinho.forEach(item=>{

        subtotal += item.preco * item.quantidade;

        mensagem +=
        `• ${item.nome}%0A`;

        mensagem +=
        `Cor: ${item.cor}%0A`;

        mensagem +=
        `Tamanho: ${item.tamanho}%0A`;

        mensagem +=
        `Qtd: ${item.quantidade}%0A`;

        mensagem +=
        `Valor: R$ ${(item.preco*item.quantidade).toFixed(2)}%0A%0A`;

    });

    const total = subtotal + frete;

    mensagem +=
    `🚚 Frete: R$ ${frete.toFixed(2)}%0A`;

    mensagem +=
    `💰 Total: R$ ${total.toFixed(2)}%0A%0A`;

    mensagem +=
    "Obrigado pela preferência! 🌸";

    window.open(

        `https://wa.me/5591985144347?text=${mensagem}`,

        "_blank"

    );

}

/* ==========================================
   INICIALIZAÇÃO
========================================== */

atualizarCarrinho();

console.log("Bella Flor carregada com sucesso.");
