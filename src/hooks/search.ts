import { ExternalAsset, MultipoolAsset } from "@/types/multipoolAsset";

function useTokenSearch(tokens: (ExternalAsset | MultipoolAsset)[] | undefined, search: string): (ExternalAsset | MultipoolAsset)[] {
  if (!tokens) return [];
  if (!search) return tokens;

  return tokens.filter((token) => {
    const tokenName = token.symbol.toLowerCase();
    const searchName = search.toLowerCase();
    return tokenName.includes(searchName);
  });
}

export { useTokenSearch }
