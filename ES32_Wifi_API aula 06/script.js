
const OPENWEATHER_API_KEY = "COLQUE_SUA_API_KEY_AQUI";



const MQTT_BROKER = "ws://broker.hivemq.com:8000/mqtt";

const TOPIC_TEMPERATURA = "esp32/clima/temperatura";
const TOPIC_UMIDADE = "esp32/clima/umidade";
const TOPIC_CIDADE_ATUAL = "esp32/clima/cidadeAtual";
const TOPIC_CIDADE = "esp32/clima/cidade";


/* =========================================================
   3. ELEMENTOS DO HTML
   ========================================================= */

const cidadeInput = document.getElementById("cidade");
const paisInput = document.getElementById("pais");

const btnConsultar =
    document.getElementById("btnConsultar");

const btnTema =
    document.getElementById("btnTema");

const btnFavorito =
    document.getElementById("btnFavorito");

const btnConsultarFavorito =
    document.getElementById("btnConsultarFavorito");

const mensagem =
    document.getElementById("mensagem");

const carregando =
    document.getElementById("carregando");

const ultimaAtualizacao =
    document.getElementById("ultimaAtualizacao");

const temperatura =
    document.getElementById("temperatura");

const sensacao =
    document.getElementById("sensacao");

const umidade =
    document.getElementById("umidade");

const vento =
    document.getElementById("vento");

const pressao =
    document.getElementById("pressao");

const temperaturaMin =
    document.getElementById("temperaturaMin");

const temperaturaMax =
    document.getElementById("temperaturaMax");

const localizacao =
    document.getElementById("localizacao");

const condicaoClima =
    document.getElementById("condicaoClima");

const nascerSol =
    document.getElementById("nascerSol");

const porSol =
    document.getElementById("porSol");

const historico =
    document.getElementById("historico");

const cidadeFavorita =
    document.getElementById("cidadeFavorita");

const statusMQTT =
    document.getElementById("statusMQTT");

const textoMQTT =
    document.getElementById("textoMQTT");


/* =========================================================
   4. VARIÁVEIS
   ========================================================= */

let ultimaCidadeConsultada = "";

let ultimoPaisConsultado = "BR";

let grafico;


/* =========================================================
   5. CONECTAR AO MQTT
   ========================================================= */

let client;

try {

    client = mqtt.connect(MQTT_BROKER);

    client.on("connect", () => {

        console.log("✅ MQTT conectado");

        statusMQTT.style.background = "#16a34a";

        textoMQTT.textContent =
            "Conectado ao MQTT";


        // Assinar temperatura

        client.subscribe(
            TOPIC_TEMPERATURA,
            (erro) => {

                if (erro) {

                    console.error(
                        "Erro ao assinar temperatura:",
                        erro
                    );

                }

            }
        );


        // Assinar umidade

        client.subscribe(
            TOPIC_UMIDADE,
            (erro) => {

                if (erro) {

                    console.error(
                        "Erro ao assinar umidade:",
                        erro
                    );

                }

            }
        );


        // Assinar cidade

        client.subscribe(
            TOPIC_CIDADE_ATUAL,
            (erro) => {

                if (erro) {

                    console.error(
                        "Erro ao assinar cidade:",
                        erro
                    );

                }

            }
        );

    });


    client.on("reconnect", () => {

        console.log("🔄 Tentando reconectar MQTT...");

        textoMQTT.textContent =
            "Reconectando MQTT...";

    });


    client.on("offline", () => {

        console.log("⚠️ MQTT offline");

        statusMQTT.style.background = "#f59e0b";

        textoMQTT.textContent =
            "MQTT offline";

    });


    client.on("error", (erro) => {

        console.error(
            "❌ Erro MQTT:",
            erro
        );

        statusMQTT.style.background = "#dc2626";

        textoMQTT.textContent =
            "Erro na conexão MQTT";

    });

}
catch (erro) {

    console.error(
        "Erro ao iniciar MQTT:",
        erro
    );

}


