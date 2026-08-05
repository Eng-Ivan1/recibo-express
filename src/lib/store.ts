import { useCallback, useEffect, useState } from "react";

export type DocType = "recibo" | "orcamento";
export type DocStatus = "pago" | "pendente";

export interface DocItem {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
}

export interface Documento {
  id: string;
  numero: number;
  tipo: DocType;
  status: DocStatus;
  cliente: string;
  clienteContacto: string;
  observacoes: string;
  itens: DocItem[];
  total: number;
  criadoEm: string;
}

export interface CatalogoItem {
  id: string;
  nome: string;
  preco: number;
}

export interface Perfil {
  empresa: string;
  contacto: string;
  mpesa: string;
  emola: string;
  banco: string;
  conta: string;
  nuit: string;
  pix: string;
  cpfCnpj: string;
  branchCode: string;
  taxId: string;
  iban: string;
  swift: string;
  linkPagamento: string;
}

export type Lang = "pt" | "en";
export type Pais = "MZ" | "BR" | "ZA";

export interface Config {
  lang: Lang;
  currency: string;
  pais: Pais;
}

export const PERFIL_VAZIO: Perfil = {
  empresa: "",
  contacto: "",
  mpesa: "",
  emola: "",
  banco: "",
  conta: "",
  nuit: "",
  pix: "",
  cpfCnpj: "",
  branchCode: "",
  taxId: "",
  iban: "",
  swift: "",
  linkPagamento: "",
};

export const PAIS_REGRAS: Record<Pais, { lang: Lang; currency: string }> = {
  MZ: { lang: "pt", currency: "MZN" },
  BR: { lang: "pt", currency: "BRL" },
  ZA: { lang: "en", currency: "ZAR" },
};

/** Deteta o país a partir do locale do dispositivo (fallback: Moçambique). */
export function detetarPais(): Pais {
  if (typeof navigator === "undefined") return "MZ";
  const loc = (navigator.language || "").toUpperCase();
  if (loc.includes("BR")) return "BR";
  if (loc.includes("ZA")) return "ZA";
  return "MZ";
}

export const CONFIG_INICIAL: Config = { lang: "pt", currency: "MZN", pais: "MZ" };

export const MOEDAS = ["MZN", "BRL", "ZAR", "EUR", "USD", "GBP"] as const;

const DOCS_KEY = "reciboja:documentos";
const CAT_KEY = "reciboja:catalogo";
const PERFIL_KEY = "reciboja:perfil";
const CONFIG_KEY = "reciboja:config";
const RASCUNHO_KEY = "reciboja:rascunho";



export const uid = () => Math.random().toString(36).slice(2, 10);

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("reciboja:update", { detail: key }));
}

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    setValue(read(key, fallback));
    setCarregado(true);
    const onUpdate = (e: Event) => {
      if ((e as CustomEvent).detail === key) setValue(read(key, fallback));
    };
    window.addEventListener("reciboja:update", onUpdate);
    return () => window.removeEventListener("reciboja:update", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const save = useCallback(
    (next: T) => {
      setValue(next);
      write(key, next);
    },
    [key],
  );

  return { value, save, carregado };
}

export function useDocumentos() {
  const { value, save, carregado } = useStored<Documento[]>(DOCS_KEY, []);

  const adicionar = (doc: Omit<Documento, "id" | "numero" | "criadoEm">) => {
    const numero = value.reduce((m, d) => Math.max(m, d.numero), 0) + 1;
    const novo: Documento = { ...doc, id: uid(), numero, criadoEm: new Date().toISOString() };
    save([novo, ...value]);
    return novo;
  };

  const alternarStatus = (id: string) =>
    save(
      value.map((d) =>
        d.id === id ? { ...d, status: d.status === "pago" ? "pendente" : "pago" } : d,
      ),
    );

  const remover = (id: string) => save(value.filter((d) => d.id !== id));

  return { documentos: value, adicionar, alternarStatus, remover, carregado };
}

export function useCatalogo() {
  const { value, save, carregado } = useStored<CatalogoItem[]>(CAT_KEY, []);
  return {
    catalogo: value,
    adicionar: (nome: string, preco: number) => save([...value, { id: uid(), nome, preco }]),
    atualizar: (item: CatalogoItem) => save(value.map((i) => (i.id === item.id ? item : i))),
    remover: (id: string) => save(value.filter((i) => i.id !== id)),
    carregado,
  };
}

export function usePerfil() {
  const { value, save, carregado } = useStored<Perfil>(PERFIL_KEY, PERFIL_VAZIO);
  return { perfil: { ...PERFIL_VAZIO, ...value }, guardarPerfil: save, carregado };
}

export function useConfig() {
  const { value, save, carregado } = useStored<Config>(CONFIG_KEY, CONFIG_INICIAL);
  return { config: { ...CONFIG_INICIAL, ...value }, guardarConfig: save, carregado };
}

export const moeda = (v: number, currency = "MZN", lang: Lang = "pt") => {
  try {
    return new Intl.NumberFormat(lang === "en" ? "en-US" : "pt-PT", {
      style: "currency",
      currency,
    }).format(v || 0);
  } catch {
    return `${currency} ${(v || 0).toFixed(2)}`;
  }
};

export const dataCurta = (iso: string, lang: Lang = "pt") =>
  new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

