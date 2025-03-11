"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { useState } from "react";

export function LatestPost() {
  const [latestPost] = api.post.getLatest.useSuspenseQuery();

  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      setName("");
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        {latestPost ? (
          <p className="text-sm text-muted-foreground mb-4">
            Your most recent post: <span className="font-medium">{latestPost.name}</span>
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-4">You have no posts yet.</p>
        )}
        <form
          onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            createPost.mutate({ name });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            type="text"
            placeholder="Post title"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          />
          <Button type="submit" disabled={createPost.isPending} className="w-full">
            {createPost.isPending ? "Submitting..." : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
