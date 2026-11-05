import { getCurrentUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import type { RailUser } from "@/components/shell/side-rail";
import { ShellFrame } from "@/components/shell/shell-frame";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  const railUser: RailUser = user
    ? {
        name: user.name,
        role: user.role,
        channel: user.channel
          ? {
              handle: user.channel.handle,
              displayName: user.channel.displayName,
              avatarUrl: user.channel.avatarKey
                ? storage.url(user.channel.avatarKey)
                : null,
            }
          : null,
      }
    : null;

  return <ShellFrame user={railUser}>{children}</ShellFrame>;
}
