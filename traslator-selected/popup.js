// Carregar configurações salvas
chrome.storage.sync.get(["targetLang"], (result) => {
  if (result.targetLang) {
    document.getElementById("targetLang").value = result.targetLang;
  }
});

// Salvar configurações
document.getElementById("saveBtn").addEventListener("click", () => {
  const targetLang = document.getElementById("targetLang").value;

  chrome.storage.sync.set({ targetLang }, () => {
    const status = document.getElementById("status");
    status.textContent = "✓ Configurações salvas com sucesso!";
    status.className = "status success";
    status.style.display = "block";

    setTimeout(() => {
      status.style.display = "none";
    }, 2000);
  });
});
