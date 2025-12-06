let translateButton = null;
let translationBox = null;

// Criar botão de tradução
function createTranslateButton() {
  if (translateButton) return translateButton;

  translateButton = document.createElement("div");
  translateButton.id = "translate-btn-extension";
  translateButton.innerHTML = "🌐";
  translateButton.style.display = "none";
  document.body.appendChild(translateButton);

  translateButton.addEventListener("click", handleTranslate);

  return translateButton;
}

// Criar caixa de tradução
function createTranslationBox() {
  if (translationBox) return translationBox;

  translationBox = document.createElement("div");
  translationBox.id = "translation-box-extension";
  translationBox.style.display = "none";
  document.body.appendChild(translationBox);

  return translationBox;
}

// Detectar idioma do texto
function detectLanguage(text) {
  // Português
  if (/[àáâãçéêíóôõú]/i.test(text)) return "pt";

  // Espanhol
  if (/[ñ¿¡]/i.test(text)) return "es";

  // Francês
  if (/[àâæçéèêëïîôùûü]/i.test(text)) return "fr";

  // Alemão
  if (/[äöüß]/i.test(text)) return "de";

  // Russo
  if (/[а-яА-ЯёЁ]/.test(text)) return "ru";

  // Árabe
  if (/[\u0600-\u06FF]/.test(text)) return "ar";

  // Japonês
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) return "ja";

  // Coreano
  if (/[\uAC00-\uD7AF]/.test(text)) return "ko";

  // Chinês
  if (/[\u4E00-\u9FFF]/.test(text)) return "zh-CN";

  // Padrão: inglês
  return "en";
}

// Traduzir texto usando Google Translate API
async function translateText(text, targetLang) {
  const sourceLang = detectLanguage(text);

  // Se já estiver no idioma alvo, não traduzir
  if (sourceLang === targetLang) {
    return {
      translation: text,
      sourceLang,
      note: "Texto já está no idioma selecionado",
    };
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(
      text
    )}`;

    const response = await fetch(url);
    const data = await response.json();

    let translation = "";
    if (data && data[0]) {
      for (let i = 0; i < data[0].length; i++) {
        if (data[0][i][0]) {
          translation += data[0][i][0];
        }
      }
    }

    return { translation, sourceLang, targetLang };
  } catch (error) {
    console.error("Erro na tradução:", error);
    return { translation: "Erro ao traduzir", sourceLang, targetLang };
  }
}

// Manipular tradução
async function handleTranslate() {
  const selectedText = window.getSelection().toString().trim();
  if (!selectedText) return;

  // Mostrar loading
  const box = createTranslationBox();
  const rect = translateButton.getBoundingClientRect();
  box.style.top = rect.bottom + 5 + "px";
  box.style.left = rect.left + "px";
  box.innerHTML = '<div class="loading">Traduzindo...</div>';
  box.style.display = "block";

  // Obter idioma configurado
  chrome.storage.sync.get(["targetLang"], async (result) => {
    const targetLang = result.targetLang || "pt";

    const {
      translation,
      sourceLang,
      targetLang: tl,
      note,
    } = await translateText(selectedText, targetLang);

    const langNames = {
      pt: "Português",
      en: "Inglês",
      es: "Espanhol",
      fr: "Francês",
      de: "Alemão",
      it: "Italiano",
      ja: "Japonês",
      ko: "Coreano",
      "zh-CN": "Chinês",
      ru: "Russo",
      ar: "Árabe",
    };

    box.innerHTML = `
      <div class="translation-header">
        <span>${langNames[sourceLang] || sourceLang} → ${
      langNames[tl] || tl
    }</span>
        <button class="close-btn" onclick="document.getElementById('translation-box-extension').style.display='none'">✕</button>
      </div>
      <div class="translation-content">
        <div class="original-text">${selectedText}</div>
        <div class="translated-text">${translation}</div>
        ${note ? `<div class="note">${note}</div>` : ""}
      </div>
    `;
  });
}

// Mostrar/ocultar botão ao selecionar texto
document.addEventListener("mouseup", (e) => {
  setTimeout(() => {
    const selectedText = window.getSelection().toString().trim();
    const btn = createTranslateButton();

    if (selectedText.length > 0) {
      const range = window.getSelection().getRangeAt(0);
      const rect = range.getBoundingClientRect();

      btn.style.top = rect.top + window.scrollY - 40 + "px";
      btn.style.left = rect.left + window.scrollX + rect.width / 2 - 20 + "px";
      btn.style.display = "flex";
    } else {
      btn.style.display = "none";
      if (translationBox) {
        translationBox.style.display = "none";
      }
    }
  }, 10);
});

// Ocultar ao clicar fora
document.addEventListener("mousedown", (e) => {
  if (
    translateButton &&
    !translateButton.contains(e.target) &&
    translationBox &&
    !translationBox.contains(e.target)
  ) {
    const selection = window.getSelection();
    if (selection.toString().trim() === "") {
      translateButton.style.display = "none";
      translationBox.style.display = "none";
    }
  }
});

// Inicializar
createTranslateButton();
createTranslationBox();
