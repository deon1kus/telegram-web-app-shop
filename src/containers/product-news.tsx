import Card from "@components/product/card";
import ProductCardSkeleton from "@components/skeleton/product-card";
import { useGetProducts } from "@framework/api/product/get";
import { Divider } from "antd";

function ProductNews() {
  const { data, isLoading, isFetching, isError } = useGetProducts({
    limit: 6,
    sortBy: "Updated_At"
  });
  
  // Безопасное извлечение products с проверкой
  const products = data?.products || [];
  
  return (
    <div className="flex flex-col  gap-3">
      <Divider className="my-0 p-0">Наши новые товары</Divider>

      <div className="grid grid-cols-2  gap-2">
        {isLoading || isFetching ? (
          <>
            {[...Array(4)].map((_, idx) => (
              <ProductCardSkeleton key={`skeleton-${idx}`} delay={idx} />
            ))}
          </>
        ) : isError ? (
          <div className="col-span-2 text-center p-4 text-gray-500">
            Не удалось загрузить товары
          </div>
        ) : products.length === 0 ? (
          <div className="col-span-2 text-center p-4 text-gray-500">
            Товары не найдены
          </div>
        ) : (
          products.map((item) => (
            <Card
              key={`p-${item.product_Id}`}
              price={item.price}
              imageURL={item.photo_path}
              quantity={item.quantity}
              title={item.product_Name}
              url={`/products/${item.product_Id}`}
              discountedPrice={item.discountedPrice}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default ProductNews;
