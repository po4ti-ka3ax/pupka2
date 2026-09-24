import "./App.css";

function App() {
  return (
    <>
      <header>
        <h1 className="main__title">Личная страничка</h1>
      </header>
      <nav>
        <ul className="nav__list">
          <li><a href="#about">Обо мне</a></li>
          <li><a href="#social">Социальные сети</a></li>
        </ul>
      </nav>
      <main>
        <section id="#about">
          <h2>Обо мне</h2>
          <div className="grid__cards">
            <div className="grid__card">
              <p>Клиптомания</p>
            </div>
            <div className="grid__card">
              <p>Лудомания</p>
            </div>
            <div className="grid__card">
              <p>Очернение</p>
            </div>
          </div>
        </section>
        <div id="social" className="">
          <h2>Социальные сети</h2>
          <div className="social__cards">
            <div className="social__card">
              <a href="https://youtu.be/boMaTNuYTyg">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Instagram_logo_2016.svg/120px-Instagram_logo_2016.svg.png?utm_source=commons.wikimedia.org&utm_campaign=parser&utm_content=thumbnail" alt="" />
              </a>
            </div>
            <div className="social__card">
              <a href="https://youtu.be/boMaTNuYTyg">
              <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/%D0%9B%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF_MAX.svg/250px-%D0%9B%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF_MAX.svg.png?utm_source=commons.wikimedia.org&utm_campaign=parser&utm_content=thumbnail" alt="" />
              </a>
            </div>
            <div className="social__card">
              <a href="https://youtu.be/boMaTNuYTyg">
              <img src="https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/GitHub_Invertocat_Logo.svg/330px-GitHub_Invertocat_Logo.svg.png?utm_source=ru.wikipedia.org&utm_campaign=index&utm_content=thumbnail" alt="" />
              </a>
            </div>
            
          </div>
        </div>
      </main>
      
      <footer>
        <div className="footer__box">
          <p>все <a href="http://pornhub.com/">права</a> сто пудов защищены (с) </p>
        </div>
      </footer>
    </>
  );
}

export default App;
