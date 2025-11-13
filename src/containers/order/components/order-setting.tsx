/* eslint-disable camelcase */
import useUpdateOrder from "@framework/api/orders/update";
import { Order } from "@framework/types";
import useTelegramUser from "@hooks/useTelegramUser";
import { Button, Divider, Input, message, Radio } from "antd";
import { useState } from "react";

interface Props {
  orders: Order | undefined;
}

function OrderSetting({ orders }: Props) {
  const mutation = useUpdateOrder({ order_id: orders?.order_Id });
  const [status, setStatus] = useState(orders?.order_Status);
  const [tracking_Code, setTracking_Code] = useState(orders?.tracking_Code);
  const { id } = useTelegramUser();
  const onChange = (e) => {
    setStatus(e.target.value);
  };
  const handleSubmitStatus = () => {
    mutation.mutate(
      {
        order_Status: status,
        tracking_Code: tracking_Code || "",
        user_Id: id.toString()
      },
      {
        onSuccess: () => {
          message.success("Статус изменен");
        },
        onError: () => {
          message.error("Произошла ошибка");
        }
      }
    );
  };
  return (
    <div className="flex flex-col gap-4">
      <Divider> определение Статус Заказ</Divider>
      <Radio.Group onChange={onChange} defaultValue={status} value={status}>
        <Radio.Button value="Pending"> Ожидает подтверждения </Radio.Button>
        <Radio.Button value="Processing"> В процессе </Radio.Button>
        <Radio.Button value="Packing"> Упаковывается </Radio.Button>
        <Radio.Button value="CancelledByCustomer">Отменено клиентом</Radio.Button>
        <Radio.Button value="CancelledDueToUnavailability">
          Завершено из-за отсутствия 1 или нескольких товаров
        </Radio.Button>
        <Radio.Button value="CancelledByAdmin"> Отменено администратором </Radio.Button>
        <Radio.Button value="Shipped"> Доставлено </Radio.Button>
      </Radio.Group>

      <div className="flex flex-col ">
        <div className="text-right">код отслеживание :</div>
        <Input
          onChange={(e) => {
            setTracking_Code(e.target.value);
          }}
          value={tracking_Code}
        />
      </div>
      <Button
        loading={mutation.isLoading}
        onClick={handleSubmitStatus}
        className=" mt-10 w-full "
        size="large"
        type="primary"
        ghost>
        Сохранить
      </Button>
    </div>
  );
}

export default OrderSetting;
