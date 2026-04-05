import AccountButton from "../button/AccountButton";
import SettingButton from "../button/SettingButton";
import LogoutButton from "../button/LogoutButton";

type AccountMenuProps = {
  onAccountClick: () => void;
  onSettingsClick: () => void;
  onLogoutClick: () => void;
};

export default function AccountMenu({
  onAccountClick,
  onSettingsClick,
  onLogoutClick,
}: AccountMenuProps) {
  return (
    <div className="rounded-[28px] bg-[rgba(12,12,12,0.55)] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] backdrop-blur-[35px]">
      <div className="flex items-center gap-[10px]">
        <SettingButton onClick={onSettingsClick} />
        <AccountButton onClick={onAccountClick} />
        <LogoutButton onClick={onLogoutClick} />
      </div>
    </div>
  );
}