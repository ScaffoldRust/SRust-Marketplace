"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Loader2 } from "lucide-react";
import FileUpload from "../ui/FileUpload";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "../../ui/button";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
];

const formSchema = z.object({
  storeName: z
    .string()
    .min(3, { message: "Store name must be at least 3 characters" }),
  storeDescription: z
    .string()
    .min(20, { message: "Description must be at least 20 characters" }),
  logo: z
    .instanceof(File)
    .refine(
      (file) => file.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .gif formats are supported"
    )
    .optional(),
  walletAddress: z
    .string()
    .min(1, { message: "Wallet address is required" })
    .regex(/^G[A-Z0-9]{55}$/, {
      message: "Please enter a valid Stellar wallet address",
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateStoreFormProps {
  onSuccess: () => void;
}

export default function CreateStoreForm({ onSuccess }: CreateStoreFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { createStore } = useAuth();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      walletAddress: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);

    try {
      await createStore({
        name: values.storeName,
        description: values.storeDescription,
        logo: values.logo,
        stellar_wallet_address: values.walletAddress,
      });

      console.log("Store creation form submitted:", values);
      onSuccess();
    } catch (error) {
      console.error("Store creation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create your store</h1>
        <p className="text-zinc-400">
          Set up your store profile and start selling
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="storeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Cosmic Collectibles"
                    {...field}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-white"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="storeDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Store Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell customers about your store and what makes it special..."
                    {...field}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-white min-h-[120px]"
                  />
                </FormControl>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logo"
            render={({ field: { value, onChange } }) => (
              <FormItem>
                <FormLabel>Store Logo</FormLabel>
                <FormControl>
                  <FileUpload
                    value={value as File | undefined}
                    onChange={onChange}
                    accept="image/png, image/jpeg, image/gif"
                    maxSize={800}
                  />
                </FormControl>
                <FormDescription className="text-xs text-zinc-500">
                  Upload a PNG, JPG, or GIF (max 800x800px)
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="walletAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stellar Wallet Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="G..."
                    {...field}
                    className="bg-zinc-900 border-zinc-800 focus-visible:ring-white font-mono text-sm"
                  />
                </FormControl>
                <FormDescription className="text-xs text-zinc-500">
                  This is where you&apos;ll receive payments from sales
                </FormDescription>
                <FormMessage className="text-red-400" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full bg-white hover:bg-zinc-200 text-black font-medium mt-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating store...
              </>
            ) : (
              "Create Store"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
