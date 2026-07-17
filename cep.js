// cep.js - API de CEP (ViaCEP + Correios simulador)

async function consultarCEP(cep) {
    cep = cep.replace(/\D/g, '');
    if (cep.length !== 8) {
        throw new Error('CEP inválido. Digite 8 números.');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    if (data.erro) {
        throw new Error('CEP não encontrado.');
    }

    return data;
}

function calcularFretePorUF(uf) {
    // Tabela de frete por região
    const tabelaFrete = {
        'SP': 10.00,
        'RJ': 12.00,
        'MG': 12.00,
        'ES': 12.00,
        'PR': 15.00,
        'SC': 15.00,
        'RS': 18.00,
        'DF': 20.00,
        'GO': 18.00,
        'MT': 22.00,
        'MS': 20.00,
        'BA': 16.00,
        'CE': 18.00,
        'PE': 18.00,
        'AL': 18.00,
        'PB': 18.00,
        'RN': 18.00,
        'MA': 20.00,
        'PA': 22.00,
        'AM': 25.00,
        'AC': 28.00,
        'RO': 25.00,
        'RR': 28.00,
        'AP': 28.00,
        'TO': 22.00,
        'PI': 20.00,
        'SE': 18.00
    };

    return tabelaFrete[uf.toUpperCase()] || 25.00; // valor padrão
}
