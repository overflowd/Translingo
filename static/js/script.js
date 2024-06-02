document.addEventListener('DOMContentLoaded', () => {
    const sourceLangSelect = document.getElementById('source-lang-select');
    const targetLangSelect = document.getElementById('target-lang-select');
    const sourceLangSpan = document.getElementById('source-lang');
    const targetLangSpan = document.getElementById('target-lang');
    const translateBtn = document.getElementById('translate-btn');
    const sourceText = document.getElementById('source-text');
    const translatedText = document.getElementById('translated-text');
    const sourceVoiceBtn = document.getElementById('source-voice-btn');
    const targetVoiceBtn = document.getElementById('target-voice-btn');

    sourceLangSelect.addEventListener('change', () => {
        sourceLangSpan.textContent = sourceLangSelect.value;
        updateTargetLangOptions();
        checkLangSelection();
    });

    targetLangSelect.addEventListener('change', () => {
        targetLangSpan.textContent = targetLangSelect.value;
        checkLangSelection();
    });

    translateBtn.addEventListener('click', async () => {

        if (!checkLangSelection()) {
            alert("Source language and target language cannot be the same.");
            return;
        }

        const text = sourceText.value;
        const sourceLang = sourceLangSelect.value;
        const targetLang = targetLangSelect.value;

        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang })
        });

        const data = await response.json();
        translatedText.value = data.translated_text;
    });

    function checkLangSelection() {
        const sourceLang = sourceLangSelect.value;
        const targetLang = targetLangSelect.value;
        if (sourceLang === targetLang) {
            translateBtn.disabled = true;
            return false;
        } else {
            translateBtn.disabled = false;
            return true;
        }
    }

    function updateTargetLangOptions() {
        const sourceLang = sourceLangSelect.value;
        const options = targetLangSelect.options;
        let firstValidOption = null;

        for (let i = 0; i < options.length; i++) {
            if (options[i].value === sourceLang) {
                options[i].style.display = 'none';
            } else {
                options[i].style.display = 'block';
                if (firstValidOption === null) {
                    firstValidOption = options[i].value;
                }
            }
        }

        if (targetLangSelect.value === sourceLang || targetLangSelect.value === "") {
            targetLangSelect.value = firstValidOption;
            targetLangSpan.textContent = firstValidOption;
        }
    }

    updateTargetLangOptions();

    sourceVoiceBtn.addEventListener('click', () => {
        const text = sourceText.value;
        const sourceLang = sourceLangSelect.value;
        speakText(text, sourceLang);
    });

    targetVoiceBtn.addEventListener('click', () => {
        const text = translatedText.value;
        const targetLang = targetLangSelect.value;
        speakText(text, targetLang);
    });

    function speakText(text, lang) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        window.speechSynthesis.speak(utterance);
    }
});
