function ContactForm() {
  const API_URL = "http://localhost:3000/api";
  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target; // не перезагружать страницу
    const data = Object.fromEntries(new FormData(form)); // очистить поля
    console.log(data)
    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        // статус не 2xx (например, 400)
        alert("Ошибка: " + result.error);
        return;
      }
      alert(`Заявка №${result.id} принята!`);
      form.reset();
    } catch (err) {
      // сервер выключен или недоступен
      alert("Сервер недоступен. Запущен ли agromarket-server?");
    }
  }

  return (
    <section id="contact" className="contact">
      <h2>Оптовая заявка</h2>

      <form className="contact-form" onSubmit={handleSubmit}>
        <label htmlFor="name">Имя / организация</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="farmer@mail.kz"
        />

        {/* ЗАДАНИЕ: поле телефона — type="tel", placeholder "+7 7XX XXX XX XX" */}
        <input type="tel" placeholder="+7 7XX XXX XX XX" name="phone" id="" />
        {/* ЗАДАНИЕ: объём заказа в кг — type="number", min="10", required */}
        <input type="number" min="10" required name="quantity" id="" />
        {/* ЗАДАНИЕ: желаемая дата доставки — type="date" */}
        <input type="date" name="date"/>
        <label htmlFor="comment">Комментарий</label>
        <textarea id="comment" name="comment" rows="4" />

        <button type="submit">Отправить заявку</button>
      </form>
    </section>
  );
}

export default ContactForm;
