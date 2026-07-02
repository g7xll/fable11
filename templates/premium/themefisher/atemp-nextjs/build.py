#!/usr/bin/env python3
"""Generator for the Atemp clone. Produces static HTML pages that share
header/footer/CSS/JS. Run: python3 build.py"""
import os

ROOT = os.path.dirname(os.path.abspath(__file__))

BOOT = """<script>
(function () {
  var stored = localStorage.getItem("atemp-theme");
  if (stored) document.documentElement.setAttribute("data-theme", stored);
})();
</script>"""

def head(title, desc, depth=""):
    return f"""<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="{depth}assets/favicon.png">
<link rel="stylesheet" href="{depth}assets/css/style.css">
{BOOT}"""

def header(depth="", active=""):
    def cls(name):
        return " active" if active == name else ""
    return f"""<div class="topbar">Connect with a Atemp Expert to create a website using this template <a href="#">Learn More Details</a></div>
<header class="site-header">
  <div class="container">
    <a href="{depth}index.html" class="brand"><img src="{depth}assets/images/logo.png" alt="Atemp logo" style="height:32px;width:auto"></a>
    <nav class="main-nav">
      <a href="{depth}index.html" class="{cls('home').strip()}">Home</a>
      <a href="{depth}about.html" class="{cls('about').strip()}">About Us</a>
      <a href="{depth}pricing.html" class="{cls('pricing').strip()}">Pricing</a>
      <div class="nav-drop">
        <span>Pages <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></span>
        <div class="nav-drop-panel">
          <a href="{depth}features.html">Features</a>
          <a href="{depth}elements.html">Elements</a>
          <a href="{depth}career.html">Career</a>
          <a href="{depth}blog.html">Blog</a>
          <a href="{depth}contact.html">Contact</a>
          <a href="{depth}integration.html">Integration</a>
          <a href="{depth}terms-conditions.html">Terms &amp; Conditions</a>
        </div>
      </div>
    </nav>
    <div class="header-actions">
      <div class="lang-switch"><img src="{depth}assets/images/lang/en.png" alt="EN"> EN <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5"/></svg></div>
      <button class="theme-toggle" aria-label="Toggle dark mode">
        <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1111.2 3 7 7 0 0021 12.8z"/></svg>
      </button>
      <a href="{depth}pricing.html" class="btn btn-primary btn-sm">Get Started</a>
      <button class="hamburger" aria-label="Open menu"><span></span></button>
    </div>
  </div>
</header>
<div class="mobile-overlay"></div>
<div class="mobile-panel">
  <div class="mobile-close">&times;</div>
  <a href="{depth}index.html">Home</a>
  <a href="{depth}about.html">About Us</a>
  <a href="{depth}pricing.html">Pricing</a>
  <a href="{depth}features.html">Features</a>
  <a href="{depth}elements.html">Elements</a>
  <a href="{depth}career.html">Career</a>
  <a href="{depth}blog.html">Blog</a>
  <a href="{depth}contact.html">Contact</a>
  <a href="{depth}integration.html">Integration</a>
  <a href="{depth}terms-conditions.html">Terms &amp; Conditions</a>
</div>"""

def footer(depth=""):
    return f"""<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <h3><img src="{depth}assets/images/logo-green.png" alt="Atemp" style="height:32px;width:auto"></h3>
        <p>Make better business decisions with a single, all-in-one platform that helps you plan, engage, and analyse easily.</p>
        <div class="social-row">
          <a href="https://www.facebook.com/" aria-label="Facebook"><img src="{depth}assets/images/svg/icons/fb.svg" width="16" alt=""></a>
          <a href="https://twitter.com/" aria-label="Twitter"><img src="{depth}assets/images/svg/icons/x.svg" width="16" alt=""></a>
          <a href="https://www.github.com/" aria-label="Github"><img src="{depth}assets/images/svg/icons/pinterest.svg" width="16" alt=""></a>
          <a href="https://www.linkedin.com/" aria-label="LinkedIn"><img src="{depth}assets/images/svg/icons/linkedin.svg" width="16" alt=""></a>
        </div>
      </div>
      <div class="footer-offices">
        <div>
          <h4 style="color:#fff">Sydney</h4>
          <p>380 George Street, Sydney NSW 2000, +61 2 9200 6009</p>
        </div>
        <div>
          <h4 style="color:#fff">France</h4>
          <p>65 rue Ernest Renan, Chatillon 92320, +33 4 22 09 99</p>
        </div>
      </div>
    </div>
    <div class="newsletter">
      <div>
        <h4 style="color:#fff;margin-bottom:6px">Subscribe To Our Weekly Newsletter</h4>
        <p style="margin:0;font-size:13px">Join the 1800+ students that use Atemp.</p>
      </div>
      <form onsubmit="return false">
        <input type="email" placeholder="Enter your Email Address" required>
        <button type="submit" class="btn btn-primary btn-sm">Get A Quote</button>
      </form>
    </div>
    <div class="footer-cols">
      <div>
        <h4>Company</h4>
        <ul><li><a href="{depth}about.html">About us</a></li><li><a href="{depth}career.html">Careers</a></li><li><a href="{depth}contact.html">Contact us</a></li><li><a href="{depth}blog.html">Blog</a></li></ul>
      </div>
      <div>
        <h4>Integration</h4>
        <ul><li><a href="{depth}integration/slack.html">Slack</a></li><li><a href="{depth}integration/mailchimp.html">Mailchimp</a></li><li><a href="{depth}integration/stripe.html">Stripe</a></li><li><a href="{depth}integration.html">All integrations</a></li></ul>
      </div>
      <div>
        <h4>Pages</h4>
        <ul><li><a href="{depth}elements.html">Elements</a></li><li><a href="{depth}features.html">Features</a></li><li><a href="{depth}pricing.html">Pricing</a></li><li><a href="{depth}terms-conditions.html">Terms</a></li></ul>
      </div>
      <div>
        <h4>Support</h4>
        <ul><li><a href="{depth}contact.html">Help center</a></li><li><a href="{depth}terms-conditions.html">Payment</a></li><li><a href="{depth}terms-conditions.html">Terms of use</a></li><li><a href="{depth}terms-conditions.html">Privacy</a></li></ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 Your Company / Design and Developed by <a href="https://themefisher.com">ThemeFisher</a></span>
      <span><a href="{depth}terms-conditions.html">Terms &amp; Conditions</a></span>
    </div>
  </div>
</footer>
<script src="{depth}assets/js/main.js"></script>"""

def page(title, desc, body, depth="", active=""):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
{head(title, desc, depth)}
</head>
<body>
{header(depth, active)}
{body}
{footer(depth)}
</body>
</html>"""

def write(path, html):
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(html)
    print("wrote", path)

if __name__ == "__main__":
    print("This module provides shared header/footer/page helpers; pages are built by build_pages.py")
