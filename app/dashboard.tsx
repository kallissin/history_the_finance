"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import {
  ArrowDownLeft, ArrowUpRight, CalendarDays, Check, ChevronDown, CircleHelp,
  CreditCard, FileText, Hammer, LayoutDashboard, LogOut, Plus, Search,
  Wallet, Wrench, X, LoaderCircle, Trash2, RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Source = { id: string; name: string; kind: "CREDIT_CARD" | "BANK_ACCOUNT" | "CASH" | "OTHER" };
type Installment = { id: string; installment_number: number; amount: number | string; due_date: string; status: "PENDING" | "PAID"; paid_at: string | null };
type Expense = {
  id: string; description: string; category: string; supplier: string | null;
  total_amount: number | string; purchase_date: string; payment_method: string;
  payment_source_id: string | null; installments_count: number;
  payment_sources: { name: string; kind: string } | null;
  expense_installments: Installment[];
};
const categories = ["Alvenaria", "Acabamento", "Elétrica", "Hidráulica", "Mão de obra", "Marcenaria", "Pintura", "Projeto", "Materiais", "Outros"];
const methods = [
  ["PIX","PIX"],["DEBIT","Débito"],["CREDIT_ONE_TIME","Crédito à vista"],
  ["CREDIT_INSTALLMENTS","Crédito parcelado"],["CASH","Dinheiro"],
  ["FUTURE_DEPOSIT","Depósito / pagamento futuro"],
];
const money = (value: number) => value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const dateBR = (value: string) => new Date(value+"T12:00:00").toLocaleDateString("pt-BR");
const monthKey = (value: string) => value.slice(0,7);
const methodLabel = (value: string) => methods.find(([key])=>key===value)?.[1] ?? value;
const monthName = (value: string) => new Date(value+"-15T12:00:00").toLocaleDateString("pt-BR",{month:"short",year:"2-digit"}).replace(".","");

