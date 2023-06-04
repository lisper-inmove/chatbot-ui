import React, { SyntheticEvent, useRef, useState, useEffect } from 'react';
import { IconLogin, IconLogout, IconRecharging } from '@tabler/icons-react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import axios from 'axios';

interface RechargeConfig {
  id: string;
  name: string;
  price: number;
};

export const RechargePanel = () => {
  const { t } = useTranslation('sidebar');

  const [isSingleRechargeModalOpen, setIsSingleRechargeModalOpen] = useState(false);
  const [isMultiRechargeModalOpen, setIsMultiRechargeModalOpen] = useState(false);

  const [selectedOption, setSelectedOption] = useState('');
  const [selectedQrcodeUrl, setSelectedQrcodeUrl] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const phost = "https://agi.ailogy.cn/chatbot";
  const prepay_url = `${phost}/transaction/prepay`;
  const recharge_config_list_url = `${phost}/recharge-config/list`;
  const userinfo_name = "userinfo";
  const user_json = localStorage.getItem(userinfo_name) || '{}';
  const user_obj = JSON.parse(user_json);
  const [recharge_config_list, setRechargeConfigList] = useState<RechargeConfig[]>([]);

  const handleButtonClick = async (): Promise<void> => {
    if (recharge_config_list.length == 0) {
      return;
    }
    if (recharge_config_list.length == 1) {
      setIsSingleRechargeModalOpen(true);
      setIsMultiRechargeModalOpen(false);
    } else {
      setIsSingleRechargeModalOpen(false);
      setIsMultiRechargeModalOpen(true);
    }
    getPayQrcodeUrl(recharge_config_list[0].id);
  };

  const getPayQrcodeUrl = async (id: any): Promise<void> => {
    for (const config of recharge_config_list) {
      console.log("请求prepay: " + config);
      if (config.id == id) {
        // TODO: 当前只支持支付宝的当面付，所以直接写死
        const data = {
          "pay_method": "ALIPAY_F2F", 
          "type": "CHATBOT_PLUS", 
          "commodity_id": config.id
        };
        const headers = {"token": user_obj.token};
        const response = await axios.post(
          prepay_url,
          data,
          {headers}
        );
        console.log("prepay result: " + response.data.msg);
        if (response.data.code != 0) {
          alert("支付请求出错!");
          return;
        }
        setSelectedOption(id);
        setSelectedQrcodeUrl(response.data.data.qrcode_url);
      }
    }
  }

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  }

  const handleModalClose = () => {
    setIsSingleRechargeModalOpen(false);
    setIsMultiRechargeModalOpen(false);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleModalClose();
    }
  };

  useEffect(() => {
    if (isMultiRechargeModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isMultiRechargeModalOpen]);

  useEffect(() => {
    if (isSingleRechargeModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSingleRechargeModalOpen]);

  useEffect(() => {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({"1": "1"}),
    };
    // 异步请求获取数据
    fetch(recharge_config_list_url, requestOptions)
      .then(response => response.json())
      .then(data => {
        data.data.recharge_configs.sort((a: any, b: any) => b.price - a.price);
        setRechargeConfigList(data.data.recharge_configs);
      });
  }, []);

  return (
    <>

    <SidebarButton
      text={t('Recharge')}
      icon={<IconRecharging size={18} />}
      onClick={handleButtonClick}
    />

    {isSingleRechargeModalOpen && (
        <div className="recharge-modal-overlay">
          <div className="modal" ref={modalRef}>
            <div className="options-container">
            </div>
            <div className="qrcode-container">
              <QRCode
                value={selectedOption}
                fgColor="#ffffff" // 设置前景色为白色
                bgColor="#000000" // 设置背景色为黑色
              />
            </div>
          </div>
        </div>
      )}

      {isMultiRechargeModalOpen && (
        <div className="recharge-modal-overlay">
          <div className="modal" ref={modalRef}>
            <div className="oq-container">
              <div className="options-container">
                <div>
                  {recharge_config_list.map(({ id, name, price }, index) => (
                    <button
                      className={`option recharge-button ${selectedOption === id ? 'selected' : ''} ${index === 0 ? 'selected' : ''}`}
                      key={id}
                      onClick={() => getPayQrcodeUrl(id)}
                    >
                      <div>{name}</div>
                      <div>{(price / 100).toFixed(2)}元</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="qrcode-tip-container">
                <div className="qrcode-container">
                  <QRCode
                    value={selectedQrcodeUrl}
                    fgColor="#ffffff" // 设置前景色为白色
                    bgColor="#000000" // 设置背景色为黑色
                  />
                </div>
              </div>
              <div className="recharge-tip">请在5分钟内支付完成，支付完成之后请刷新页面</div>
            </div>
          </div>

        </div>
      )}
    </>
  )
};
