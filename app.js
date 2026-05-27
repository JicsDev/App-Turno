const dataAtual = new Date();
let mesAtual = dataAtual.getMonth(); 
let anoAtual = dataAtual.getFullYear();

const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

let registros = JSON.parse(localStorage.getItem('turnos_registros')) || {};
let valorPorTurnoConfigurado = parseFloat(localStorage.getItem('turno_valor')) || 0; 

function renderizarCalendario(mes, ano) {
    document.getElementById('nomeMesAno').textContent = `${nomesMeses[mes]} de ${ano}`;
    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = ''; 

    const primeiroDiaDaSemana = new Date(ano, mes, 1).getDay();
    const totalDiasNoMes = new Date(ano, mes + 1, 0).getDate();

    for (let i = 0; i < primeiroDiaDaSemana; i++) {
        const diaVazio = document.createElement('div');
        diaVazio.className = 'calendar-day empty';
        diaVazio.style.backgroundColor = 'transparent';
        diaVazio.style.boxShadow = 'none';
        grid.appendChild(diaVazio);
    }

    for (let dia = 1; dia <= totalDiasNoMes; dia++) {
        const diaDiv = document.createElement('div');
        diaDiv.className = 'calendar-day';
        
        const isHoje = dia === dataAtual.getDate() && mes === dataAtual.getMonth() && ano === dataAtual.getFullYear();
        if (isHoje) {
            diaDiv.style.border = '2px solid var(--primary-color)';
        }

        diaDiv.innerHTML = `<div class="day-number">${dia}</div>`;

        const dataFormatada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        
        if (registros[dataFormatada]) {
            const tipo = registros[dataFormatada];
            if (tipo === 'turno') { diaDiv.classList.add('bg-turno'); diaDiv.innerHTML += `<div class="nome-registro">Turno</div>`; }
            else if (tipo === 'folga') { diaDiv.classList.add('bg-folga'); diaDiv.innerHTML += `<div class="nome-registro">Folga</div>`; }
            else if (tipo === 'falta') { diaDiv.classList.add('bg-falta'); diaDiv.innerHTML += `<div class="nome-registro">Falta</div>`; }
            else if (tipo === 'falta_justificada') { diaDiv.classList.add('bg-justificada'); diaDiv.innerHTML += `<div class="nome-registro">Justificada</div>`; }
            else if (tipo === 'doente') { diaDiv.classList.add('bg-doente'); diaDiv.innerHTML += `<div class="nome-registro">Atestado</div>`; }
        }

        diaDiv.onclick = () => abrirModalTurno(dataFormatada);
        grid.appendChild(diaDiv);
    }

    atualizarEstatisticas(mes, ano);
}

function atualizarEstatisticas(mes, ano) {
    let qtdTurnos = 0, qtdFolgas = 0, qtdFaltas = 0, qtdJustificadas = 0, qtdDoente = 0;

    for (let data in registros) {
        let [anoReg, mesReg, diaReg] = data.split('-');
        if (parseInt(anoReg) === ano && parseInt(mesReg) === mes + 1) {
            let tipo = registros[data];
            if (tipo === 'turno') qtdTurnos++;
            if (tipo === 'folga') qtdFolgas++;
            if (tipo === 'falta') qtdFaltas++;
            if (tipo === 'falta_justificada') qtdJustificadas++;
            if (tipo === 'doente') qtdDoente++;
        }
    }

    let valorEstimado = qtdTurnos * valorPorTurnoConfigurado;

    const valoresHtml = document.querySelectorAll('.stat-value');
    valoresHtml[0].textContent = `R$ ${valorEstimado.toFixed(2).replace('.', ',')}`;
    valoresHtml[1].textContent = String(qtdTurnos).padStart(2, '0');
    valoresHtml[2].textContent = String(qtdFolgas).padStart(2, '0');
    valoresHtml[3].textContent = String(qtdFaltas).padStart(2, '0');
    valoresHtml[4].textContent = String(qtdJustificadas).padStart(2, '0');
    valoresHtml[5].textContent = String(qtdDoente).padStart(2, '0');
}

function mesAnterior() { mesAtual--; if (mesAtual < 0) { mesAtual = 11; anoAtual--; } renderizarCalendario(mesAtual, anoAtual); }
function proximoMes() { mesAtual++; if (mesAtual > 11) { mesAtual = 0; anoAtual++; } renderizarCalendario(mesAtual, anoAtual); }

