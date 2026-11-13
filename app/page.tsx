"use client";

import { useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, CircleHelp, CreditCard, FileText, Hammer, LayoutDashboard, Plus, Search, Settings2, Wallet, Wrench, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Expense = { id: number; title: string; category: string; supplier: string; date: string; amount: number; paid: number; method: string; status: "Pago" | "Pendente" | "Parcial"; };
const initialExpenses: Expense[] = [
  { id: 1, title: "Porcelanato sala e cozinha", category: "Acabamento", supplier: "Casa dos Pisos", date: "12/11/2026", amount: 4280, paid: 2140, method: "Nubank • Crédito 2x", status: "Parcial" },
  { id: 2, title: "Mão de obra elétrica", category: "Mão de obra", supplier: "Marcos Eletricista", date: "10/11/2026", amount: 1850, paid: 1850, method: "PIX", status: "Pago" },
  { id: 3, title: "Tinta acrílica premium", category: "Pintura", supplier: "Depósito Central", date: "08/11/2026", amount: 960, paid: 0, method: "Itaú • Débito", status: "Pendente" },
  { id: 4, title: "Projeto dos armários", category: "Marcenaria", supplier: "Studio Madeira", date: "05/11/2026", amount: 3200, paid: 1000, method: "Depósito", status: "Parcial" },
  { id: 5, title: "Metais para banheiro", category: "Acabamento", supplier: "Hidro & Cia", date: "02/11/2026", amount: 740, paid: 740, method: "PIX", status: "Pago" },
];
const monthly = [{ month: "Jun", total: 3200 }, { month: "Jul", total: 4800 }, { month: "Ago", total: 3900 }, { month: "Set", total: 6200 }, { month: "Out", total: 5100 }, { month: "Nov", total: 11030 }];
const money = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const nav = [{ label: "Visão geral", icon: LayoutDashboard }, { label: "Despesas", icon: FileText }, { label: "Parcelas", icon: CalendarDays }, { label: "Cartões e contas", icon: CreditCard }, { label: "Categorias", icon: Hammer }];

export default function Home() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [active, setActive] = useState("Visão geral");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("PIX");
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const paid = expenses.reduce((s, e) => s + e.paid, 0);
  const pending = total - paid;
  const filtered = useMemo(() => expenses.filter(e => (e.title + e.supplier + e.category).toLowerCase().includes(search.toLowerCase())), [expenses, search]);
  function addExpense(e: React.FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!title.trim() || !value || value <= 0) return;
    setExpenses([{ id: Date.now(), title, category: "Outros", supplier: "—", date: new Date().toLocaleDateString("pt-BR"), amount: value, paid: 0, method, status: "Pendente" }, ...expenses]);
    setTitle(""); setAmount(""); setShowForm(false);
  }
  return <div>
    <aside className="sidebar">
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:42,padding:"0 8px"}}>
        <div style={{width:35,height:35,borderRadius:11,background:"#237b59",display:"grid",placeItems:"center",color:"white"}}><Wrench size={19}/></div>
        <div className="brand-name"><div style={{fontWeight:750,fontSize:16,letterSpacing:"-.4px"}}>obra<span style={{color:"#237b59"}}>emdia</span></div><div style={{fontSize:10,color:"#94a099",marginTop:2}}>CONTROLE DA REFORMA</div></div>
      </div>
      <div className="nav-label" style={{fontSize:10,color:"#a0aaa4",fontWeight:700,letterSpacing:1.1,padding:"0 12px",marginBottom:10}}>MENU PRINCIPAL</div>
      {nav.map(item => { const Icon = item.icon; return <button key={item.label} className={"nav-item "+(active===item.label?"active":"")} onClick={()=>setActive(item.label)}><Icon size={18}/><span>{item.label}</span></button>; })}
      <div style={{position:"absolute",bottom:22,left:18,right:18}}>
        <button className="nav-item"><Settings2 size={18}/><span>Configurações</span></button>
        <div style={{borderTop:"1px solid #edf0ee",margin:"16px 4px",paddingTop:17,display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:50,background:"#e6eee9",display:"grid",placeItems:"center",color:"#367657",fontWeight:700,fontSize:12}}>KR</div>
          <div className="brand-name"><div style={{fontSize:12,fontWeight:650}}>Minha reforma</div><div style={{fontSize:10,color:"#8c9891"}}>Projeto pessoal</div></div>
        </div>
      </div>
    </aside>
    <main className="main">
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,marginBottom:30,flexWrap:"wrap"}}>
        <div><div style={{fontSize:13,color:"#89958e",marginBottom:7}}>Quinta-feira, 13 de novembro de 2026</div><h1 style={{fontSize:27,letterSpacing:"-1px",margin:0,fontWeight:750}}>{active === "Visão geral" ? "Visão geral" : active}</h1><p style={{color:"#87928c",fontSize:13,margin:"7px 0 0"}}>Acompanhe de perto cada etapa do seu investimento.</p></div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}><button aria-label="Notificações" className="panel" style={{width:41,height:41,display:"grid",placeItems:"center",color:"#69766e"}}><Bell size={17}/></button><button onClick={()=>setShowForm(true)} style={{border:0,borderRadius:10,background:"#237b59",color:"white",padding:"12px 16px",fontSize:13,fontWeight:650,display:"flex",alignItems:"center",gap:8}}><Plus size={17}/> Nova despesa</button></div>
      </header>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:10}}><div style={{fontSize:13,fontWeight:650}}>Resumo financeiro</div><button style={{border:"1px solid #e4eae6",background:"white",borderRadius:9,padding:"8px 11px",fontSize:12,color:"#647169",display:"flex",alignItems:"center",gap:8}}>Novembro 2026 <ChevronDown size={14}/></button></div>
      <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14}}>
        <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Custo total da obra</span><Hammer size={17} color="#39815f"/></div><div className="metric-value">{money(total)}</div><div className="metric-note">Compras e serviços cadastrados</div></div>
        <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Total já pago</span><span style={{color:"#299366",background:"#eaf5ef",borderRadius:8,padding:6}}><ArrowDownLeft size={16}/></span></div><div className="metric-value">{money(paid)}</div><div className="metric-note">Valor efetivamente desembolsado</div></div>
        <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Em aberto</span><span style={{color:"#bd8735",background:"#fbf3e6",borderRadius:8,padding:6}}><CalendarDays size={16}/></span></div><div className="metric-value">{money(pending)}</div><div className="metric-note">Parcelas e pagamentos pendentes</div></div>
        <div className="panel metric"><div style={{display:"flex",justifyContent:"space-between"}}><span className="metric-label">Desembolso no mês</span><span style={{color:"#6581a5",background:"#edf2f8",borderRadius:8,padding:6}}><Wallet size={16}/></span></div><div className="metric-value">{money(2890)}</div><div className="metric-note"><span style={{color:"#299366"}}>↗ 8,4%</span> em relação ao mês anterior</div></div>
      </section>
      <section style={{display:"grid",gridTemplateColumns:"minmax(0,1.7fr) minmax(250px,1fr)",gap:15,marginTop:17}}>
        <div className="panel" style={{padding:"21px 20px 12px"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:10}}><div><div style={{fontSize:14,fontWeight:700}}>Evolução dos gastos</div><div style={{fontSize:12,color:"#89958e",marginTop:5}}>Compras e serviços por mês</div></div><span className="pill" style={{background:"#eef5f0",color:"#377657"}}>Últimos 6 meses</span></div>
          <div style={{height:220,marginTop:18}}><ResponsiveContainer width="100%" height="100%"><AreaChart data={monthly}><defs><linearGradient id="fillSpend" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#4b9b72" stopOpacity={0.22}/><stop offset="95%" stopColor="#4b9b72" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf1ee" vertical={false}/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:"#96a099",fontSize:11}}/><YAxis axisLine={false} tickLine={false} tick={{fill:"#96a099",fontSize:10}} tickFormatter={v=>v/1000+"k"} width={35}/><Tooltip formatter={(v)=>money(Number(v))} contentStyle={{border:"1px solid #e7ede9",borderRadius:10,fontSize:12}}/><Area type="monotone" dataKey="total" stroke="#39845e" strokeWidth={2.5} fill="url(#fillSpend)"/></AreaChart></ResponsiveContainer></div>
        </div>
        <div className="panel" style={{padding:21}}><div style={{fontSize:14,fontWeight:700}}>Distribuição por pagamento</div><div style={{fontSize:12,color:"#89958e",marginTop:5}}>Onde está concentrado o custo</div>
          {[["Cartão de crédito",4280,"#39845e"],["PIX",2590,"#83b79a"],["Depósito",3200,"#c5a46c"],["Débito",960,"#9aa9b7"]].map(([name,val,color])=><div key={String(name)} style={{marginTop:20}}><div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:8}}><span style={{color:"#68766e"}}>{name}</span><b>{money(Number(val))}</b></div><div style={{height:7,background:"#f0f3f1",borderRadius:8,overflow:"hidden"}}><div style={{height:"100%",width:(Number(val)/11030*100)+"%",background:String(color),borderRadius:8}}/></div></div>)}
        </div>
      </section>
      <section className="panel" style={{marginTop:17,padding:21}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",marginBottom:18}}><div><div style={{fontSize:14,fontWeight:700}}>Despesas recentes</div><div style={{fontSize:12,color:"#89958e",marginTop:5}}>Últimos lançamentos da sua reforma</div></div><div style={{position:"relative"}}><Search size={15} style={{position:"absolute",left:10,top:10,color:"#98a39c"}}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar despesa..." style={{border:"1px solid #e7ede9",borderRadius:9,padding:"8px 10px 8px 32px",fontSize:12,width:205,outline:"none"}}/></div></div>
        <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left",minWidth:650}}><thead><tr style={{color:"#96a099",fontSize:10,letterSpacing:.6}}>{["DESCRIÇÃO","CATEGORIA / FORNECEDOR","DATA","PAGAMENTO","VALOR","STATUS"].map(x=><th key={x} style={{padding:"0 10px 12px",fontWeight:650}}>{x}</th>)}</tr></thead><tbody>{filtered.map(item=><tr key={item.id} style={{borderTop:"1px solid #f0f3f1",fontSize:12}}><td style={{padding:"14px 10px",fontWeight:650}}>{item.title}</td><td style={{padding:"14px 10px"}}><div>{item.category}</div><div style={{color:"#9aa49e",fontSize:11,marginTop:4}}>{item.supplier}</div></td><td style={{padding:"14px 10px",color:"#77847c"}}>{item.date}</td><td style={{padding:"14px 10px",color:"#77847c"}}>{item.method}</td><td style={{padding:"14px 10px",fontWeight:650}}>{money(item.amount)}</td><td style={{padding:"14px 10px"}}><span className="pill" style={{background:item.status==="Pago"?"#eaf5ef":item.status==="Parcial"?"#fbf3e6":"#f0f2f1",color:item.status==="Pago"?"#287a52":item.status==="Parcial"?"#a4772f":"#69766e"}}>{item.status}</span></td></tr>)}</tbody></table>{filtered.length===0&&<div style={{padding:24,textAlign:"center",color:"#87928c",fontSize:13}}>Nenhuma despesa encontrada.</div>}</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #f0f3f1",paddingTop:14,marginTop:8,fontSize:11,color:"#929d96"}}><span>Exibindo {filtered.length} de {expenses.length} lançamentos</span><span style={{display:"flex",alignItems:"center",gap:5}}>Ver todas <ArrowUpRight size={13}/></span></div>
      </section>
      <div style={{display:"flex",gap:8,alignItems:"center",fontSize:11,color:"#a0aaa4",marginTop:18}}><CircleHelp size={14}/> Valores demonstrativos para visualizar o painel. Os dados ainda não são salvos em banco.</div>
    </main>
    {showForm&&<div style={{position:"fixed",inset:0,background:"rgba(16,30,23,.35)",display:"grid",placeItems:"center",padding:16,zIndex:10}}><form onSubmit={addExpense} className="panel" style={{width:"min(100%,430px)",padding:24,boxShadow:"0 20px 60px #10251b22"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><div><h2 style={{fontSize:18,margin:0}}>Nova despesa</h2><p style={{fontSize:12,color:"#89958e",margin:"5px 0 0"}}>Adicione um custo da sua reforma</p></div><button type="button" onClick={()=>setShowForm(false)} style={{border:0,background:"#f2f5f3",borderRadius:8,width:32,height:32,display:"grid",placeItems:"center"}}><X size={16}/></button></div><label style={{display:"block",fontSize:12,fontWeight:650,marginBottom:7}}>Descrição</label><input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ex.: Material hidráulico" style={{width:"100%",border:"1px solid #e2e9e4",borderRadius:9,padding:11,marginBottom:15,fontSize:13}}/><label style={{display:"block",fontSize:12,fontWeight:650,marginBottom:7}}>Valor total (R$)</label><input required value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0,00" inputMode="decimal" style={{width:"100%",border:"1px solid #e2e9e4",borderRadius:9,padding:11,marginBottom:15,fontSize:13}}/><label style={{display:"block",fontSize:12,fontWeight:650,marginBottom:7}}>Forma de pagamento</label><select value={method} onChange={e=>setMethod(e.target.value)} style={{width:"100%",border:"1px solid #e2e9e4",borderRadius:9,padding:11,marginBottom:22,fontSize:13,background:"white"}}>{["PIX","Débito","Crédito à vista","Crédito parcelado","Dinheiro","Depósito / pagamento futuro"].map(x=><option key={x}>{x}</option>)}</select><div style={{display:"flex",justifyContent:"flex-end",gap:9}}><button type="button" onClick={()=>setShowForm(false)} style={{border:"1px solid #e2e9e4",background:"white",borderRadius:9,padding:"10px 14px",fontSize:12}}>Cancelar</button><button type="submit" style={{border:0,background:"#237b59",color:"white",borderRadius:9,padding:"10px 16px",fontSize:12,fontWeight:650}}>Adicionar despesa</button></div></form></div>}
  </div>;
}
