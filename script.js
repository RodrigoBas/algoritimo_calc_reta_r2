let pontos = [];  // Armazenará os pontos extraídos do arquivo CSV

// Função para ler o arquivo CSV
function lerArquivo(event) {
    const file = event.target.files[0];  // Obtém o arquivo carregado
    if (file) {
        Papa.parse(file, {
            complete: function(results) {
                // Limpa os pontos anteriores
                pontos = [];
                
                // Supondo que o arquivo CSV tenha as colunas 'x' e 'y'
                // ou as primeiras duas colunas representem os valores de x e y
                results.data.forEach(row => {
                    // Verifique se as colunas contêm valores válidos
                    const x = parseFloat(row[0]);
                    const y = parseFloat(row[1]);

                    if (!isNaN(x) && !isNaN(y)) {
                        pontos.push([x, y]);  // Adiciona o ponto no array
                    }
                });

                // Exibe os pontos carregados
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

    pontos.forEach(([x, y]) => {
        const li = document.createElement("li");
        li.textContent = `(${x}, ${y})`;
        listaPontos.appendChild(li);
    });
}

// Função para calcular a equação da reta e o valor de R²
function calcularEquacao() {
    if (pontos.length < 2) {
        alert("Por favor, insira pelo menos dois pontos.");
        return;
    }

    // Realiza os cálculos
    const resultado = calcularEquacaoReta(pontos);

    // Exibe os resultados na tela
    document.getElementById("resultado").innerHTML = `
        <p><strong>Equação da Reta:</strong> ${resultado.equacao}</p>
        <p><strong>Valor de R²:</strong> ${resultado.r2}</p>
    `;
}

// Função de cálculo da equação da reta e R²
function calcularEquacaoReta(vetor) {
    const n = vetor.length;

    // Somatórios necessários
    let somaX = 0, somaY = 0, somaXY = 0, somaX2 = 0;

    // Calculando os somatórios
    for (let i = 0; i < n; i++) {
        const [x, y] = vetor[i];
        somaX += x;
        somaY += y;
        somaXY += x * y;
        somaX2 += x * x;
    }

    // Calculando os coeficientes da reta: a (coeficiente angular) e b (coeficiente linear)
    const a = (n * somaXY - somaX * somaY) / (n * somaX2 - somaX * somaX);
    const b = (somaY - a * somaX) / n;

    // Calculando o valor de R²
    let somaResiduos = 0; // Soma dos quadrados dos resíduos (y_i - y_i^)
    let somaTotal = 0; // Soma dos quadrados totais (y_i - y_média)^2
    let yMedia = somaY / n; // Média dos valores de y

    for (let i = 0; i < n; i++) {
        const [x, y] = vetor[i];
        const yPrevisto = a * x + b; // y previsto pela reta
        somaResiduos += Math.pow(y - yPrevisto, 2);
        somaTotal += Math.pow(y - yMedia, 2);
    }

    const r2 = 1 - (somaResiduos / somaTotal); // Fórmula do R²

    // Retornando os resultados
    return {
        equacao: `y = ${a.toFixed(2)}x + ${b.toFixed(2)}`,
        r2: r2.toFixed(4)
    };
}
