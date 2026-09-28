function Footer({ cartCount = 0 }) {
  return (
    <footer className="site-footer">
      <div className="">
        <address>
          <ul className="footer__list">
            <li>
              Телефон: <a href="tel">+000 000 000</a>
            </li>
            <li>
                Адрес: улица пупа, дом 67
            </li>
          </ul>
        </address>
      </div>
      <div className="">© 2026 АгроМаркет</div>
    </footer>
  );
}

export default Footer;
