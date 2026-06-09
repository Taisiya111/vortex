"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  return (
    <form className="flex w-full sm:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
      <Input type="email" placeholder="you@example.com" className="sm:w-64" />
      <Button type="submit" variant="gradient">Subscribe</Button>
    </form>
  );
}
