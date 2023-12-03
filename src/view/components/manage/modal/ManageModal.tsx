import { Input, Modal, Space, Typography } from "antd";
import { useLoginMutation } from "queries/useLoginMutation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function ManageModal() {
  const navigate = useNavigate();

  const { mutate: login } = useLoginMutation();

  const [modalOpen, setModalOpen] = useState(true);
  const [password, setPassword] = useState("");

  return (
    <Modal
      className='manage'
      maskClosable={false}
      keyboard={false}
      centered
      open={modalOpen}
      onCancel={() => {
        navigate("/");
        setModalOpen(false);
      }}
      cancelText='취소'
      onOk={() => {
        login(password, {
          onSuccess: () => setModalOpen(false),
          onError: () => navigate("/"),
        });
      }}
      okText='확인'
      title='관리자만 입장 가능합니다.'
    >
      <Space direction='vertical' style={{ background: "white" }}>
        <Typography.Text>입장하시려면 비밀번호를 입력해주세요.</Typography.Text>
        <Input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='비밀번호 입력'
        />
      </Space>
    </Modal>
  );
}
