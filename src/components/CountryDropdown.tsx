/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import styles from "@/styles/home-form.module.scss";

export interface Country {
  name: {
    common: string;
  };
  cca2: string;
  flags: {
    svg: string;
  };
}

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface GeocodeResult {
  address_components: AddressComponent[];
}

interface LocationData {
  results: GeocodeResult[];
}

type CountrySelectorProps = {
  onSelect: (country: Country) => void;
  name: string;
};

const CountryDropdown = ({ onSelect, name }: CountrySelectorProps) => {
  const [selected, setSelected] = useState<Country | null>(null);
  const [search, setSearch] = useState("");

  // Function to fetch user's country based on IP using Google Geolocation API
  const fetchUserCountry = async () => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
      const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(
          `Geolocation API request failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Geolocation API response:", data); // Log the response for debugging

      if (data.location) {
        const { lat, lng } = data.location;
        const locationResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
        );

        if (!locationResponse.ok) {
          throw new Error(
            `Geocoding API request failed with status: ${locationResponse.status}`
          );
        }

        const locationData = await locationResponse.json();
        console.log("Geocoding API response:", locationData); // Log the response for debugging

        const country = locationData.results.find((result: GeocodeResult) =>
          result.address_components.some((component: AddressComponent) =>
            component.types.includes("country")
          )
        );

        if (country) {
          const countryCode = country.address_components.find(
            (component: AddressComponent) => component.types.includes("country")
          ).short_name;
          console.log("User's country code:", countryCode); // Log the country code for debugging

          return countryCode;
        }
      }
      //throw new Error("Unable to determine country");
    } catch (error) {
      console.error("Error fetching user's country from Google API:", error);
      throw error;
    }
  };

  // Use react-query to fetch countries data
  const {
    data: countries = [],
    isLoading,
    error,
  } = useQuery<Country[]>({
    queryKey: ["countries"],
    queryFn: async () => {
      const response = await fetch("https://restcountries.com/v3.1/all");
      if (!response.ok) {
        throw new Error("Failed to fetch countries");
      }
      const data: Country[] = await response.json();
      return data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    },
  });

  // React Query to fetch the user's country
  const {
    data: userCountryCode,
    isLoading: isLoadingLocation,
    error: locationError,
  } = useQuery<string>({
    queryKey: ["userCountry"],
    queryFn: fetchUserCountry,
    enabled: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY ? true : false, // This makes sure the query runs when the component is mounted
  });

  // Handle selecting a country from the dropdown
  const handleSelect = (country: Country) => {
    setSelected(country);
  };

  useEffect(() => {
    if (selected) {
      onSelect(selected); // Trigger the onSelect callback after state update
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]); // This effect will run whenever 'selected' changes

  // Set the selected country based on user IP after fetching user location
  useEffect(() => {
    if (!isLoading && !isLoadingLocation && userCountryCode) {
      countries.find((country) => {
        country.cca2 === userCountryCode && handleSelect(country);
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCountryCode, countries, isLoading, isLoadingLocation]);

  // Filter countries based on the search input
  const filteredCountries = useMemo(() => {
    return countries.filter((country) =>
      country.name.common.toLowerCase().includes(search.toLowerCase())
    );
  }, [countries, search]);

  // Get the form context to register the field
  const {
    register,
    formState: { errors },
  } = useFormContext();

  if (isLoading || isLoadingLocation) {
    return <p>Loading...</p>;
  }

  if (error || locationError) {
    return <p>Error fetching data</p>;
  }

  return (
    !isLoading &&
    !isLoadingLocation &&
    selected && (
      <div className={styles.field}>
        <label htmlFor={name}>Country</label>
        {errors[name] && (
          <p className={styles.error}>
            {(errors[name]?.message as string) || ""}
          </p>
        )}
        <div className={styles.dropdownContainer}>
          {selected && (
            <div className={styles.flag}>
              <Image
                src={selected.flags.svg}
                alt={selected.name.common}
                width={20}
                height={15}
              />
            </div>
          )}
          <select
            id={name}
            {...register(name)}
            className={errors[name] ? styles.errorInput : ""}
            value={selected?.cca2}
            onChange={(e) => {
              const selectedCountry = countries.find(
                (country) => country.cca2 === e.target.value
              );
              if (selectedCountry) {
                handleSelect(selectedCountry);
              }
            }}
          >
            <option value="">Select your country</option>
            {filteredCountries?.map((country: Country) => (
              <option key={country.cca2} value={country.cca2}>
                {country.name.common}
              </option>
            ))}
          </select>
        </div>
      </div>
    )
  );
};

export default CountryDropdown;
