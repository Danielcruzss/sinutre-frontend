import { List, SignOut } from '@phosphor-icons/react';

interface HeaderProps {
  drawerId: string;
  userName: string;
  avatarUrl: string;
}



export function Header({ drawerId, userName, avatarUrl }: HeaderProps) {

  function handleLogout() {
    localStorage.clear();
    window.location.href = '/';
  }

  return (
    <header className="flex items-center gap-3 w-full">
      <div className="flex-none lg:hidden">
        <label
          htmlFor={drawerId}
          className="btn btn-square btn-ghost drawer-button"
          aria-label="Abrir menu"
        >
          <List size={24} />
        </label>
      </div>

      <div className="avatar shrink-0">
        <div className="w-10 lg:w-16 rounded-full border border-base-300">
          <img src={avatarUrl} alt={`Avatar de ${userName}`} />
        </div>
      </div>

      <h1 className="flex-1 text-base lg:text-4xl font-bold tracking-tight truncate">
        Bem vindo, {userName}!
      </h1>
      
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg font-semibold transition-colors shadow-sm cursor-pointer text-sm"
        title="Sair"
      >
        <SignOut size={20} weight="bold" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  );
}
