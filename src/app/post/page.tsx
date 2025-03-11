import { HydrateClient, api } from "@/trpc/server";
import { LatestPost } from "./_components/post";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Post Manager</h1>

          <div className="w-full max-w-md">
            <p className="text-center text-muted-foreground mb-8">
              {hello ? hello.greeting : "Loading..."}
            </p>

            <LatestPost />
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
