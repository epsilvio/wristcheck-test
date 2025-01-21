/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { FormData } from "@/app/page";
import styles from "@/styles/price-form.module.scss";

interface PriceFormProps {
  user_details: FormData;
  country_name: string;
  onPriceSubmit: (price: number, currency: string) => void;
  onPrevClick: (clicked: boolean) => void;
}

// Validation schema using Zod
const priceSchema = z.object({
  price: z
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0")
    .min(1, "Price must be greater than 0"),
});

// Define the type for form inputs
type PriceFormInputs = z.infer<typeof priceSchema>;

// Function to fetch currency data
const fetchCurrencySymbol = async (countryCode: string): Promise<string> => {
  const response = await fetch(
    `https://restcountries.com/v3.1/alpha/${countryCode}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch currency data");
  }
  const data = await response.json();
  const currencyCode = Object.keys(data[0].currencies)[0]; // Get the currency code
  return data[0].currencies[currencyCode]?.symbol || "$"; // Get the currency symbol, fallback to "$"
};

const PriceForm: React.FC<PriceFormProps> = ({
  user_details,
  country_name,
  onPriceSubmit,
  onPrevClick,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PriceFormInputs>({
    resolver: zodResolver(priceSchema),
  });

  const {
    data: currencySymbol,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currencySymbol", user_details.country],
    queryFn: () => fetchCurrencySymbol(user_details.country),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const onSubmit: SubmitHandler<PriceFormInputs> = (data) => {
    onPriceSubmit(data.price, currencySymbol || "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <h2>Your Watch Price</h2>
      <div className={styles.formGroup}>
        {/* This spans the symbol inside the input */}
        <span className={styles.currencySymbol}>
          {isLoading ? "..." : isError ? "N/A" : currencySymbol}
        </span>
        <input
          type="number"
          id="price"
          {...register("price", { valueAsNumber: true })}
          placeholder="Enter amount"
        />
        {errors.price && (
          <p className={styles.errorMsg}>{errors.price.message}</p>
        )}
      </div>
      <div className={styles.formAction}>
        <button
          type="button"
          onClick={() => onPrevClick(true)}
          className={styles.secondary}
        >
          Back
        </button>
        <button type="submit" className={styles.button}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default PriceForm;