export default function Dashboard({email}:{email:string}) {
  const supabase = useMemo(()=>createClient(),[]);
  const [expenses,setExpenses] = useState<Expense[]>([]);
  const [sources,setSources] = useState<Source[]>([]);
  const [active,setActive] = useState("Visão geral");
  const [search,setSearch] = useState("");
  const [month,setMonth] = useState("all");
  const [sourceFilter,setSourceFilter] = useState("all");
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState("");
  const [success,setSuccess] = useState("");
  const [showExpense,setShowExpense] = useState(false);
  const [showSource,setShowSource] = useState(false);
  const [description,setDescription] = useState("");
  const [category,setCategory] = useState("Materiais");
  const [supplier,setSupplier] = useState("");
  const [amount,setAmount] = useState("");
  const [purchaseDate,setPurchaseDate] = useState(new Date().toISOString().slice(0,10));
  const [method,setMethod] = useState("PIX");
  const [sourceId,setSourceId] = useState("");
  const [count,setCount] = useState("1");
  const [firstDue,setFirstDue] = useState(new Date().toISOString().slice(0,10));
  const [notes,setNotes] = useState("");
  const [sourceName,setSourceName] = useState("");
  const [sourceKind,setSourceKind] = useState<Source["kind"]>("CREDIT_CARD");

  const load = useCallback(async()=>{
    setLoading(true); setError("");
    const [expenseResult,sourceResult] = await Promise.all([
      supabase.from("expenses").select("id,description,category,supplier,total_amount,purchase_date,payment_method,payment_source_id,installments_count,payment_sources!expenses_payment_source_id_fkey(name,kind),expense_installments!expense_installments_expense_id_fkey(id,installment_number,amount,due_date,status,paid_at)").order("purchase_date",{ascending:false}),
      supabase.from("payment_sources").select("id,name,kind").order("name"),
    ]);
    if(expenseResult.error) setError(expenseResult.error.message);
    else setExpenses((expenseResult.data ?? []) as unknown as Expense[]);
    if(sourceResult.error) setError(sourceResult.error.message);
    else setSources((sourceResult.data ?? []) as Source[]);
    setLoading(false);
  },[supabase]);

  useEffect(()=>{ void load(); },[load]);

  const allInstallments = useMemo(()=>expenses.flatMap(e=>e.expense_installments.map(i=>({...i,expense:e}))),[expenses]);
  const total = expenses.reduce((sum,e)=>sum+Number(e.total_amount),0);
  const paid = allInstallments.filter(i=>i.status==="PAID").reduce((sum,i)=>sum+Number(i.amount),0);
  const pending = allInstallments.filter(i=>i.status==="PENDING").reduce((sum,i)=>sum+Number(i.amount),0);
  const periodExpenses = expenses.filter(e=>(month==="all"||monthKey(e.purchase_date)===month)&&(sourceFilter==="all"||e.payment_source_id===sourceFilter));
  const periodInstallments = allInstallments.filter(i=>(month==="all"||monthKey(i.due_date)===month)&&(sourceFilter==="all"||i.expense.payment_source_id===sourceFilter));
  const periodTotal = periodExpenses.reduce((sum,e)=>sum+Number(e.total_amount),0);
  const periodPaid = periodInstallments.filter(i=>i.status==="PAID").reduce((sum,i)=>sum+Number(i.amount),0);
  const periodPending = periodInstallments.filter(i=>i.status==="PENDING").reduce((sum,i)=>sum+Number(i.amount),0);
  const thisMonth = new Date().toISOString().slice(0,7);
  const monthlyPaid = allInstallments.filter(i=>i.status==="PAID"&&monthKey(i.paid_at?.slice(0,10)??i.due_date)===thisMonth).reduce((s,i)=>s+Number(i.amount),0);

  const filteredExpenses = useMemo(()=>expenses.filter(e=>
    (e.description+" "+(e.supplier??"")+" "+e.category).toLowerCase().includes(search.toLowerCase()) &&
    (month==="all"||monthKey(e.purchase_date)===month) &&
    (sourceFilter==="all"||e.payment_source_id===sourceFilter)
  ),[expenses,search,month,sourceFilter]);
  const filteredInstallments = useMemo(()=>allInstallments.filter(i=>
    (i.expense.description+" "+(i.expense.supplier??"")).toLowerCase().includes(search.toLowerCase()) &&
    (month==="all"||monthKey(i.due_date)===month) &&
    (sourceFilter==="all"||i.expense.payment_source_id===sourceFilter)
  ),[allInstallments,search,month,sourceFilter]);

  const chartData = useMemo(()=>{
    const map = new Map<string,number>();
    periodInstallments.filter(i=>i.status==="PAID").forEach(i=>{
      const key=monthKey((i.paid_at??i.due_date).slice(0,10));
      map.set(key,(map.get(key)??0)+Number(i.amount));
    });
    return [...map.entries()].sort(([a],[b])=>a.localeCompare(b)).slice(-6).map(([key,value])=>({month:monthName(key),value}));
  },[periodInstallments]);
  const paymentGroups = useMemo(()=>{
    const map = new Map<string,number>();
    periodExpenses.forEach(e=>{const label=e.payment_sources?.name??methodLabel(e.payment_method);map.set(label,(map.get(label)??0)+Number(e.total_amount));});
    return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  },[periodExpenses]);
  const categoriesSummary = useMemo(()=>{
    const map=new Map<string,number>();
    periodExpenses.forEach(e=>map.set(e.category,(map.get(e.category)??0)+Number(e.total_amount)));
    return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  },[periodExpenses]);

  async function addExpense(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setSaving(true);setError("");setSuccess("");
    const value=Number(amount.replace(/\./g,"").replace(",","."));
    const installments=method==="CREDIT_INSTALLMENTS"?Number(count):1;
    if(!Number.isFinite(value)||value<=0){setError("Informe um valor válido.");setSaving(false);return;}
    const {data:expenseId,error:rpcError}=await supabase.rpc("create_expense_with_installments",{
      p_description:description.trim(),p_category:category,p_supplier:supplier.trim()||null,
      p_total_amount:value,p_purchase_date:purchaseDate,p_payment_method:method,
      p_payment_source_id:sourceId||null,p_installments_count:installments,
      p_first_due_date:firstDue,p_notes:notes.trim()||null,
    });
    setSaving(false);
    if(rpcError){setError(rpcError.message);return;}
    if (expenseId && ["PIX","DEBIT","CASH"].includes(method)) {
      const { error: paidError } = await supabase.from("expense_installments").update({status:"PAID",paid_at:new Date().toISOString()}).eq("expense_id",expenseId);
      if (paidError) { setError("Despesa criada, mas não foi possível confirmar o pagamento: "+paidError.message); await load(); setSaving(false); return; }
    }
    setShowExpense(false);setDescription("");setSupplier("");setAmount("");setNotes("");setCount("1");setMethod("PIX");setSourceId("");
    setSuccess("Despesa cadastrada e parcelas geradas.");await load();
  }

  async function addSource(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setSaving(true);setError("");
    const {error:insertError}=await supabase.from("payment_sources").insert({name:sourceName.trim(),kind:sourceKind});
    setSaving(false);
    if(insertError){setError(insertError.message);return;}
    setShowSource(false);setSourceName("");setSuccess("Cartão/conta cadastrado.");await load();
  }

  async function toggleInstallment(item:Installment){
    setError("");setSuccess("");
    const next=item.status==="PAID"?"PENDING":"PAID";
    const {error:updateError}=await supabase.from("expense_installments").update({status:next,paid_at:next==="PAID"?new Date().toISOString():null}).eq("id",item.id);
    if(updateError){setError(updateError.message);return;}
    setSuccess(next==="PAID"?"Parcela marcada como paga.":"Pagamento desfeito.");await load();
  }

  async function deleteExpense(id:string){
    if(!window.confirm("Excluir esta despesa e todas as suas parcelas?"))return;
    const {error:deleteError}=await supabase.from("expenses").delete().eq("id",id);
    if(deleteError){setError(deleteError.message);return;}
    setSuccess("Despesa excluída.");await load();
  }

  async function signOut(){await supabase.auth.signOut();window.location.assign("/login");}
  const nav=[["Visão geral",LayoutDashboard],["Despesas",FileText],["Parcelas",CalendarDays],["Cartões e contas",CreditCard],["Categorias",Hammer]] as const;

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark"><Wrench size={19}/></span><div><strong>obra<span>emdia</span></strong><small>CONTROLE DA REFORMA</small></div></div>
      <div className="nav-caption">MENU PRINCIPAL</div>
      {nav.map(([label,Icon])=><button key={label} className={"nav-item "+(active===label?"active":"")} onClick={()=>setActive(label)}><Icon size={18}/><span>{label}</span></button>)}
      <div className="sidebar-bottom"><div className="profile"><span className="avatar">{email.slice(0,1).toUpperCase()}</span><div className="profile-info"><b>Minha reforma</b><small>{email}</small></div></div><button className="nav-item signout" onClick={signOut}><LogOut size={17}/><span>Sair</span></button></div>
    </aside>
    <main className="main">
      <header className="page-header"><div><p className="eyebrow">CONTROLE FINANCEIRO DA REFORMA</p><h1>{active}</h1><p className="subtitle">Acompanhe cada custo, pagamento e compromisso futuro.</p></div><div className="header-actions"><button className="icon-button" onClick={()=>void load()} aria-label="Atualizar"><RefreshCw size={17}/></button><button className="primary-button" onClick={()=>setShowExpense(true)}><Plus size={17}/> Nova despesa</button></div></header>
      {(error||success)&&<div className={"notice "+(error?"error":"success")}>{error||success}<button onClick={()=>{setError("");setSuccess("");}} aria-label="Fechar"><X size={15}/></button></div>}
      <div className="filters"><div><label htmlFor="month-filter">Período</label><input id="month-filter" type="month" value={month==="all"?"":month} onChange={e=>setMonth(e.target.value||"all")}/><button className="text-button" onClick={()=>setMonth("all")}>Todos</button></div><div><label htmlFor="source-filter">Cartão / conta</label><select id="source-filter" value={sourceFilter} onChange={e=>setSourceFilter(e.target.value)}><option value="all">Todas as fontes</option>{sources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></div></div>

      {active==="Visão geral"&&<><section className="metrics">
        <Metric label="Custo total da obra" value={money(periodTotal)} note="Compras e serviços cadastrados" icon={<Hammer size={18}/>}/>
        <Metric label="Total já pago" value={money(periodPaid)} note="Desembolso confirmado por parcela" icon={<ArrowDownLeft size={18}/>} tone="green"/>
        <Metric label="Compromissos em aberto" value={money(periodPending)} note="Parcelas e pagamentos futuros" icon={<CalendarDays size={18}/>} tone="amber"/>
        <Metric label="Pago neste mês" value={money(monthlyPaid)} note="Baixas realizadas no mês atual" icon={<Wallet size={18}/>} tone="blue"/>
      </section><section className="overview-grid">
        <div className="panel chart-panel"><div className="panel-heading"><div><h2>Desembolso mensal</h2><p>Valores efetivamente pagos por mês</p></div><span className="tag">Últimos meses</span></div>
          {chartData.length?<div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData}><defs><linearGradient id="paidFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#39845e" stopOpacity={.2}/><stop offset="95%" stopColor="#39845e" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#89958e",fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#89958e",fontSize:10}} tickFormatter={v=>v>=1000?(v/1000).toFixed(1)+"k":String(v)} width={42}/><Tooltip formatter={(v)=>money(Number(v))}/><Area type="monotone" dataKey="value" name="Pago" stroke="#39845e" strokeWidth={2.5} fill="url(#paidFill)"/></AreaChart></ResponsiveContainer></div>:<Empty text="Ainda não há pagamentos para montar o gráfico."/>}
        </div>
        <div className="panel breakdown"><div className="panel-heading"><div><h2>Por cartão / conta</h2><p>Valor total associado a cada fonte</p></div></div>
          {paymentGroups.length?paymentGroups.map(([name,value])=><div className="bar-row" key={name}><div><span>{name}</span><b>{money(value)}</b></div><div className="bar-track"><span style={{width:(value/Math.max(...paymentGroups.map(x=>x[1]))*100)+"%"}}/></div></div>):<Empty text="Cadastre uma despesa para visualizar a distribuição."/>}
        </div>
      </section><section className="panel recent-panel"><div className="panel-heading"><div><h2>Despesas recentes</h2><p>Últimos lançamentos registrados</p></div><button className="text-button" onClick={()=>setActive("Despesas")}>Ver todas <ArrowUpRight size={14}/></button></div><ExpenseTable items={expenses.slice(0,6)} onDelete={deleteExpense}/></section></>}

      {active==="Despesas"&&<section className="panel content-panel"><div className="panel-heading"><div><h2>Despesas cadastradas</h2><p>{filteredExpenses.length} lançamento(s)</p></div><div className="search-box"><Search size={15}/><input placeholder="Buscar descrição, fornecedor..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><ExpenseTable items={filteredExpenses} onDelete={deleteExpense}/></section>}

      {active==="Parcelas"&&<section className="panel content-panel"><div className="panel-heading"><div><h2>Parcelas e compromissos</h2><p>{filteredInstallments.length} parcela(s) no período selecionado</p></div><div className="search-box"><Search size={15}/><input placeholder="Buscar despesa..." value={search} onChange={e=>setSearch(e.target.value)}/></div></div><div className="table-wrap"><table><thead><tr><th>DESPESA</th><th>PARCELA</th><th>VENCIMENTO</th><th>VALOR</th><th>STATUS</th><th>AÇÃO</th></tr></thead><tbody>{filteredInstallments.sort((a,b)=>a.due_date.localeCompare(b.due_date)).map(i=><tr key={i.id}><td><b>{i.expense.description}</b><small>{i.expense.supplier||i.expense.category}</small></td><td>{i.installment_number}/{i.expense.installments_count}</td><td>{dateBR(i.due_date)}</td><td><b>{money(Number(i.amount))}</b></td><td><span className={"status "+(i.status==="PAID"?"paid":"pending")}>{i.status==="PAID"?"Paga":"Pendente"}</span></td><td><button className={"small-button "+(i.status==="PAID"?"secondary":"mark-paid")} onClick={()=>void toggleInstallment(i)}>{i.status==="PAID"?"Desfazer":"Marcar paga"}</button></td></tr>)}</tbody></table>{!filteredInstallments.length&&<Empty text="Nenhuma parcela encontrada para os filtros selecionados."/>}</div></section>}

      {active==="Cartões e contas"&&<section className="panel content-panel"><div className="panel-heading"><div><h2>Cartões e contas</h2><p>Cadastre apenas apelidos; não armazenamos números ou dados bancários.</p></div><button className="primary-button" onClick={()=>setShowSource(true)}><Plus size={16}/> Nova fonte</button></div><div className="source-grid">{sources.map(s=><div className="source-card" key={s.id}><span className="source-icon"><CreditCard size={19}/></span><div><b>{s.name}</b><small>{s.kind==="CREDIT_CARD"?"Cartão de crédito":s.kind==="BANK_ACCOUNT"?"Conta bancária":s.kind==="CASH"?"Dinheiro":"Outro"}</small></div><strong>{money(expenses.filter(e=>e.payment_source_id===s.id).reduce((sum,e)=>sum+Number(e.total_amount),0))}</strong></div>)}{!sources.length&&<Empty text="Nenhum cartão ou conta cadastrado. Adicione um apelido para associar às despesas."/>}</div></section>}

      {active==="Categorias"&&<section className="panel content-panel"><div className="panel-heading"><div><h2>Gastos por categoria</h2><p>Distribuição do custo total cadastrado</p></div></div><div className="category-list">{categoriesSummary.map(([name,value])=><div className="category-row" key={name}><div><b>{name}</b><span>{money(value)}</span></div><div className="bar-track"><span style={{width:(value/Math.max(...categoriesSummary.map(x=>x[1]))*100)+"%"}}/></div></div>)}{!categoriesSummary.length&&<Empty text="As categorias aparecerão aqui conforme as despesas forem cadastradas."/>}</div></section>}

      <footer className="footer-note"><CircleHelp size={14}/> Todos os valores são carregados diretamente do banco de dados da sua conta.</footer>
      {loading&&<div className="loading-line"><LoaderCircle size={16} className="spin"/> Atualizando dados...</div>}
    </main>

    {showExpense&&<Modal title="Nova despesa" subtitle="Informe os dados da compra ou serviço." onClose={()=>setShowExpense(false)}><form className="data-form" onSubmit={addExpense}>
      <label>Descrição<input required maxLength={200} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Ex.: Material hidráulico"/></label>
      <div className="form-grid"><label>Categoria<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Fornecedor<input value={supplier} onChange={e=>setSupplier(e.target.value)} placeholder="Nome do fornecedor"/></label></div>
      <div className="form-grid"><label>Valor total (R$)<input required inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00"/></label><label>Data da compra<input required type="date" value={purchaseDate} onChange={e=>setPurchaseDate(e.target.value)}/></label></div>
      <label>Forma de pagamento<select value={method} onChange={e=>{setMethod(e.target.value);if(e.target.value!=="CREDIT_INSTALLMENTS")setCount("1");}}>{methods.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label>
      <label>Cartão / conta (opcional)<select value={sourceId} onChange={e=>setSourceId(e.target.value)}><option value="">Não informar</option>{sources.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      {method==="CREDIT_INSTALLMENTS"&&<div className="form-grid"><label>Número de parcelas<input type="number" min="2" max="120" required value={count} onChange={e=>setCount(e.target.value)}/></label><label>Vencimento da 1ª parcela<input type="date" required value={firstDue} onChange={e=>setFirstDue(e.target.value)}/></label></div>}
      {method!=="CREDIT_INSTALLMENTS"&&<label>Data do pagamento / vencimento<input type="date" required value={firstDue} onChange={e=>setFirstDue(e.target.value)}/></label>}
      <label>Observações (opcional)<textarea rows={2} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Detalhes adicionais"/></label>
      <div className="form-hint">O valor total será registrado uma única vez. As parcelas serão criadas automaticamente e poderão ser pagas individualmente.</div>
      <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowExpense(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving&&<LoaderCircle size={15} className="spin"/>}Salvar despesa</button></div>
    </form></Modal>}

    {showSource&&<Modal title="Novo cartão ou conta" subtitle="Use um apelido. Não informe números de cartão ou conta." onClose={()=>setShowSource(false)}><form className="data-form" onSubmit={addSource}><label>Nome / apelido<input required maxLength={80} value={sourceName} onChange={e=>setSourceName(e.target.value)} placeholder="Ex.: Nubank, Itaú, Dinheiro"/></label><label>Tipo<select value={sourceKind} onChange={e=>setSourceKind(e.target.value as Source["kind"])}><option value="CREDIT_CARD">Cartão de crédito</option><option value="BANK_ACCOUNT">Conta bancária</option><option value="CASH">Dinheiro</option><option value="OTHER">Outro</option></select></label><div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setShowSource(false)}>Cancelar</button><button className="primary-button" disabled={saving}>{saving?"Salvando...":"Salvar fonte"}</button></div></form></Modal>}
  </div>;
}

function Metric({label,value,note,icon,tone=""}:{label:string;value:string;note:string;icon:React.ReactNode;tone?:string}){
  return <div className="panel metric"><div className="metric-top"><span>{label}</span><i className={tone}>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>;
}
function Empty({text}:{text:string}){return <div className="empty-state"><Wallet size={22}/><p>{text}</p></div>;}
function ExpenseTable({items,onDelete}:{items:Expense[];onDelete:(id:string)=>void}){
  return <div className="table-wrap"><table><thead><tr><th>DESCRIÇÃO</th><th>CATEGORIA / FORNECEDOR</th><th>DATA</th><th>PAGAMENTO</th><th>VALOR TOTAL</th><th>STATUS</th><th></th></tr></thead><tbody>{items.map(e=>{
    const paid=e.expense_installments.filter(i=>i.status==="PAID").reduce((s,i)=>s+Number(i.amount),0);
    const total=Number(e.total_amount);const status=paid>=total?"Pago":paid>0?"Parcial":"Pendente";
    return <tr key={e.id}><td><b>{e.description}</b></td><td>{e.category}<small>{e.supplier||"—"}</small></td><td>{dateBR(e.purchase_date)}</td><td>{e.payment_sources?.name??methodLabel(e.payment_method)}</td><td><b>{money(total)}</b></td><td><span className={"status "+(status==="Pago"?"paid":status==="Parcial"?"partial":"pending")}>{status}</span></td><td><button className="icon-danger" title="Excluir despesa" onClick={()=>onDelete(e.id)}><Trash2 size={15}/></button></td></tr>;
  })}</tbody></table>{!items.length&&<Empty text="Nenhuma despesa cadastrada. Clique em “Nova despesa” para começar."/>}</div>;
}
function Modal({title,subtitle,onClose,children}:{title:string;subtitle:string;onClose:()=>void;children:React.ReactNode}){
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><section className="modal-card"><header><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose}><X size={17}/></button></header>{children}</section></div>;
}
