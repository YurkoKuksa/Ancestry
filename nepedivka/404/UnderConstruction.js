export class UnderConstructionCard extends HTMLElement {
  connectedCallback() {
    // Отримуємо кастомний атрибут для посилання "Назад" (за замовчуванням '../index.html')
    const backUrl = this.getAttribute("back-url") || "../index.html";
    const backText = this.getAttribute("back-text") || "Повернутися на головну";

    // Створюємо Shadow DOM, щоб стилі шаблону не конфліктували зі сторінкою
    const shadow = this.attachShadow({ mode: "open" });

    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f8f6f0;
          color: #2c2c2c;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Georgia, serif;
          padding: 20px;
          box-sizing: border-box;
        }

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .placeholder-card {
          background: #ffffff;
          border: 1px solid #e2ddd0;
          border-radius: 12px;
          max-width: 520px;
          width: 100%;
          padding: 40px 30px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .icon-wrapper {
          font-size: 3rem;
          margin-bottom: 20px;
          line-height: 1;
        }

        h1 {
          font-family: Georgia, serif;
          font-size: 1.8rem;
          color: #1a1a1a;
          margin-bottom: 12px;
        }

        p {
          font-size: 1rem;
          color: #666;
          line-height: 1.5;
          margin-bottom: 28px;
        }

        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background-color: #8b0000;
          color: #ffffff;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
          border-radius: 6px;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .btn-back:hover {
          background-color: #6a0000;
          transform: translateY(-2px);
        }

        .btn-back::before {
          content: "←";
          font-size: 1.1rem;
        }
      </style>

      <div class="placeholder-card">
        <div class="icon-wrapper">📜</div>
        <h1>Розділ у розробці</h1>
        <p>
          Матеріали та метричні записи для цієї родини наразі опрацьовуються й
          систематизуються. Сторінка стане доступною найближчим часом.
        </p>
        <a href="${backUrl}" class="btn-back">${backText}</a>
      </div>
    `;
  }
}

// Реєструємо веб-компонент
customElements.define("under-construction-card", UnderConstructionCard);
