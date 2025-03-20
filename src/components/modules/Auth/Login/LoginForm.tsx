/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useRouter, useSearchParams } from "next/navigation";

import { Loader2 } from "lucide-react";
import { loginSchema } from "./loginValidation";
import { useUser } from "@/context/UserContext";
import { loginUser } from "@/services/AuthService";



export default function LoginForm() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
  });

  const {
    formState: { isSubmitting },
  } = form;

  const { setIsLoading } = useUser();

  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirectPath");
  const router = useRouter();



  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);

    try {
      const res = await loginUser(data);
      if (res?.success) {
        toast.success(res?.message);
        if (redirect) {
          router.push(redirect);
          setIsLoading(false);
        } else {
          router.push("/");
          setIsLoading(false);
        }
      } else {
        toast.error(res?.message);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen  flex justify-center items-center">
    

      {/* Login Form */}
      <div className="w-full max-w-md mx-8 md:mx-12 lg:mx-16 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Login</h1>
          <p className="text-sm text-gray-600">Welcome Back!</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-md">Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="my-4">
                  <FormLabel className="text-md ">Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <Button
          
              type="submit"
              className="mt-5 w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-md"
            >
              {isSubmitting ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Login"}
            </Button>
          </form>
        </Form>

      
      </div>
    </div>
  );
}
