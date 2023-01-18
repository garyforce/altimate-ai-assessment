import React, { useEffect, useState, useMemo, useRef } from "react";
import "./index.css";
import {
  Form,
  Input,
  Popconfirm,
  Table,
  Typography,
  Space,
  Button,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Highlighter from "react-highlight-words";

import useFetch from "./useFetch";
import ModalForm from "./ModalForm";
import ModalChart from "./ModalChart";
import { EditableCell } from "./Dashboard.component";

const Dashboard = () => {
  const [form] = Form.useForm();
  const [tableData, setTableData] = useState([]);
  const [editingKey, setEditingKey] = useState("");
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);

  const { data, loading, error } = useFetch(
    "https://jsonplaceholder.typicode.com/todos"
  );
  useEffect(() => {
    setTableData(data || []);
  }, [data]);
  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };
  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const onSuccess = (user) => {
    setTableData([...tableData, user]);
  };

  const isEditing = (record) => record.id === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      id: "",
      userId: "",
      title: "",
      completed: "",
      ...record,
    });
    setEditingKey(record.id);
  };

  const cancel = () => {
    setEditingKey("");
  };

  const save = async (id) => {
    try {
      const row = await form.validateFields();
      const newData = [...tableData];
      const index = newData.findIndex((item) => id === item.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          ...row,
        });
        setTableData(newData);
        setEditingKey("");
      } else {
        newData.push(row);
        setTableData(newData);
        setEditingKey("");
      }
    } catch (errInfo) {
      console.error("Validate Failed:", errInfo);
    }
  };

  const userIdFilters = useMemo(() => {
    const filterUserId = [];
    tableData.forEach((item) => {
      if (!filterUserId.includes(item.userId)) {
        filterUserId.push(item.userId);
      }
    });
    return filterUserId.map((item) => ({ text: item, value: item, key: item }));
  }, [tableData]);

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ""}
        />
      ) : (
        text
      ),
  });

  const columns = [
    {
      title: "Id",
      dataIndex: "id",
      width: "10%",
      editable: false,
    },
    {
      title: "UserId",
      dataIndex: "userId",
      width: "10%",
      editable: true,
      filters: userIdFilters,
      onFilter: (value, record) => record.userId === value,
    },
    {
      title: "Title",
      dataIndex: "title",
      width: "50%",
      editable: true,
      ...getColumnSearchProps("title"),
    },
    {
      title: "Completed",
      dataIndex: "completed",
      key: "completed",
      width: "15%",
      editable: true,
      render: (text) => String(text),
      filters: [
        {
          text: "true",
          value: true,
        },
        {
          text: "false",
          value: false,
        },
      ],
      onFilter: (value, record) => record.completed === value,
    },
    {
      title: "operation",
      dataIndex: "operation",
      width: "30%",
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{ marginRight: 8 }}
            >
              Save
            </Typography.Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link
            disabled={editingKey !== ""}
            onClick={() => edit(record)}
          >
            Edit
          </Typography.Link>
        );
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      key: col.dataIndex,
      onCell: (record) => ({
        record,
        inputType:
          col.dataIndex === "userId"
            ? "number"
            : col.dataIndex === "completed"
            ? "select"
            : "text",
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  return (
    <div>
      <ModalForm onSuccess={(user) => onSuccess(user)} />
      <ModalChart tableData={tableData} />
      {loading && <div>Loading...</div>}
      <Form form={form} component={false} style={{ height: "100%" }}>
        <Table
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={tableData}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
          }}
        />
      </Form>
    </div>
  );
};

export default Dashboard;