function abrirModalTurno(dataClique) {
    const modal = document.getElementById('modalRegistro');
    const inputData = document.getElementById('dataRegistro');
    const selectTipo = document.getElementById('tipoRegistro');
    const btnExcluir = document.getElementById('btnExcluir');
    
    if (dataClique) {
        inputData.value = dataClique;
        if (registros[dataClique]) { selectTipo.value = registros[dataClique]; btnExcluir.style.display = 'block'; }
        else { selectTipo.value = 'turno'; btnExcluir.style.display = 'none'; }
    } else {
        const hoje = new Date();
        inputData.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
        selectTipo.value = 'turno';
        btnExcluir.style.display = 'none';
    }
    modal.style.display = 'flex';
}

function fecharModal() { document.getElementById('modalRegistro').style.display = 'none'; }

function salvarRegistro() {
    const tipo = document.getElementById('tipoRegistro').value;
    const data = document.getElementById('dataRegistro').value;
    if (!data) return alert("Por favor, selecione uma data!");
    registros[data] = tipo;
    localStorage.setItem('turnos_registros', JSON.stringify(registros));
    fecharModal();
    renderizarCalendario(mesAtual, anoAtual);
}

function apagarRegistro() {
    const data = document.getElementById('dataRegistro').value;
    if (registros[data]) {
        delete registros[data]; 
        localStorage.setItem('turnos_registros', JSON.stringify(registros)); 
        renderizarCalendario(mesAtual, anoAtual); 
    }
    fecharModal();
}

function abrirModalConfig() {
    document.getElementById('valorTurnoConfig').value = valorPorTurnoConfigurado > 0 ? valorPorTurnoConfigurado : '';
    document.getElementById('modalConfig').style.display = 'flex';
}
function fecharModalConfig() { document.getElementById('modalConfig').style.display = 'none'; }
function salvarConfig() {
    valorPorTurnoConfigurado = parseFloat(document.getElementById('valorTurnoConfig').value) || 0;
    localStorage.setItem('turno_valor', valorPorTurnoConfigurado);
    fecharModalConfig();
    atualizarEstatisticas(mesAtual, anoAtual);
}

// --- NOVAS FUNÇÕES DO RELATÓRIO ---
function abrirModalRelatorio() {
    document.getElementById('tituloRelatorio').textContent = `Relatório de ${nomesMeses[mesAtual]} / ${anoAtual}`;
    const conteudo = document.getElementById('conteudoRelatorio');
    conteudo.innerHTML = ''; // Limpa antes de gerar

    let diasTrabalhados = [];
    let qtdTurnos = 0;

    // Filtra apenas os registros do mês atual que estamos visualizando
    for (let data in registros) {
        let [anoReg, mesReg, diaReg] = data.split('-');
        if (parseInt(anoReg) === anoAtual && parseInt(mesReg) === mesAtual + 1) {
            
            // Traduz o código salvo para um texto bonito
            let textoTipo = "";
            if (registros[data] === 'turno') { textoTipo = "Turno Trabalhado"; qtdTurnos++; }
            if (registros[data] === 'folga') textoTipo = "Folga";
            if (registros[data] === 'falta') textoTipo = "Falta";
            if (registros[data] === 'falta_justificada') textoTipo = "Falta Justificada";
            if (registros[data] === 'doente') textoTipo = "Atestado";

            // Guarda numa lista para podermos organizar por dia
            diasTrabalhados.push({ dia: diaReg, tipo: textoTipo });
        }
    }

    // Organiza a lista do dia 01 até o dia 31
    diasTrabalhados.sort((a, b) => parseInt(a.dia) - parseInt(b.dia));

    if (diasTrabalhados.length === 0) {
        conteudo.innerHTML = '<p style="text-align:center; color:#6b7280; padding: 20px 0;">Nenhum registro encontrado neste mês.</p>';
    } else {
        // Cria a linha para cada dia
        diasTrabalhados.forEach(item => {
            conteudo.innerHTML += `
                <div class="linha-relatorio">
                    <span>Dia ${item.dia}</span>
                    <span>${item.tipo}</span>
                </div>
            `;
        });

        // Cria a linha de resumo final
        let valorTotal = qtdTurnos * valorPorTurnoConfigurado;
        conteudo.innerHTML += `
            <div class="linha-relatorio destaque">
                <span>Total de Turnos: ${qtdTurnos}</span>
                <span>R$ ${valorTotal.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
    }

    document.getElementById('modalRelatorio').style.display = 'flex';
}

function fecharModalRelatorio() {
    document.getElementById('modalRelatorio').style.display = 'none';
}

function imprimirRelatorio() {
    window.print(); // Chama a tela nativa de impressão/PDF do celular
}

window.onload = () => {
    renderizarCalendario(mesAtual, anoAtual);
    document.getElementById('btnAnterior').addEventListener('click', mesAnterior);
    document.getElementById('btnProximo').addEventListener('click', proximoMes);
};
