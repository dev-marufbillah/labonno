/**
 * Small guard rails around MONGODB_URI.
 *
 * The most common Atlas copy/paste accident: pasting the three-shard connection string
 * (`...shard-00-00...,...shard-00-01...`) while keeping the `mongodb+srv://` scheme.
 * The driver refuses it instantly with "mongodb+srv URI cannot have multiple service
 * names" — before any network call — and the site looks broken.
 */
export function mongoUriProblem(uri?: string | null): string | null {
  if (!uri) return "MONGODB_URI is empty.";
  if (!/^mongodb(\+srv)?:\/\//.test(uri)) return "MONGODB_URI must start with mongodb:// or mongodb+srv://";

  if (uri.startsWith("mongodb+srv://")) {
    const hostPart = uri.slice("mongodb+srv://".length).split("/")[0].split("?")[0];
    const hosts = hostPart.includes("@") ? hostPart.split("@")[1] : hostPart;
    if (hosts.includes(",")) {
      return (
        "mongodb+srv:// cannot take several hosts. Either change the scheme to mongodb:// " +
        "(keeps all three Atlas shard hosts) or use the single SRV hostname " +
        "(cluster0.xxxxx.mongodb.net) with mongodb+srv://."
      );
    }
  }
  return null;
}

/** Returns the same URI with a scheme that matches its host list. */
export function suggestMongoUriFix(uri: string): string | null {
  if (!uri.startsWith("mongodb+srv://")) return null;
  const hostPart = uri.slice("mongodb+srv://".length).split("/")[0].split("?")[0];
  const hosts = hostPart.includes("@") ? hostPart.split("@")[1] : hostPart;
  if (!hosts.includes(",")) return null;
  return uri.replace("mongodb+srv://", "mongodb://");
}
