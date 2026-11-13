"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Wrench, LoaderCircle } from "lucide-react";

export default function LoginForm() {
  const params = useSearchParams();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(params.get("error") ? "Não foi possível confirmar o acesso. Tente novamente." : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setError(""); setMessage("");
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
      : await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: redirectTo } });
    setBusy(false);
    if (result.error) { setError(result.error.message); return; }
    if (mode === "signup" && !result.data.session) {
      setMessage("Cadastro recebido. Confira seu e-mail para confirmar a conta e depois entre no sistema.");
      return;
    }
    window.location.assign(params.get("next") || "/");
  }

  return <main className="auth-shell">
    <section className="auth-card">
      <div className="auth-brand"><span><Wrench size={22}/></span><div><strong>obra<span>emdia</span></strong><small>CONTROLE DA REFORMA</small></div></div>
      <p className="eyebrow">SEU CONTROLE FINANCEIRO</p>
      <h1>{mode === "signin" ? "Bem-vindo de volta" : "Crie sua conta"}</h1>
      <p className="auth-copy">Organize despesas, pagamentos e parcelas da sua reforma em um só lugar.</p>
      <form onSubmit={submit} className="auth-form">
        <label htmlFor="email">E-mail</label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com"/>
        <label htmlFor="password">Senha</label>
        <input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mínimo de 6 caracteres"/>
        {error && <div className="notice error">{error}</div>}
        {message && <div className="notice success">{message}</div>}
        <button className="primary-button full" disabled={busy}>{busy && <LoaderCircle size={16} className="spin"/>}{busy ? "Aguarde..." : mode === "signin" ? "Entrar" : "Criar conta"}</button>
      </form>
      <p className="auth-switch">{mode === "signin" ? "Ainda não tem conta?" : "Já tem uma conta?"} <button onClick={()=>{setMode(mode==="signin"?"signup":"signin");setError("");setMessage("");}}>{mode === "signin" ? "Criar conta" : "Entrar"}</button></p>
      <p className="auth-foot">Seus dados financeiros são privados e protegidos por usuário.</p>
    </section>
  </main>;
}
