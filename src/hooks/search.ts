import { ExternalAsset } from "@/types/multipoolAsset";

function useTokenSearch(tokens: ExternalAsset[] | undefined, search: string): ExternalAsset[] {
  if (!tokens) return [];
  if (!search) return tokens;

  return tokens.filter((token) => {
    const tokenName = token.symbol.toLowerCase();
    const searchName = search.toLowerCase();
    return tokenName.includes(searchName);
  });
}

export { useTokenSearch }
