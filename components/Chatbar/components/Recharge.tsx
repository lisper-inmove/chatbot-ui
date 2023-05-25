import React, { SyntheticEvent, useRef, useState, useEffect } from 'react';
import { IconLogin, IconLogout, IconRecharging } from '@tabler/icons-react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { useTranslation } from 'react-i18next';
import QRCode from 'qrcode.react';
import axios from 'axios';

export const RechargePanel = () => {
  const { t } = useTranslation('sidebar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const handleButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleOptionClick = (option: string) => {
    setSelectedOption(option);
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleOutsideClick = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      handleModalClose();
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    } else {
      document.removeEventListener('mousedown', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isModalOpen]);

  return (
    <>

    <SidebarButton
      text={t('Recharge')}
      icon={<IconRecharging size={18} />}
      onClick={handleButtonClick}
    />

    {isModalOpen && (
        <div className="recharge-modal-overlay">
          <div className="modal" ref={modalRef}>
            <div className="options-container">
              <button
                className={`option recharge-button ${selectedOption === 'Option 1' ? 'selected' : ''}`}
                onClick={() => handleOptionClick('Option 1')}
              >
                100元
              </button>
              <button
                className={`option recharge-button ${selectedOption === 'Option 2' ? 'selected' : ''}`}
                onClick={() => handleOptionClick('Option 2')}
              >
               150元
              </button>
              <button
                className={`option recharge-button ${selectedOption === 'Option 3' ? 'selected' : ''}`}
                onClick={() => handleOptionClick('Option 3')}
              >
               300元
              </button>
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

    </>
  )
};
