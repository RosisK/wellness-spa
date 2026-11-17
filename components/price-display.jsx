import { getOptionPrice } from "../lib/site-content";

export default function PriceDisplay({ option, className = "" }) {
  const { price, originalPrice, discountPercent } = getOptionPrice(option);

  return (
    <span className={`price-display ${discountPercent ? "has-discount" : ""} ${className}`.trim()}>
      {discountPercent > 0 && <><del>{originalPrice}</del><span className="discount-badge">{discountPercent}% off</span></>}
      <strong>{price}</strong>
    </span>
  );
}
