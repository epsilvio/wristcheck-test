/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import styles from "@/styles/home-form.module.scss";
import { gsap } from "gsap";
import { useEffect, useState } from "react";
import CountryDropdown from "@/components/CountryDropdown";
import PriceForm from "@/components/PriceForm";
import ResultCard from "@/components/ResultView";

// Zod Schema for Validation
const formSchema = z.object({
  firstName: z.string().nonempty("First name is required"),
  lastName: z.string().optional(),
  country: z.string().nonempty("Please select a country"),
});

export type FormData = z.infer<typeof formSchema>;

export default function HomePage() {
  const methods = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const [userCountry, setUserCountry] = useState<string>("");
  const [breadcrumb, setBreadcrumb] = useState<number>(1);
  const [user_detail, setUserDetail] = useState<FormData>();
  const [watch_price, setWatchPrice] = useState<number>(0);
  const [price_curr, setPriceCurr] = useState<string>("");

  const onSubmit = (data: FormData) => {
    setUserDetail(data);
    setBreadcrumb(2);
  };

  // GSAP Animations
  useEffect(() => {
    // Wait for the elements to be available in the DOM
    const banner = document.querySelector(`.${styles.banner}`);
    const form = document.querySelector(`.${styles.form}`);

    if (banner && form) {
      gsap.fromTo(
        banner,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out" }
      );

      gsap.fromTo(
        form,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
      );
    } else if (!banner && form) {
      gsap.fromTo(
        form,
        { opacity: 0, y: 100 },
        { opacity: 1, y: 0, duration: 1, ease: "power3.out", delay: 0.3 }
      );
    }
  }, []);

  return (
    <FormProvider {...methods}>
      <main className={styles.main}>
        {/* Video Background */}
        <video className={styles.videoBackground} autoPlay muted loop>
          <source
            src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
            type="video/mp4"
          />
        </video>

        {breadcrumb === 1 && (
          <>
            {/* Banner Image */}
            <img
              className={styles.banner}
              src="/homepage_banner.png"
              alt="Banner"
            />

            {/* Form */}
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
              {/* First Name & Last Name */}
              <div className={styles.nameFields}>
                <div className={styles.field}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="Enter your first name"
                    {...register("firstName")}
                    className={errors.firstName ? styles.errorInput : ""}
                  />
                  {errors.firstName && (
                    <p className={styles.error}>
                      {(errors.firstName.message as string) || ""}
                    </p>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Enter your last name"
                    {...register("lastName")}
                    className={errors.lastName ? styles.errorInput : ""}
                  />
                  {errors.lastName && (
                    <p className={styles.error}>
                      {(errors.lastName.message as string) || ""}
                    </p>
                  )}
                </div>
              </div>

              {/* Country Dropdown */}
              <CountryDropdown
                onSelect={(country) => setUserCountry(country.name.common)}
                name="country"
              />

              {/* Confirmation Button */}
              <button type="submit" className={styles.button}>
                Confirm
              </button>
            </form>
          </>
        )}

        {user_detail && userCountry && breadcrumb === 2 && (
          <PriceForm
            user_details={user_detail}
            country_name={userCountry}
            onPrevClick={(clicked: boolean) =>
              clicked ? setBreadcrumb(1) : void 0
            }
            onPriceSubmit={(price, currency) => {
              setWatchPrice(price);
              setPriceCurr(currency);
              setBreadcrumb(3);
            }}
          />
        )}

        {breadcrumb === 3 && user_detail && userCountry && (
          <ResultCard
            price={watch_price}
            currency={price_curr}
            names={
              user_detail.lastName
                ? [user_detail.firstName, user_detail.lastName]
                : [user_detail.firstName]
            }
            country={userCountry}
          />
        )}
      </main>
    </FormProvider>
  );
}
