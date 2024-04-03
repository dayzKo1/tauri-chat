import { LeftOutlined } from "@ant-design/icons";
import { styled, useNavigate } from "umi";

const HeaderBox: any = styled.div`
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;
  padding-right: 15px;
  background: ${(props: any) => (props.background ? props.background : "FFF")};
`;

const Header = ({
  title, // 标题
  titleColor = "#333", // 标题颜色
  titleSize = 18, // 标题大小
  rightText, // 右边文字
  background = "#FFF", // 背景
  arrowShow = true, // 左边返回图标显隐
}: any) => {
  const navigate = useNavigate();
  return (
    <HeaderBox background={background} data-tauri-drag-region>
      {arrowShow ? (
        <LeftOutlined
          size={24}
          onClick={() => {
            navigate(-1);
          }}
        />
      ) : (
        <></>
      )}
      <div
        data-tauri-drag-region
        style={{
          color: titleColor,
          fontWeight: "600",
          fontSize: titleSize,
          flex: 1,
          textAlign: "center",
          paddingRight: rightText || !arrowShow ? 0 : 24,
        }}
      >
        {title}
      </div>
      {rightText}
    </HeaderBox>
  );
};

export default Header;
