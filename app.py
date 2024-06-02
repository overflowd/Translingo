import os
from flask import Flask, request, jsonify, render_template
from transformers import MarianMTModel, MarianTokenizer

os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"

app = Flask(__name__)


def load_model(src_lang, tgt_lang):
    if src_lang == "en" and tgt_lang == "tr":
        model_name = 'Helsinki-NLP/opus-tatoeba-en-tr'
    elif src_lang == "tr" and tgt_lang == "en":
        model_name = 'Helsinki-NLP/opus-mt-tr-en'
    else:
        return None, None

    tokenizer = MarianTokenizer.from_pretrained(model_name)
    model = MarianMTModel.from_pretrained(model_name)
    return tokenizer, model


def translate(text, src_lang, tgt_lang):
    tokenizer, model = load_model(src_lang, tgt_lang)
    if not tokenizer or not model:
        return "Model not available for the given language pair."

    tokenized_text = tokenizer.prepare_seq2seq_batch([text], return_tensors='pt')
    translated_tokens = model.generate(**tokenized_text)
    translated_text = tokenizer.batch_decode(translated_tokens, skip_special_tokens=True)
    return translated_text[0]


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text', '')
    source_lang = data.get('source_lang', 'en')
    target_lang = data.get('target_lang', 'tr')
    src_lang = source_lang.split('-')[0]
    tgt_lang = target_lang.split('-')[0]
    translated_text = translate(text, src_lang, tgt_lang)
    return jsonify({'translated_text': translated_text})


if __name__ == '__main__':
    app.run(debug=True)
