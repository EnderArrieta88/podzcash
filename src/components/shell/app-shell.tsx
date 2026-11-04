import { getCurrentUser } from "@/lib/auth/session";
import { storage } from "@/lib/storage";
import { SideRail, type RailUser } from "@/components/shell/side-rail";
import { TopBar } from "@/components/shell/top-bar";

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

  return (
    <div className="min-h-dvh bg-bg">
      <SideRail user={railUser} />

      <div className="lg:pl-64">
        <TopBar user={railUser} />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
