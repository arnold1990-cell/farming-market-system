import MobileAppShell from '../components/MobileAppShell';

export default function AppLayout({
  children,
  showMobileNav = true,
  title,
  subtitle,
  showSearch,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  hideHeader = false
}) {
  return (
    <MobileAppShell
      title={title}
      subtitle={subtitle}
      showSearch={showSearch}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
      showBottomNav={showMobileNav}
      hideHeader={hideHeader}
    >
      {children}
    </MobileAppShell>
  );
}
