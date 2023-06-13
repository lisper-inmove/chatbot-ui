import React, { useContext } from 'react';
import { IconHelp } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import HomeContext from '@/pages/api/home/home.context';


export const HelperPanel = () => {
  const { t } = useTranslation();
  const homeContext = useContext(HomeContext);

  const helperPanelStyle = {
    display: 'flex',
    alignItems: 'center',
    marginLeft: '-80px',
  };

  const iconStyle = {
    marginRight: '10px',
    marginLeft: '-60px',
  };

  const linkStyle = {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
  };

  return (
    <div className="helper-panel" style={helperPanelStyle}>
      <span className="helper-icon" style={iconStyle}>
        <IconHelp />
      </span>
      <span className="helper-link" style={linkStyle}>
        <a href="http://www.ailogy.cn/archives/1057">帮助中心</a>
      </span>
    </div>
  );
};

