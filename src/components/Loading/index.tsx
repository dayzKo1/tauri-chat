import { styled } from "@umijs/max";
import { Spin } from "antd";
import React from "react";

const LoadingBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  zindex: 999;
  .content {
    padding: 50px;
    background: rgba(0, 0, 0, 0);
    border-radius: 4px;
  }
`;

interface ILoading {
  size?: "small" | "default" | "large";
  spinning?: boolean;
  boxStyle?: React.CSSProperties | undefined;
  loadingText?: string;
}
/**
 *
 * @param size loading大小, small default large
 * @param spinning 是否为加载中状态
 * @param boxStyle 容器自定义样式
 * @param loadingText 加载提示文本
 */

const Loading: React.FC<ILoading> = ({
  size,
  spinning,
  boxStyle,
  loadingText,
}): React.ReactElement => {
  return (
    <LoadingBox style={boxStyle}>
      <Spin spinning={spinning} size={size} tip={loadingText}>
        {spinning ? <div className="content" /> : <></>}
      </Spin>
    </LoadingBox>
  );
};
export default Loading;
