import qs from "query-string";

interface TGUser {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
}
export interface TypeTGWebAppData {
  auth_date: string;
  hash: string;
  query_id: string;
  user: TGUser;
}
const useTelegramUser = () => {
  try {
    const initParamsStr = sessionStorage.getItem("__telegram__initParams");
    if (!initParamsStr) {
      return null;
    }
    
    const initParams = JSON.parse(initParamsStr);
    if (!initParams || !initParams.tgWebAppData) {
      return null;
    }
    
    const TGparse = qs.parse(initParams.tgWebAppData);
    if (!TGparse || !TGparse.user) {
      return null;
    }
    
    const user: TGUser = JSON.parse(TGparse.user as string);
    return user;
  } catch (error) {
    console.error("Error parsing Telegram user data:", error);
    return null;
  }
};
export default useTelegramUser;
