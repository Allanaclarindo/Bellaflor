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

    if (produtos.length === 0) {
      lista.innerHTML = '<p>Nenhum produto cadastrado.</p>';
      return;
    }

    produtos.forEach(p => {
      lista.innerHTML += `
        <div class="produto">
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
