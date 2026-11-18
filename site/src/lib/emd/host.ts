/**
 * Host checks for the seven domains. Safe for the proxy: no filesystem, no Next imports.
 */
import { emdByDomain, type EmdPage } from "./pages";

export function requestHost(value: string | null | undefined): string {
  return (value ?? "").split(",")[0].trim().split(":")[0].toLowerCase().replace(/\.$/, "");
}

export function isBrandHost(host: string): boolean {
  return host === "conthunt.app" || host === "www.conthunt.app";
}

/** The page for this host, whether or not it starts with www. */
export function emdForHost(host: string): EmdPage | undefined {
  const bare = host.startsWith("www.") ? host.slice(4) : host;
  return emdByDomain(bare);
}
