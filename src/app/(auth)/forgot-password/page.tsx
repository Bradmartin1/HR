"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ email }: FormData) => {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
    });
    setSent(true);
  };

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6 text-center space-y-2">
          <p className="font-medium">Check your email</p>
          <p className="text-sm text-muted-foreground">We sent a password reset link to your email address.</p>
        </CardContent>
        <CardFooter>
          <Link href="/login" className="w-full">
            <Button variant="outline" className="w-full">Back to Sign In</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">Reset Password</h2>
        <p className="text-sm text-muted-foreground">Enter your email to receive a reset link.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 pt-0">
            <Button type="submit" className="w-full" disabled={isSubmitting}>Send Reset Link</Button>
            <Link href="/login" className="text-sm text-muted-foreground hover:text-primary text-center">Back to Sign In</Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
