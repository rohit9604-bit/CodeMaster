import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t border-[#3f3f46]/20 bg-[#09090b]">
      {/* Top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 rounded-lg bg-amber-500/10">
                <Code2 className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-lg font-bold text-[#f4f4f5] tracking-tight">
                Code<span className="text-amber-400">Master</span>
              </span>
            </div>
            <p className="text-[#52525b] text-sm mb-5 max-w-sm leading-relaxed">
              Master your coding skills with challenging problems and AI-powered assistance. Level up, one challenge at a time.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Github, href: 'https://github.com' },
                { icon: Twitter, href: 'https://twitter.com' },
                { icon: Linkedin, href: 'https://linkedin.com' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#18181b]/60 border border-[#3f3f46]/20 text-[#52525b] hover:text-amber-400 hover:border-amber-500/20 hover:bg-amber-500/5 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-[#d4d4d8] mb-4 uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/challenges', label: 'Challenges' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/about', label: 'About Us' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[#52525b] hover:text-amber-400 transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-[#d4d4d8] mb-4 uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2.5">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-[#52525b] hover:text-amber-400 transition-colors text-sm"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-[#3f3f46]/15 mt-10 pt-6">
          <p className="text-center text-[#3f3f46] text-xs">
            © {currentYear} CodeMaster. Built with precision. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;