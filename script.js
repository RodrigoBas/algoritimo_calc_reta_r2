let pontosFurtoOutros = [];  // Armazenará os pontos de 'furto_outros'
let pontosFurtoVeiculo = [];  // Armazenará os pontos de 'furto_de_veiculo'

// Função para ler o arquivo CSV
function lerArquivo(event) {
    const file = event.target.files[0];  // Obtém o arquivo carregado
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                // Limpa os pontos anteriores
                pontosFurtoOutros = [];
                pontosFurtoVeiculo = [];

                // Limitar a amostra a 50 itens
                const limite = Math.min(results.data.length, 50);  // Garante que a amostra seja no máximo 50 registros

                // Supondo que o arquivo CSV tenha as colunas 'ano', 'furto_outros', e 'furto_de_veiculo'
                for (let i = 0; i < limite; i++) {
                    const row = results.data[i];
                    const ano = parseInt(row[0]); // Ano é a primeira coluna
                    const furtoOutros = parseInt(row[25]); // 'furto_outros' está na coluna 25
                    const furtoVeiculo = parseInt(row[26]); // 'furto_de_veiculo' está na coluna 26

                    // Verifica se os valores são numéricos e válidos
                    if (!isNaN(ano) && !isNaN(furtoOutros) && !isNaN(furtoVeiculo)) {
                        pontosFurtoOutros.push([ano, furtoOutros]); // Armazena para 'furto_outros'
                        pontosFurtoVeiculo.push([ano, furtoVeiculo]); // Armazena para 'furto_de_veiculo'
                    } else {
                        console.warn(`Dados inválidos na linha ${i}: Ano: ${ano}, Furto Outros: ${furtoOutros}, Furto Veículo: ${furtoVeiculo}`);
                    }
                }

                // Exibe os pontos carregados para verificação
                console.log("Pontos Furto Outros:", pontosFurtoOutros);
                console.log("Pontos Furto Veiculo:", pontosFurtoVeiculo);
                
                // Exibe os dados no HTML
                exibirPontos();
            },
            header: false,  // Caso o arquivo não tenha cabeçalho, se necessário defina true
            skipEmptyLines: true  // Pula linhas vazias
        });
    }
}

// Função para exibir os pontos na página
function exibirPontos() {
    const listaPontos = document.getElementById("pontos-list");
    listaPontos.innerHTML = '';  // Limpa a lista de pontos exibidos

    pontosFurtoOutros.forEach(([ano, furtoOutros]) => {
        const li = document.createElement("li");
        li.textContent = `Ano: ${ano}, Furto Outros: ${furtoOutros}`;
        listaPontos.appendChild(li);
    });

    pontosFurtoVeiculo.forEach(([ano, furtoVeiculo]) => {
        const li = document.createElement("li");
        li.textContent = `Ano: ${ano}, Furto de Veículo: ${furtoVeiculo}`;
        listaPontos.appendChild(li);
    });
}

// Função para calcular a equação da reta e o valor de R²
function calcularEquacao() {
    if (pontosFurtoOutros.length < 2 || pontosFurtoVeiculo.length < 2) {
        alert("Por favor, insira pelo menos dois pontos.");
        return;
    }

    // Verificar se os pontos estão corretos
    console.log("Pontos Furto Outros para cálculo:", pontosFurtoOutros);
    console.log("Pontos Furto Veiculo para cálculo:", pontosFurtoVeiculo);

    // Selecionando os dados para a regressão (ano vs furto_outros)
    const resultadoFurtoOutros = calcularRegressaoLinear(pontosFurtoOutros);
    
    // Selecionando os dados para a regressão (ano vs furto_de_veiculo)
    const resultadoFurtoVeiculo = calcularRegressaoLinear(pontosFurtoVeiculo);

    // Exibe os resultados na tela
    document.getElementById("resultado").innerHTML = `
        <h3>Resultados para Furto Outros:</h3>
        <p><strong>Equação da Reta:</strong> ${resultadoFurtoOutros.equacao}</p>
        <p><strong>Valor de R²:</strong> ${resultadoFurtoOutros.r2}</p>

        <h3>Resultados para Furto de Veículo:</h3>
        <p><strong>Equação da Reta:</strong> ${resultadoFurtoVeiculo.equacao}</p>
        <p><strong>Valor de R²:</strong> ${resultadoFurtoVeiculo.r2}</p>
    `;
}

// Função de cálculo da equação da reta e R²
function calcularRegressaoLinear(dados) {
    const n = dados.length;

    // Somatórios necessários
    let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;

    // Calculando os somatórios
    dados.forEach(([x, y]) => {
        somaX += x;
        somaY += y;
        somaXY += x * y;
        somaX2 += x * x;
    });

    // Verificação de somatórios no console
    console.log("Soma X:", somaX);
    console.log("Soma Y:", somaY);
    console.log("Soma XY:", somaXY);
    console.log("Soma X²:", somaX2);

    // Verificar se o denominador da fórmula de 'a' não é zero
    const denominador = (n * somaX2 - somaX * somaX);
    if (denominador === 0) {
        console.error("Erro: Denominador da fórmula de 'a' é zero.");
        return {
            equacao: "Erro no cálculo da equação",
            r2: "Erro"
        };
    }

    // Calculando os coeficientes da reta: a (coeficiente angular) e b (coeficiente linear)
    const a = (n * somaXY - somaX * somaY) / denominador;
    const b = (somaY - a * somaX) / n;

    // Calculando a média de y
    const yMedia = somaY / n;

    // Calculando o R²
    let somaResiduos = 0; // Soma dos quadrados dos resíduos (y_i - y_i^)
    let somaTotal = 0; // Soma dos quadrados totais (y_i - y_media)^2

    dados.forEach(([x, y]) => {
        const yPrevisto = a * x + b; // y previsto pela reta
        somaResiduos += Math.pow(y - yPrevisto, 2);
        somaTotal += Math.pow(y - yMedia, 2);
    });

    const r2 = 1 - (somaResiduos / somaTotal); // Fórmula de R²

    // Exibindo os resultados
    return {
        equacao: `y = ${a.toFixed(2)}x + ${b.toFixed(2)}`,
        r2: r2.toFixed(4)
    };
}
