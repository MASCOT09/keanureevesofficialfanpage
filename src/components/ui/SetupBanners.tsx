import fs from "fs";
import path from "path";
import { SetupPendingBanner } from "@/components/ui/SetupPendingBanner";
import { isDatabaseReady } from "@/lib/repository";

function isNodeDependenciesInstalled(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "node_modules"));
  } catch {
    return false;
  }
}

export function SetupBanners() {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const nodeReady = isNodeDependenciesInstalled();
  const dbReady = isDatabaseReady();

  return (
    <>
      {!nodeReady && <SetupPendingBanner />}
      {nodeReady && !dbReady && (
        <div className="border-b border-amber-500/20 bg-amber-500/10 px-6 py-2.5 text-center text-xs text-amber-300">
          Local database missing — run{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">npm run seed</code> for Excel, or add{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">SUPABASE_*</code> keys to{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5">.env.local</code>.
        </div>
      )}
    </>
  );
}
