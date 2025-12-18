/**
 * © 2025 igotnowifi, LLC
 * Proprietary and confidential.
 */

interface FooterProps {
    variant?: 'clinician' | 'patient';
  }
  
  const Footer = ({ variant = 'patient' }: FooterProps) => {
    return (
      <footer className="py-4 px-6 border-t border-border bg-background/95 text-center text-xs text-muted-foreground">
        {variant === 'clinician' ? (
          <span>© 2025 igotnowifi, LLC · Proprietary Clinical Software</span>
        ) : (
          <span>Powered by igotnowifi, LLC</span>
        )}
      </footer>
    );
  };
  
  export default Footer;
  