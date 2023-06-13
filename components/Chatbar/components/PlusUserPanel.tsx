import React, { SyntheticEvent, useRef, useState, useContext } from 'react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { useTranslation } from 'react-i18next';
import HomeContext from '@/pages/api/home/home.context';


export const PlusUserPanel = () => {

  const { state: { isPlusUser }, dispatch: dispatch } = useContext(HomeContext);

  const { t } = useTranslation('sidebar');
  const modalRef = useRef<HTMLDivElement>(null);
  const userinfo = JSON.parse(localStorage.getItem("userinfo") || "{}");

  function formatTimestamp(timestamp: number): string {
    const date = new Date(Number(timestamp) * 1000);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  return <> { isPlusUser && (<div style={{"marginLeft": "-80px"}}>
    {t('VIP: ' + formatTimestamp(userinfo.vip_expire_at))}
  </div> )}
  </>;
};
