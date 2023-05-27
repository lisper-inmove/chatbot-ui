import React, { SyntheticEvent, useRef } from 'react';
import { IconLogin, IconLogout } from '@tabler/icons-react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import axios from 'axios';

export const LoginPanel = () => {

  const { t } = useTranslation('sidebar');
  const [isLogin, setIsLogin] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const bhost = "http://192.168.3.124:6003";
  const login_url = `${bhost}/user/login`;
  const check_token_url = `${bhost}/user/check-token`;

  const [isPhoneLogin, setIsPhoneLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleToggleLoginMode = () => {
    setIsPhoneLogin(!isPhoneLogin);
  };

  const userinfo_name = "userinfo";
  let userinfo = {
    "username": "未登陆",
  };

  async function checkToken() {
    const user_json = localStorage.getItem(userinfo_name);

    if (!user_json && !isLogin) {
      return;
    }

    const user_obj = JSON.parse(user_json);
    const token = user_obj.token;
    const token_expire_at = user_obj.token_expire_at;
    const timestamp = Date.now() / 1000;
    const currentDate = new Date();
    userinfo['username'] = user_obj.username;

    console.log(token_expire_at, timestamp);

    if (token_expire_at > timestamp) {
      // token没过期,不用检查
      console.log("当前时间: " + currentDate);
      console.log("token过期时间: " + new Date(token_expire_at * 1000));
      return;
    }

    try {
      const data = {
        "1": "1"
      };
      const headers = {
        "headers": {
          "token": token
        }
      }
      const response = await axios.post(
        check_token_url,
        data,
        headers,
      );
      if (response.data.code == 0) {
        setIsLogin(true);
        return;
      }
    } catch(error) {
      console.log("Check Token error", error);
      setIsLogin(false);
    }
  }

  checkToken();

  const closeModal = (): void => {
    // 隐藏模态框的逻辑
    console.log('关闭模态框');
    setIsLogin(false);
  };

  const handleLoginSubmit = async (event: SyntheticEvent): Promize<void> => {
    event.preventDefault();
    // 处理登录逻辑
    console.log('登录表单已提交');
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const data = {
        phone: phone,
        password: password,
        email: email
      };
      const response = await axios.post(
        login_url,
        data,
      );
      if (response.data.code != 0) {
        alert(response.data.msg);
        return;
      }
      // event.currentTarget.reset();
      console.log('Api response', response.data.data);
      localStorage.setItem(userinfo_name, JSON.stringify(response.data.data));

    } catch (error) {
      console.error('Login error', error);
    }

    setIsLogin(true);
  };

  const logout = (): void => {
    localStorage.removeItem(userinfo_name);
    setIsLogin(false);
  }

  const handleRegisterSubmit = (event: SyntheticEvent): void => {
    event.preventDefault();
    // 处理注册逻辑
    console.log('注册表单已提交');
    setIsLogin(true);
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      closeModal();
    }
  };

  const handleInvalidPhone = (e): void => {
    if (e.target.value == "") {
      console.log("no");
      e.target.setCustomValidity("手机号不能为空");
      return false;
    }
    return true;
  }

  const handleInvalidEmail = (e): void => {
    if (e.target.value == "") {
      console.log("no");
      e.target.setCustomValidity("邮箱不能为空");
      return false;
    }
    return true;
  }

  const handleInvalidPassword = (e): void => {
    if (e.target.value == "") {
      console.log("no");
      e.target.setCustomValidity("密码不能为空");
      return false;
    }
    return true;
  }

  const handleInputValid = (e): voild => {
    e.target.setCustomValidity("");
  }

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>

    {!isLogin && (
    <SidebarButton
      text={t('Login > 未登陆')}
      icon={<IconLogin size={18} />}
      onClick={() => setIsLogin(true)}
    />
    )}

    {isLogin && (
    <SidebarButton
      text={t(userinfo.username)}
      icon={<IconLogout size={18} />}
      onClick={logout}
    />
    )}

    {!isLogin && (

    <div className="modal-overlay">
      <div className="modal" ref={modalRef}>
        <span className="close" onClick={closeModal}>&times;</span>
        <form id="login-form" onSubmit={handleLoginSubmit}>
          <h2 className="login-title">登录</h2>

          <div className="login-mode-toggle">
            <label>
              <input
                type="radio"
                name="loginMode"
                value="phone"
                checked={isPhoneLogin}
                onChange={handleToggleLoginMode}
              />
              <span className="long-text">手机</span>
            </label>
            <label>
              <input
                type="radio"
                name="loginMode"
                value="email"
                checked={!isPhoneLogin}
                onChange={handleToggleLoginMode}
              />
              <span className="long-text">邮箱</span>
            </label>
          </div>

          {isPhoneLogin ? (
          <div className="input-wrapper">
            <input
            type="tel" id="phone" name="phone" placeholder="手机号" className="input-black"
            onInvalid={handleInvalidPhone}
            onInput={handleInputValid}
            required />
          </div>
          ) : (

          <div className="input-wrapper">
            <input
            type="email" id="email" name="email" placeholder="邮箱" className="input-black"
            onInvalid={handleInvalidEmail}
            onInput={handleInputValid}
            required />
          </div>
          )}

          <div className="input-wrapper">
            <input
            type="password" id="password" name="password" placeholder="密码" className="input-black"
            onInvalid={handleInvalidPassword}
            onInput={handleInputValid}
            required />
          </div>

          <button type="submit" className="login-btn">登录/注册</button>
        </form>
      </div>
    </div>

    )}

    </>
  )
};
