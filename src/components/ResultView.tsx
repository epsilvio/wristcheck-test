import { FC } from "react";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import styles from "@/styles/results.module.scss";

interface ResultCardProps {
  price: number;
  currency: string;
  names: string[];
  country: string;
}

const ResultCard: FC<ResultCardProps> = ({
  price,
  currency,
  names,
  country,
}) => {
  // Generate a unique seed from the names
  const seed = names.join(" ");

  const avatar = createAvatar(lorelei, {
    seed,
    size: 100, // Adjust the size of the avatar
  });

  // Function to handle reset button click (reload page)
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <div className={styles.avatarCard}>
      <div
        className={styles.avatarContainer}
        dangerouslySetInnerHTML={{ __html: avatar.toString() }}
      />
      <div className={styles.details}>
        <h2>Welcome {names.join(" ")}</h2>
        <p>from {country}</p>
        <p>and their watch worth {`${price} ${currency}`}!</p>
      </div>
      <button className={styles.resetButton} onClick={handleReset}>
        Reset
      </button>
    </div>
  );
};

export default ResultCard;
