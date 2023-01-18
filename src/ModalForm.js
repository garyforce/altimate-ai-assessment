import React from "react";
import { useModalForm } from "sunflower-antd";
import { Modal, Input, Button, Form, Spin, Select, InputNumber } from "antd";
import { submitUser } from "./useFetch";
const { Option } = Select;

export default ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { modalProps, formProps, show, formLoading, formValues, formResult } =
    useModalForm({
      defaultVisible: false,
      autoSubmitClose: true,
      autoResetForm: true,
      async submit(value) {
        const response = await submitUser(value);
        if (response.status === 201) onSuccess(response.data);
        return "ok";
      },
      form,
    });
  return (
    <div>
      <Modal {...modalProps} title="Submit User" okText="submit" width={600}>
        <Spin spinning={formLoading}>
          <>
            <Form
              {...formProps}
              style={{ marginTop: 50 }}
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
            >
              <Form.Item
                label="Title"
                name="title"
                rules={[
                  {
                    required: true,
                    message: "Please input email",
                  },
                ]}
              >
                <Input placeholder="Please input Title" />
              </Form.Item>

              <Form.Item
                label="UserId"
                name="userId"
                rules={[
                  {
                    required: true,
                    message: "Please input Validated UserId",
                    type: "number",
                  },
                ]}
              >
                <InputNumber
                  placeholder="Please input UserId"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                name="completed"
                label="Completed"
                rules={[{ required: true }]}
              >
                <Select placeholder="Please input Completed Status">
                  <Option value="true">true</Option>
                  <Option value="false">false</Option>
                </Select>
              </Form.Item>
            </Form>
          </>
        </Spin>
      </Modal>
      <Button
        type="primary"
        onClick={show}
        style={{ float: "right", margin: 10, marginBottom: 0 }}
      >
        + Add Title
      </Button>
    </div>
  );
};
