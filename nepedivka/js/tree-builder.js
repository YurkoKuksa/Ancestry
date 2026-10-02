document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("../data/people.json");
    const peopleData = await response.json();

    document.querySelectorAll(".person[data-person-id]").forEach((el) => {
      const personId = el.getAttribute("data-person-id");
      const person = peopleData[personId];

      if (!person) {
        console.warn(`Персону з ID "${personId}" не знайдено в people.json`);
        return;
      }

      // Додаємо базовий гендерний клас
      el.classList.add(person.gender);

      // Якщо особа гіпотетична — додаємо клас hypo
      if (person.isHypo) {
        el.classList.add("hypo");
      }

      // Формуємо верстку всередині
      let contentHTML = `<div class="name">${person.name}</div>`;
      if (person.dates)
        contentHTML += `<div class="dates">${person.dates}</div>`;
      if (person.note) contentHTML += `<div class="note">${person.note}</div>`;

      // Якщо є посилання (наприклад, окреме дерево Непедівки)
      if (person.url) {
        el.classList.add("person-link");
        el.innerHTML = `
          <a href="${person.url}" target="_blank" rel="noopener noreferrer" class="person-card-link">
            ${contentHTML}
          </a>`;
      } else {
        el.innerHTML = contentHTML;
      }
    });

    // Підставляємо дати вінчання
    document
      .querySelectorAll(".couple[data-union-date]")
      .forEach((coupleEl) => {
        const unionDate = coupleEl.getAttribute("data-union-date");
        const malePerson = coupleEl.querySelector(".person.male");

        if (malePerson && unionDate) {
          malePerson.insertAdjacentHTML(
            "afterend",
            `<div class="union">${unionDate}</div>`,
          );
        }
      });
  } catch (error) {
    console.error("Помилка завантаження даних родоводу:", error);
  }
});
