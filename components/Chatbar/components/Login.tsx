import React, { SyntheticEvent, useRef, useState, useContext } from 'react';
import { IconLogin, IconLogout } from '@tabler/icons-react';
import { SidebarButton } from '@/components/Sidebar/SidebarButton';
import { useTranslation } from 'react-i18next';
import HomeContext from '@/pages/api/home/home.context';
import axios from 'axios';
import { USER_MANAGER_HOST } from '@/utils/app/const';


export const LoginPanel = () => {

  const { state: { rechargePanel }, dispatch: dispatch } = useContext(HomeContext);
  console.log(rechargePanel);

  const { t } = useTranslation('sidebar');
  const [isLogin, setIsLogin] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const bhost = "https://agi.ailogy.cn/chatbot";
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
    const userjson = localStorage.getItem(userinfo_name);

    if (!userjson) {
      if (isLogin) {
        setIsLogin(false);
      }
      return;
    }

    const userobj = JSON.parse(userjson);
    userinfo['username'] = userobj.username;

    const token = userobj.token;
    const token_expire_at = userobj.token_expire_at;
    const timestamp = Date.now() / 1000;
    const currentDate = new Date();

    console.log(userobj.is_plus_user, rechargePanel);
    if (userobj.is_plus_user && rechargePanel) {
      dispatch({"field": "rechargePanel", "value": false});
    } else if (!userobj.is_plus_user && !rechargePanel) {
      dispatch({"field": "rechargePanel", "value": true});
    }

    try {
      const data = {
        "1": 1,
      };
      const headers = {
        "token": token,
      };
      const response = await axios.post(
        check_token_url,
        data,
        {headers},
      );
      if (response.data.code != 0) {
        setIsLogin(false);
        return;
      }
      console.log('Api response', response.data.data);
      localStorage.setItem(userinfo_name, JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Login error', error);
    }

    if (isLogin) {
      setIsLogin(true);
      return;
    }

    if (token_expire_at > timestamp) {
      // token没过期,不用检查
      setIsLogin(true);
      return;
    }

  }

  checkToken();

  const closeModal = (): void => {
    // 隐藏模态框的逻辑
    console.log('关闭模态框');
    setIsLogin(false);
  };

  const handleLoginSubmit = async (event: SyntheticEvent): Promise<void> => {
    event.preventDefault();
    // 处理登录逻辑
    console.log('登录表单已提交');
    const formData = new FormData(event.currentTarget as HTMLFormElement);
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const phone_regex = /^1[0-9]{10}$/;
    console.log(phone_regex.test(phone));
    if (phone && !phone_regex.test(phone)) {
      alert("手机号不正确");
      return;
    }

    const email_regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 邮箱格式验证正则表达式
    if (email && !email_regex.test(email)) {
      alert("邮箱不正确");
      return;
    }

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
      localStorage.setItem(userinfo_name, JSON.stringify(response.data.data));
    } catch (error) {
      console.error('Login error', error);
    }

    setIsLogin(true);
  };

  const logout = (): void => {
    localStorage.removeItem(userinfo_name);
    setTimeout(() => {
      setIsLogin(false);
    }, 1000);
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

  const handleInvalidPhone = (e: any): boolean => {
    if (e.target.value == "") {
      console.log("no");
      e.target.setCustomValidity("手机号不能为空");
      return false;
    }
    return true;
  }

  const handleInvalidEmail = (e: any): boolean => {
    if (e.target.value == "") {
      console.log("no");
      e.target.setCustomValidity("邮箱不能为空");
      return false;
    }
    return true;
  }

  const handleInvalidPassword = (e: any): boolean => {
    if (e.target.value == "") {
      console.log("no");
      e.target.setCustomValidity("密码不能为空");
      return false;
    }
    return true;
  }

  const handleInputValid = (e: any): void => {
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
