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
      className={`flex flex-col w-full overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm cursor-pointer transition-all hover:shadow-md ${
        finalPrice && "border-orange-400"
      }`}
      style={{ minHeight: '280px' }}>
      {/* Картинка сверху */}
      <div
        className="relative w-full bg-gray-100 bg-cover bg-center"
        style={{
          backgroundImage: imageURL ? `url('${import.meta.env.VITE_API_URL || ''}/${imageURL}')` : 'none',
          aspectRatio: '1 / 1',
          minHeight: '160px'
        }}>
        {finalPrice && (
          <span className="absolute top-2 right-2 rounded bg-orange-500 text-white px-2 py-1 text-xs font-semibold">
            -{finalPrice}%
          </span>
        )}
      </div>
      
      {/* Описание снизу */}
      <div className="flex flex-col p-3 flex-grow justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 min-h-[40px]">
            {title}
          </p>
          
          {pageType === "admin" && (
            <div className="text-xs text-gray-500">
              Количество: {quantity} шт
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-1 mt-2">
          {finalPrice ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 line-through">
                  {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice} томан
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold text-gray-900">
                  {addCommas && typeof addCommas === 'function' ? addCommas(safeDiscountedPrice) : safeDiscountedPrice}
                </span>
                <span className="text-sm text-gray-600">томан</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-900">
                {addCommas && typeof addCommas === 'function' ? addCommas(safePrice) : safePrice}
              </span>
              <span className="text-sm text-gray-600">томан</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductItem;
