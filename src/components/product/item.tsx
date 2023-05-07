import { useNavigate } from "react-router";

interface Props {
  url: string;
}

function ProductItem({ url }: Props) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(url);
  };

  return (
    <div
      onClick={handleClick}
      className=" flex h-[120px] w-full overflow-hidden  rounded-lg border-2 border-[var(--tg-theme-secondary-bg-color)]">
      <div className="flex w-2/3 flex-col items-center justify-between p-2">
        <p className="mb-1 ml-auto h-5 w-full select-none text-right ">title</p>
        <p className="mb-1 ml-auto h-5 w-full select-none text-right text-gray-500 ">
          description
        </p>
        <div className="flex w-full  flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-[var(--tg-theme-secondary-bg-color)] px-1 pt-1 text-sm ">
              ⭐4.3
            </div>
            <div className="select-none text-sm">غذا</div>
          </div>
          <div className="self-start text-left">124,000 تومان</div>
        </div>
      </div>
      <div className=" ml-auto h-full w-1/3  bg-[var(--tg-theme-secondary-bg-color)]" />
    </div>
  );
}

export default ProductItem;
