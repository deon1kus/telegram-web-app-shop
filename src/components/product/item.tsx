/* eslint-disable operator-linebreak */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-one-expression-per-line */
import { addCommas } from "@persian-tools/persian-tools";
import { useNavigate } from "react-router";

interface Props {
  url: string;
  title: string;
  price: number;
  quantity: number;
  imageURL: string | Array<string>;
  pageType: "admin" | "user";
  discountedPrice: number;
}

function ProductItem({
  url,
  title,
  price,
  quantity,
  imageURL,
  pageType,
  discountedPrice
}: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (navigate && typeof navigate === 'function' && url) {
      try {
        navigate(url);
      } catch (err) {
        console.error('Navigation error:', err);
      }
    }
  };
  // Безопасный расчет скидки
  const safePrice = typeof price === 'number' && price > 0 ? price : 0;
  const safeDiscountedPrice = typeof discountedPrice === 'number' && discountedPrice > 0 ? discountedPrice : safePrice;
  const finalPrice = safeDiscountedPrice !== safePrice && safePrice > 0 
    ? Math.round(100 - (safeDiscountedPrice * 100) / safePrice) 
    : null;
  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      onClick={handleClick}
      className={` ${
        finalPrice && "border-red-700/70"
      }  flex h-[120px] w-full overflow-hidden  rounded-lg border-2 border-[var(--tg-theme-secondary-bg-color)]`}>
      <div className="flex w-2/3 flex-col items-center justify-between p-2">
        <p className="mb-1 ml-auto h-5 w-full select-none text-right ">
          {title}
        </p>
        <div className="flex w-full  flex-col gap-2">
          {/* <div className="flex items-center justify-between">
            <div className="rounded-xl bg-[var(--tg-theme-secondary-bg-color)] px-1 pt-1 text-sm ">
              ⭐4.3
            </div>
            <div className="select-none text-sm">еда</div>
          </div> */}
          <div
            className={`flex flex-row gap-3 self-end text-right ${
              finalPrice && " text-sm text-gray-500 line-through"
            }`}>
            <span>томан</span> <span>{addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice}</span>
          </div>
          {finalPrice && (
            <div className="flex flex-row gap-3 self-end text-right">
              <span>томан</span> <span>{addCommas && typeof addCommas === 'function' ? addCommas(safeDiscountedPrice) : safeDiscountedPrice}</span>
            </div>
          )}
          {pageType === "admin" && (
            <div className="self-end  text-left">Количество :{quantity} шт</div>
          )}
        </div>
      </div>
      <div
        className=" relative ml-auto h-full  w-1/3 bg-[var(--tg-theme-secondary-bg-color)] bg-cover"
        style={{
          backgroundImage: imageURL ? `url('${import.meta.env.VITE_API_URL || ''}/${imageURL}')` : 'none'
        }}>
        {finalPrice && (
          <span className="absolute right-0 top-0 rounded-bl-lg bg-red-700 p-2">
            {finalPrice} %
          </span>
        )}
      </div>
    </div>
  );
}

export default ProductItem;
