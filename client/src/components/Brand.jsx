import { Focus } from "lucide-react";

export default function Brand({ inverse = false }) {
  return <div className={`brand ${inverse ? "brand-inverse" : ""}`}><Focus aria-hidden="true" /><span>HireLens</span></div>;
}
