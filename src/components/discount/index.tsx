import useAddDiscounts from "@framework/api/discount/add";
import useDeleteDiscount from "@framework/api/discount/delete";
import useUpdateDiscount from "@framework/api/discount/update";
import { TypeDiscount } from "@framework/types";
import useTelegramUser from "@hooks/useTelegramUser";
import {
  Alert,
  Button,
  Divider,
  Form,
  InputNumber,
  message,
  Popconfirm
} from "antd";
import { DatePicker } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import dayjs from "dayjs";
import { useState } from "react";

interface Props {
  type: "product" | "category";
  id: string;
  data: TypeDiscount | null;
}

function Discount({ type, id, data }: Props) {
  const telegramUser = useTelegramUser();
  const userId = telegramUser?.id;
  const mutation = useAddDiscounts();
  const updateMutation = useUpdateDiscount({
    discount_id: data?.discount_Id || ""
  });
  const deleteMutation = useDeleteDiscount();
  const [checked, setChecked] = useState<boolean>(false);
  const disabledDate: RangePickerProps["disabledDate"] = (current) =>
    // Can not select days before today and today
    current && current < dayjs().endOf("day");

  const handleDeleteDiscount = () => {
    deleteMutation.mutate(
      {
        discount_id: data?.discount_Id,
        user_id: userId.toString()
      },
      {
        onSuccess: () => {
          message.success("Ваша скидка удалена ");
          window.location.reload();
        },
        onError: () => {
          message.error("Удалить Скидка с Ошибка столкнуться стал");
        }
      }
    );
  };

  return (
    <div>
      <Divider> Скидкаы </Divider>
      <Form
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 20 }}
        initialValues={{
          percent: data?.discount_Value,
          discount_start_date: data ? dayjs(data?.discount_Start_Date) : null,
          discount_end_date: data ? dayjs(data?.discount_End_Date) : null
        }}
        layout="horizontal"
        className="flex w-full flex-col justify-center gap-4"
        onFinish={({ percent, discount_start_date, discount_end_date }) => {
          const values = {
            category_id: type === "category" ? parseInt(id, 10) : null,
            product_id: type === "product" ? parseInt(id, 10) : null,
            discount_type: "percent",
            discount_value: percent,
            discount_start_date: dayjs(discount_start_date.$d).format() || "",
            discount_end_date: dayjs(discount_end_date.$d).format() || "",
            user_id: userId.toString()
          };
          if (data) {
            updateMutation.mutate(values, {
              onSuccess: () => {
                message.success("Ваша скидка сохранена ");
                // window.location.reload();
              },
              onError: () => {
                message.error("сохранить Скидка с Ошибка столкнуться стал");
              }
            });
          } else {
            mutation.mutate(values, {
              onSuccess: () => {
                message.success("Ваша скидка сохранена ");
                // window.location.reload();
              },
              onError: () => {
                message.error("сохранить Скидка с Ошибка столкнуться стал");
              }
            });
          }
        }}>
        <Alert
          type="info"
          message="Скидки применяются от 1 до 100 процентов "
          showIcon
        />
        <Form.Item name="percent" required label="процент">
          <InputNumber min={1} addonAfter="%" max={100} required />
        </Form.Item>

        <Form.Item name="discount_start_date" required label="С начала">
          <DatePicker />
        </Form.Item>
        <Form.Item name="discount_end_date" required label="До конца">
          <DatePicker disabledDate={disabledDate} />
        </Form.Item>

        <div className="flex gap-3">
          {data && (
            <Popconfirm
              placement="top"
              title="Вы уверены, что хотите удалить скидку?"
              onConfirm={() => handleDeleteDiscount()}
              okText="Удалить"
              okType="default"
              cancelText="Отменить">
              <Button
                size="large"
                loading={deleteMutation.isLoading}
                style={{ width: "36%" }}
                danger>
                Удалить Скидка
              </Button>
            </Popconfirm>
          )}
          <Button
            type="primary"
            loading={mutation.isLoading}
            style={{ width: data ? "65%" : "100%" }}
            size="large"
            ghost
            // className="sticky bottom-3"
            htmlType="submit">
            Сохранить
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default Discount;