/* =========================================================
   6. RECEBER MENSAGENS MQTT
   ========================================================= */

if (client) {

    
    client.on(
        "message",
        (topic, message) => {

            const valor =
                message.toString();

            console.log(
                "📡 MQTT:",
                topic,
                valor
            );


            // Temperatura

            if (
                topic === TOPIC_TEMPERATURA
            ) {

                const valorNumerico =
                    parseFloat(valor);

                if (!isNaN(valorNumerico)) {

                    temperatura.textContent =
                        `${valorNumerico.toFixed(1)} °C`;

                }

            }


            // Umidade

            if (
                topic === TOPIC_UMIDADE
            ) {

                const valorNumerico =
                    parseFloat(valor);

                if (!isNaN(valorNumerico)) {

                    umidade.textContent =
                        `${valorNumerico} %`;

                }

            }


            // Cidade

            if (
                topic === TOPIC_CIDADE_ATUAL
            ) {

                localizacao.textContent =
                    valor;

            }

        }
    );

}


/* =========================================================
   7. CRIAR GRÁFICO
   ========================================================= */

function criarGrafico() {

    const canvas =
        document.getElementById(
            "graficoClima"
        );


    if (!canvas) {

        console.error(
            "Canvas do gráfico não encontrado."
        );

        return;

    }


    const ctx =
        canvas.getContext("2d");


    grafico = new Chart(
        ctx,
        {

            type: "line",

            data: {

                labels: [],

                datasets: [

                    {
                        label:
                            "Temperatura (°C)",

                        data: [],

                        borderColor:
                            "#ef4444",

                        backgroundColor:
                            "rgba(239, 68, 68, 0.15)",

                        borderWidth: 3,

                        fill: true,

                        tension: 0.3
                    },

                    {
                        label:
                            "Umidade (%)",

                        data: [],

                        borderColor:
                            "#2563eb",

                        backgroundColor:
                            "rgba(37, 99, 235, 0.15)",

                        borderWidth: 3,

                        fill: true,

                        tension: 0.3
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    title: {

                        display: true,

                        text:
                            "Histórico meteorológico"

                    },

                    legend: {

                        display: true

                    }

                },

                scales: {

                    x: {

                        title: {

                            display: true,

                            text: "Horário"

                        }

                    },

                    y: {

                        title: {

                            display: true,

                            text: "Valor"

                        }

                    }

                }

            }

        }
    );

}


/* =========================================================
   8. ADICIONAR DADOS AO GRÁFICO
   ========================================================= */

function adicionarAoGrafico(
    temperaturaValor,
    umidadeValor
) {

    if (!grafico) {

        return;

    }


    const hora =
        new Date().toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    grafico.data.labels.push(hora);


    grafico.data.datasets[0]
        .data
        .push(temperaturaValor);


    grafico.data.datasets[1]
        .data
        .push(umidadeValor);


    // Limitar gráfico a 20 consultas

    while (
        grafico.data.labels.length > 20
    ) {

        grafico.data.labels.shift();

        grafico.data.datasets.forEach(
            (dataset) => {

                dataset.data.shift();

            }
        );

    }


    grafico.update();

}


/* =========================================================
   9. CONSULTAR CLIMA
   ========================================================= */

async function consultarClima() {

    const cidade =
        cidadeInput.value.trim();


    const pais =
        paisInput.value.trim().toUpperCase();


    // Verificar cidade

    if (!cidade) {

        mostrarMensagem(
            "Informe uma cidade antes de realizar a consulta.",
            "erro"
        );

        cidadeInput.focus();

        return;

    }


    // Verificar API Key

    if (
        !OPENWEATHER_API_KEY ||
        OPENWEATHER_API_KEY.trim() === ""
    ) {

        mostrarMensagem(
            "Configure sua API Key da OpenWeatherMap no arquivo script.js.",
            "erro"
        );

        return;

    }


    // Iniciar carregamento

    mostrarCarregamento(true);

    esconderMensagem();


    btnConsultar.disabled = true;


    try {

        const url =
            "https://api.openweathermap.org/data/2.5/weather" +
            "?q=" +
            encodeURIComponent(cidade) +
            "," +
            encodeURIComponent(pais) +
            "&appid=" +
            OPENWEATHER_API_KEY +
            "&units=metric" +
            "&lang=pt_br";


        console.log(
            "🌐 Consultando:",
            url
        );


        const resposta =
            await fetch(url);


        /* =================================================
           TRATAMENTO DOS ERROS DA API
           ================================================= */

        if (
            resposta.status === 404
        ) {

            throw new Error(
                "Cidade não encontrada. Verifique o nome informado."
            );

        }


        if (
            resposta.status === 401
        ) {

            throw new Error(
                "API Key inválida. Verifique sua chave da OpenWeatherMap."
            );

        }


        if (!resposta.ok) {

            throw new Error(
                "Não foi possível consultar os dados meteorológicos."
            );

        }


        const dados =
            await resposta.json();


        console.log(
            "☁️ Dados recebidos:",
            dados
        );


        // Exibir os dados

        exibirClima(dados);


        // Adicionar ao histórico

        adicionarHistorico(dados);


        // Atualizar data/hora

        atualizarDataHora();


        // Guardar cidade atual

        ultimaCidadeConsultada =
            dados.name;

        ultimoPaisConsultado =
            dados.sys.country;


        // Publicar MQTT

        publicarMQTT(dados);


        // Mensagem de sucesso

        mostrarMensagem(
            `Clima de ${dados.name} atualizado com sucesso!`,
            "sucesso"
        );

    }
    catch (erro) {

        console.error(
            "❌ Erro:",
            erro
        );


        mostrarMensagem(
            erro.message ||
            "Não foi possível consultar os dados.",
            "erro"
        );

    }
    finally {

        mostrarCarregamento(false);

        btnConsultar.disabled = false;

    }

}


/* =========================================================
   10. EXIBIR DADOS DO CLIMA
   ========================================================= */

function exibirClima(dados) {

    const temp =
        dados.main.temp;

    const sensacaoTermica =
        dados.main.feels_like;

    const umidadeValor =
        dados.main.humidity;

    const ventoValor =
        dados.wind.speed * 3.6;

    const pressaoValor =
        dados.main.pressure;

    const tempMin =
        dados.main.temp_min;

    const tempMax =
        dados.main.temp_max;

    const nomeCidade =
        dados.name;

    const pais =
        dados.sys.country;

    const descricao =
        dados.weather[0].description;


    // Temperatura

    temperatura.textContent =
        `${temp.toFixed(1)} °C`;


    // Sensação

    sensacao.textContent =
        `${sensacaoTermica.toFixed(1)} °C`;


    // Umidade

    umidade.textContent =
        `${umidadeValor} %`;


    // Vento

    vento.textContent =
        `${ventoValor.toFixed(1)} km/h`;


    // Pressão

    pressao.textContent =
        `${pressaoValor} hPa`;


    // Temperatura mínima

    temperaturaMin.textContent =
        `${tempMin.toFixed(1)} °C`;


    // Temperatura máxima

    temperaturaMax.textContent =
        `${tempMax.toFixed(1)} °C`;


    // Localização

    localizacao.textContent =
        `${nomeCidade}, ${pais}`;


    // Condição climática

    condicaoClima.textContent =
        capitalizar(descricao);


    // Nascer do sol

    nascerSol.textContent =
        formatarHorario(
            dados.sys.sunrise,
            dados.timezone
        );


    // Pôr do sol

    porSol.textContent =
        formatarHorario(
            dados.sys.sunset,
            dados.timezone
        );


    // Atualizar gráfico

    adicionarAoGrafico(
        temp,
        umidadeValor
    );

}


/* =========================================================
   11. FORMATAR HORÁRIO
   ========================================================= */

function formatarHorario(
    timestamp,
    timezone
) {

    const data =
        new Date(
            (timestamp + timezone) * 1000
        );


    const horas =
        String(
            data.getUTCHours()
        ).padStart(2, "0");


    const minutos =
        String(
            data.getUTCMinutes()
        ).padStart(2, "0");


    return `${horas}:${minutos}`;

}


/* =========================================================
   12. CAPITALIZAR TEXTO
   ========================================================= */

function capitalizar(texto) {

    if (!texto) {

        return "--";

    }


    return texto.charAt(0).toUpperCase()
        + texto.slice(1);

}


/* =========================================================
   13. ATUALIZAR DATA E HORA
   ========================================================= */

function atualizarDataHora() {

    const agora =
        new Date();


    const data =
        agora.toLocaleDateString(
            "pt-BR"
        );


    const hora =
        agora.toLocaleTimeString(
            "pt-BR",
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    ultimaAtualizacao.textContent =
        `${data} — ${hora}`;

}


/* =========================================================
   14. MENSAGENS
   ========================================================= */

function mostrarMensagem(
    texto,
    tipo
) {

    mensagem.textContent =
        texto;


    mensagem.style.display =
        "block";


    if (tipo === "erro") {

        mensagem.style.background =
            "#fee2e2";

        mensagem.style.color =
            "#991b1b";

    }
    else {

        mensagem.style.background =
            "#dcfce7";

        mensagem.style.color =
            "#166534";

    }

}


function esconderMensagem() {

    mensagem.textContent =
        "";

    mensagem.style.display =
        "none";

}


/* =========================================================
   15. CARREGAMENTO
   ========================================================= */

function mostrarCarregamento(
    mostrar
) {

    if (mostrar) {

        carregando.style.display =
            "block";

    }
    else {

        carregando.style.display =
            "none";

    }

}


/* =========================================================
   16. PUBLICAR MQTT
   ========================================================= */

function publicarMQTT(dados) {

    if (
        !client ||
        !client.connected
    ) {

        console.log(
            "⚠️ MQTT não conectado."
        );

        return;

    }


    const temperaturaMQTT =
        dados.main.temp;


    const umidadeMQTT =
        dados.main.humidity;


    const cidadeMQTT =
        `${dados.name}, ${dados.sys.country}`;


    // Temperatura

    client.publish(
        TOPIC_TEMPERATURA,
        temperaturaMQTT.toString()
    );


    // Umidade

    client.publish(
        TOPIC_UMIDADE,
        umidadeMQTT.toString()
    );


    // Cidade

    client.publish(
        TOPIC_CIDADE_ATUAL,
        cidadeMQTT
    );


    console.log(
        "📤 Dados publicados no MQTT"
    );

}


/* =========================================================
   17. HISTÓRICO
   ========================================================= */

function adicionarHistorico(
    dados
) {

    let lista =
        JSON.parse(
            localStorage.getItem(
                "historicoClima"
            )
        ) || [];


    const registro = {

        cidade:
            dados.name,

        pais:
            dados.sys.country,

        temperatura:
            dados.main.temp,

        umidade:
            dados.main.humidity,

        data:
            new Date().toLocaleString(
                "pt-BR"
            )

    };


    // Colocar o mais recente primeiro

    lista.unshift(registro);


    // Limitar a 6 consultas

    lista =
        lista.slice(0, 6);


    localStorage.setItem(
        "historicoClima",
        JSON.stringify(lista)
    );


    exibirHistorico();

}


/* =========================================================
   18. EXIBIR HISTÓRICO
   ========================================================= */

function exibirHistorico() {

    const lista =
        JSON.parse(
            localStorage.getItem(
                "historicoClima"
            )
        ) || [];


    if (lista.length === 0) {

        historico.innerHTML = `
            <p class="historico-vazio">
                Nenhuma consulta realizada ainda.
            </p>
        `;

        return;

    }


    historico.innerHTML =
        "";


    lista.forEach(
        (item) => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "historico-item";


            div.innerHTML = `
                <h3>
                    📍 ${item.cidade}, ${item.pais}
                </h3>

                <p>
                    🌡️ Temperatura:
                    <strong>
                        ${item.temperatura.toFixed(1)} °C
                    </strong>
                </p>

                <p>
                    💧 Umidade:
                    <strong>
                        ${item.umidade} %
                    </strong>
                </p>

                <p>
                    🕐 ${item.data}
                </p>
            `;


            historico.appendChild(
                div
            );

        }
    );

}


/* =========================================================
   19. SALVAR CIDADE FAVORITA
   ========================================================= */

function salvarFavorito() {

    if (!ultimaCidadeConsultada) {

        mostrarMensagem(
            "Consulte uma cidade antes de salvá-la como favorita.",
            "erro"
        );

        return;

    }


    const favorito = {

        cidade:
            ultimaCidadeConsultada,

        pais:
            ultimoPaisConsultado

    };


    localStorage.setItem(
        "cidadeFavorita",
        JSON.stringify(favorito)
    );


    exibirFavorito();


    mostrarMensagem(
        "⭐ Cidade salva como favorita!",
        "sucesso"
    );

}


/* =========================================================
   20. EXIBIR CIDADE FAVORITA
   ========================================================= */

function exibirFavorito() {

    const favorito =
        JSON.parse(
            localStorage.getItem(
                "cidadeFavorita"
            )
        );


    if (!favorito) {

        cidadeFavorita.textContent =
            "Nenhuma cidade favorita.";

        return;

    }


    cidadeFavorita.textContent =
        `${favorito.cidade}, ${favorito.pais}`;

}


/* =========================================================
   21. CONSULTAR FAVORITO
   ========================================================= */

function consultarFavorito() {

    const favorito =
        JSON.parse(
            localStorage.getItem(
                "cidadeFavorita"
            )
        );


    if (!favorito) {

        mostrarMensagem(
            "Você ainda não possui uma cidade favorita.",
            "erro"
        );

        return;

    }


    cidadeInput.value =
        favorito.cidade;


    paisInput.value =
        favorito.pais;


    consultarClima();

}


/* =========================================================
   22. MODO ESCURO
   ========================================================= */

function alternarTema() {

    document.body.classList.toggle(
        "modo-escuro"
    );


    const modoEscuro =
        document.body.classList.contains(
            "modo-escuro"
        );


    localStorage.setItem(
        "modoEscuro",
        modoEscuro
    );


    if (modoEscuro) {

        btnTema.textContent =
            "☀️ Modo claro";

    }
    else {

        btnTema.textContent =
            "🌙 Modo escuro";

    }

}


/* =========================================================
   23. CARREGAR TEMA SALVO
   ========================================================= */

function carregarTema() {

    const modoEscuro =
        localStorage.getItem(
            "modoEscuro"
        );


    if (
        modoEscuro === "true"
    ) {

        document.body.classList.add(
            "modo-escuro"
        );


        btnTema.textContent =
            "☀️ Modo claro";

    }

}


/* =========================================================
   24. EVENTO DO BOTÃO CONSULTAR
   ========================================================= */

btnConsultar.addEventListener(
    "click",
    consultarClima
);


/* =========================================================
   25. ENTER NO CAMPO CIDADE
   ========================================================= */

cidadeInput.addEventListener(
    "keydown",
    (evento) => {

        if (
            evento.key === "Enter"
        ) {

            consultarClima();

        }

    }
);


/* =========================================================
   26. BOTÃO MODO ESCURO
   ========================================================= */

btnTema.addEventListener(
    "click",
    alternarTema
);


/* =========================================================
   27. BOTÃO FAVORITO
   ========================================================= */

btnFavorito.addEventListener(
    "click",
    salvarFavorito
);


/* =========================================================
   28. CONSULTAR FAVORITO
   ========================================================= */

btnConsultarFavorito.addEventListener(
    "click",
    consultarFavorito
);


/* =========================================================
   29. INICIALIZAÇÃO
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        criarGrafico();

        exibirHistorico();

        exibirFavorito();

        carregarTema();

        console.log(
            "✅ Dashboard Meteorológico iniciado."
        );

    }
);