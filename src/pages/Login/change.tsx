import { ManOutlined, WomanOutlined } from '@ant-design/icons';
import { Button, Form, Input, Radio } from 'antd';
import { styled } from 'umi';

const LoginBox = styled.div`
   display: flex;
   text-align: center;
   align-items: center;
   flex-direction: column;
   margin-top: 40px;
   .ant-radio-group {
    width:100%;
    .ant-radio-button-wrapper{
      width:50%;
    }
   }
   .ant-form-item {
     width: 250px;
     height：400px;
     .ant-input {
       height: 40px;
       border: none;
       background: #f7f7f7;
       &::placeholder {
         font-size: 14px;
         color: #bbbbbb;
       }
     }
     .ant-input-affix-wrapper {
       border: none;
       background: #f7f7f7;
     }
   }
`;

const Basic = ({}) => {
  const [form] = Form.useForm();

  return (
    <LoginBox>
      <Form
        form={form}
        initialValues={{}}
        onFinish={(values) => {
          console.log(values);
        }}
      >
        <Form.Item name="nickName">
          <Input placeholder="昵称" />
        </Form.Item>
        <Form.Item name="gender">
          <Radio.Group>
            <Radio.Button value="horizontal">
              <ManOutlined /> 男
            </Radio.Button>
            <Radio.Button value="vertical">
              <WomanOutlined /> 女
            </Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="email">
          <Input placeholder="请输入邮箱" />
        </Form.Item>
        <Form.Item name="enterprise">
          <Input placeholder="请输入企业名称" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="login-form-button"
            style={{ width: 240, height: 40 }}
          >
            保存
          </Button>
        </Form.Item>
      </Form>
    </LoginBox>
  );
};

export default Basic;
