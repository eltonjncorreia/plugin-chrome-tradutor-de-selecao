// Configurações padrão ao instalar
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ targetLang: "pt" });

  console.log("Extensão Tradutor de Seleção instalada com sucesso!");
});
