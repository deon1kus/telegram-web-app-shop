/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable object-curly-newline */
/* eslint-disable no-nested-ternary */
import {
  FileDoneOutlined,
  ReloadOutlined,
  SlidersOutlined
} from "@ant-design/icons";
import ProductsSkeleton from "@components/skeleton/products";
import { useGetCategories } from "@framework/api/categories/get";
import { useGetProducts } from "@framework/api/product/get";
import {
  Button,
  Divider,
  Drawer,
  Empty,
  Input,
  Pagination,
  Select,
  Tree
} from "antd";
import { useState, useEffect } from "react";
import * as React from "react";

import ProductItem from "./item";

interface Props {
  pageType: "admin" | "user";
  // data: TypeListProducts | undefined;
}
function ProductList({ pageType }: Props) {
  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoryFilterId, setCategoryFilterId] = useState<number | undefined>(
    undefined
  );
  const [search, setSearch] = useState<string | undefined>(undefined);
  const [Order, setOrder] = useState<"desc" | "asc">("desc");
  
  // Убедиться, что компонент смонтирован
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const queryResult = useGetProducts({
    limit: 10,
    page: currentPage,
    categoryId: categoryFilterId,
    name: search,
    order: Order
  });
  
  // Безопасная деструктуризация с проверками
  const data = queryResult?.data;
  const error = queryResult?.error;
  const refetch = queryResult?.refetch;
  const isLoading = queryResult?.isLoading ?? false;
  const isFetching = queryResult?.isFetching ?? false;
  
  // Безопасная функция refetch с проверкой
  const safeRefetch = () => {
    if (isMounted && refetch && typeof refetch === 'function') {
      try {
        refetch();
      } catch (err) {
        console.error('Error refetching:', err);
      }
    }
  };
  const categoriesQuery = useGetCategories({});
  
  // Безопасная деструктуризация категорий
  const catData = categoriesQuery?.data;
  const isCatLoading = categoriesQuery?.isLoading ?? false;
  const isCatFetching = categoriesQuery?.isFetching ?? false;
  
  // Безопасное извлечение products с проверкой
  const products = (data && data.products && Array.isArray(data.products)) ? data.products : [];
  
  // Безопасное извлечение категорий с проверкой
  const categories = Array.isArray(catData) ? catData : [];
  
  return (
    <div className="flex flex-col">
      <div className=" flex flex-col items-end justify-center gap-2 ">
        <Input.Search
          loading={isLoading || isFetching}
          allowClear
          onSearch={(value: string) => {
            if (!isMounted) return;
            if (typeof setSearch === 'function') {
              setSearch(value || undefined);
            }
            safeRefetch();
          }}
        />
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col items-end justify-end">
            <Select
              onChange={(value: "asc" | "desc") => {
                if (!isMounted) return;
                if (typeof setOrder === 'function' && (value === 'asc' || value === 'desc')) {
                  setOrder(value);
                }
                safeRefetch();
              }}
              value={Order || "desc"}
              style={{ width: "fit-content" }}
              options={[
                { value: "asc", label: "Цена от низкой к высокой" },
                { value: "desc", label: "Цена от высокой к низкой" }
              ]}
            />
          </div>
          <Button onClick={() => setOpen(true)} icon={<SlidersOutlined />}>
            Фильтры
          </Button>
        </div>
        <Drawer
          extra={
            <div className="flex gap-3">
              <Button
                className="w-full"
                onClick={() => {
                  safeRefetch();
                  setOpen(false);
                }}
                danger
                size="large">
                Удалить фильтры
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  safeRefetch();
                  setOpen(false);
                }}
                size="large"
                icon={<FileDoneOutlined />}>
                Применить фильтр
              </Button>
            </div>
          }
          title="Фильтры"
          placement="bottom"
          onClose={() => setOpen(false)}
          width="100%"
          height="90%"
          className="rounded-t-3xl"
          open={open}>
          <div className="flex h-full w-full flex-col items-center justify-start gap-5">
            <div className="w-full">
              {Array.isArray(categories) && categories.length > 0 ? (
                <Tree
                  loading={isCatLoading || isCatFetching}
                  disabled={isCatLoading || isCatFetching}
                  style={{ width: "100%" }}
                  treeData={categories}
                  showLine
                  defaultExpandAll
                  checkable
                  onCheck={(checkedKeys: any, info: any) => {
                    if (typeof setCategoryFilterId === 'function') {
                      if (Array.isArray(checkedKeys) && checkedKeys.length > 0) {
                        const firstKey = checkedKeys[0];
                        const categoryId = typeof firstKey === 'number' 
                          ? firstKey 
                          : (typeof firstKey === 'string' ? parseInt(firstKey, 10) : undefined);
                        setCategoryFilterId(categoryId);
                      } else {
                        setCategoryFilterId(undefined);
                      }
                    }
                  }}
                fieldNames={{
                  title: "category_Name",
                  key: "category_Id",
                  children: "children"
                }}
                dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
                allowClear
                multiple
                selectable={false}
              />
              ) : (
                <div className="flex w-full items-center justify-center p-4">
                  <span>Категории загружаются...</span>
                </div>
              )}
            </div>
          </div>
        </Drawer>
      </div>
      <Divider />
      {/* <Suspense fallback={<ProductsSkeleton />}> */}
      {/* <ProductsSkeleton /> */}
      <div className="mb-10 grid grid-cols-2 gap-3">
        {isLoading || isFetching ? (
          <ProductsSkeleton />
        ) : error ? (
          <div className="flex w-full flex-col items-center justify-center gap-5">
            Произошла ошибка
            <Button onClick={() => safeRefetch()} icon={<ReloadOutlined />}>
              Попробовать снова
            </Button>
          </div>
        ) : !Array.isArray(products) || products.length === 0 ? (
          <div className="flex w-full items-center justify-center">
            <Empty description="Информация недоступна" />
          </div>
        ) : (
          <>
            {Array.isArray(products) && products.map((item) => {
              // Безопасная проверка всех полей перед рендерингом
              if (!item || typeof item !== 'object') return null;
              
              const safeItem = {
                product_Name: item.product_Name || '',
                price: typeof item.price === 'number' ? item.price : 0,
                photo_path: item.photo_path || '',
                quantity: typeof item.quantity === 'number' ? item.quantity : 0,
                product_Id: item.product_Id || 0,
                discountedPrice: typeof item.discountedPrice === 'number' ? item.discountedPrice : (item.price || 0)
              };
              
              return (
                <ProductItem
                  key={safeItem.product_Id || Math.random()}
                  title={safeItem.product_Name}
                  price={safeItem.price}
                  imageURL={safeItem.photo_path}
                  quantity={safeItem.quantity}
                  product_Id={safeItem.product_Id}
                  discountedPrice={safeItem.discountedPrice}
                  pageType={pageType}
                  url={
                    pageType === "admin"
                      ? `/admin/products/${safeItem.product_Id}`
                      : `/products/${safeItem.product_Id}`
                  }
                />
              );
            })}
          </>
        )}
      </div>
      <Pagination
        current={currentPage}
        onChange={(page: number) => {
          if (!isMounted) return;
          if (typeof setCurrentPage === 'function' && typeof page === 'number' && page > 0) {
            setCurrentPage(page);
          }
          if (isMounted) {
            safeRefetch();
          }
        }}
        pageSize={10}
        total={data?.totalRows || 0}
        showSizeChanger={false}
      />
      {/* </Suspense> */}
    </div>
  );
}

export default ProductList;
