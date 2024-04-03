import noAuthentication from "@/assets/common/authenticationPrompt.png";
import { Button, Modal } from "antd";
import { history } from "umi";

export default function RealNameModal({ isRealName, setIsRealName }: any) {
  return (
    <Modal
      wrapClassName="mymodal"
      title=""
      closable={false}
      centered
      open={isRealName}
      onCancel={() => {
        setIsRealName(false);
      }}
      footer={null}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#fff",
          borderRadius: 30,
        }}
      >
        <img
          src={noAuthentication}
          alt=""
          style={{ width: "100%", height: "40%" }}
        />
        <div
          style={{
            fontSize: "18px",
            color: "#3B86F6",
            fontWeight: 500,
            marginTop: "10px",
          }}
        >
          实名认证
        </div>
        <div
          style={{
            padding: "10px 20px 0 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "#484C52",
            }}
          >
            您还未实名认证，为方便和享受更多权益服务，请前去认证身份完善资料吧～
          </div>
          <Button
            type="primary"
            style={{
              height: 40,
              width: "100%",
              marginTop: "15px",
            }}
            onClick={() => {
              history.push("/login/realNameAuthentication", { isLogin: true });
            }}
          >
            立即认证
          </Button>
          <Button
            type="link"
            style={{
              width: "30%",
              color: "#B5B5B5",
              marginTop: "10px",
              marginBottom: "20px",
            }}
            onClick={() => {
              setIsRealName(false);
            }}
          >
            再想想
          </Button>
        </div>
      </div>
    </Modal>
  );
}
