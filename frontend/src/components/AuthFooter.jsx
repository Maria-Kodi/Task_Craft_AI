import { Link } from 'react-router-dom';

export default function AuthFooter() {
  return (
    <footer className="relative z-10 px-6 pb-8 pt-14 flex justify-center lg:px-14">
      <div className="w-full flex flex-col items-center gap-4">
        <span className="h-px w-full bg-[#080e29] transition-all duration-300 hover:brightness-105 shadow-[0_8px_20px_rgba(16,25,70,0.25)]" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-[#6B6558] tracking-wide">
            &copy; {new Date().getFullYear()} TaskCraft AI. All rights reserved.
          </p>
          <nav className="flex items-center gap-4">
            <Link to="/privacy" className="text-xs text-[#8a8272] hover:text-[#1B1E29] transition-colors">
              Privacy
            </Link>
            <span className="text-[#1B1E29]/15">·</span>
            <Link to="/terms" className="text-xs text-[#8a8272] hover:text-[#1B1E29] transition-colors">
              Terms
            </Link>
            <span className="text-[#1B1E29]/15">·</span>
            <Link to="/support" className="text-xs text-[#8a8272] hover:text-[#1B1E29] transition-colors">
              Support
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}