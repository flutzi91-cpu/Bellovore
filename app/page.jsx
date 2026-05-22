import { readFileSync } from "node:fs";
import path from "node:path";

const bodyHtml = readFileSync(path.join(process.cwd(), "public", "index-body.html"), "utf8");

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />;
}
