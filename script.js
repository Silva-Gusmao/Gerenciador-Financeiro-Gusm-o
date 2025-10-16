let transacoes = [];

const descricaoInput = document.getElementById("descricao");
const valorInput = document.getElementById("valor");
const dataInput = document.getElementById("data");
const categoriaSelect = document.getElementById("categoria");
const tipoSelect = document.getElementById("tipo");
const lista = document.getElementById("lista-transacoes");
const saldo = document.getElementById("saldo");
const totalReceitas = document.getElementById("total-receitas");
const totalDespesas = document.getElementById("total-despesas");
const botaoAdicionar = document.getElementById("adicionar");
let grafico = null;

// Adicionar transação
botaoAdicionar.addEventListener("click", adicionarTransacao);
[descricaoInput, valorInput, dataInput].forEach(el => {
  el.addEventListener("keydown", e => { if(e.key==="Enter") adicionarTransacao(); });
});

function adicionarTransacao(){
  const descricao = descricaoInput.value.trim();
  const valor = parseFloat(valorInput.value);
  const data = dataInput.value;
  const categoria = categoriaSelect.value;
  const tipo = tipoSelect.value;

  if(!descricao || isNaN(valor) || valor <= 0 || !data || !categoria){
    alert("Preencha todos os campos corretamente!");
    return;
  }

  transacoes.push({ descricao, valor, tipo, data, categoria, id: Date.now() });
  salvarLocalStorage();
  atualizarInterface();

  descricaoInput.value = "";
  valorInput.value = "";
  dataInput.value = "";
  categoriaSelect.value = "";
  descricaoInput.focus();
}

function atualizarInterface(){
  atualizarLista();
  atualizarResumo();
  atualizarGrafico();
}

function atualizarLista(){
  lista.innerHTML = "";
  [...transacoes].reverse().forEach(t => {
    const li = document.createElement("li");
    li.classList.add(t.tipo);
    li.innerHTML = `
      <div class="info">
        <strong>${escapeHtml(t.descricao)}</strong>
        <div style="font-size:0.85rem;color:rgba(255,255,255,0.55)">
          ${t.tipo==='receita'?'Receita':'Despesa'} • ${t.categoria} • ${t.data}
        </div>
      </div>
      <div class="right">
        <div style="font-family:'Orbitron',monospace">${formatReal(t.valor)}</div>
        <button class="remove-btn" data-id="${t.id}" title="Remover">✖</button>
      </div>
    `;
    lista.appendChild(li);
  });

  lista.querySelectorAll(".remove-btn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = Number(btn.getAttribute("data-id"));
      transacoes = transacoes.filter(t=>t.id!==id);
      salvarLocalStorage();
      atualizarInterface();
    });
  });
}

function atualizarResumo(){
  const receitas = transacoes.filter(t=>t.tipo==="receita").reduce((acc,t)=>acc+t.valor,0);
  const despesas = transacoes.filter(t=>t.tipo==="despesa").reduce((acc,t)=>acc+t.valor,0);

  saldo.textContent = formatReal(receitas - despesas);
  totalReceitas.textContent = formatReal(receitas);
  totalDespesas.textContent = formatReal(despesas);
}

function atualizarGrafico(){
  const receitas = transacoes.filter(t=>t.tipo==="receita").reduce((acc,t)=>acc+t.valor,0);
  const despesas = transacoes.filter(t=>t.tipo==="despesa").reduce((acc,t)=>acc+t.valor,0);

  const ctx = document.getElementById("grafico").getContext("2d");
  if(grafico) grafico.destroy();

  grafico = new Chart(ctx,{
    type:"doughnut",
    data:{
      labels:["Receitas","Despesas"],
      datasets:[{
        data:[receitas,despesas],
        backgroundColor:['rgba(0,245,255,0.95)','rgba(184,255,0,0.95)'],
        borderWidth:1,
        borderColor:'rgba(10,10,10,0.6)'
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{
        legend:{position:'bottom', labels:{color:'#e8fbfb', usePointStyle:true, padding:12, boxWidth:12}},
        tooltip:{backgroundColor:'#0a0a0a', titleColor:'#00f5ff', bodyColor:'#bfffa3', borderColor:'rgba(255,255,255,0.04)', borderWidth:1}
      }
    }
  });
}

function salvarLocalStorage(){ localStorage.setItem("transacoes_neon", JSON.stringify(transacoes)); }
function carregarLocalStorage(){ const dados = localStorage.getItem("transacoes_neon"); if(dados) transacoes=JSON.parse(dados); atualizarInterface(); }

function formatReal(num){ return num.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
function escapeHtml(str){ return str.replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

carregarLocalStorage();
