import { Outlet } from 'react-router-dom';
import { MarketingNavbar } from '../components/marketing/MarketingNavbar';
import { MarketingFooter } from '../components/marketing/MarketingFooter';
import { ToastContainer } from '../components/common/ToastContainer';

export function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] dark:bg-[#0c0d0f] text-neutral-900 dark:text-neutral-100 transition-colors">
      <MarketingNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <MarketingFooter />
      <ToastContainer />
    </div>
  );
}
