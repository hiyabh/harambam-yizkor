// "Add a name" form: gender, live duplicate check, submission states.
import { CONFIG } from "./config.js";
import { findDuplicate, submitName, DuplicateError } from "./data.js";
import { hasLineageWord, cleanForStorage } from "./normalize.js";

const MIN_NAME_LENGTH = 3;
const RATE_WINDOW_MS = 60_000;
const HINTS = {
  m: { placeholder: "לדוגמה: אברהם בן שרה", hint: "שם הנפטר ושם אמו - פלוני בן פלונית", label: "שם הנפטר" },
  f: { placeholder: "לדוגמה: רחל בת לאה", hint: "שם הנפטרת ושם אמה - פלונית בת פלונית", label: "שם הנפטרת" },
};
const MESSAGES = {
  exists: "השם כבר נמצא ברשימה - אין צורך להוסיף שוב.",
  noLineage: (gender) => `שים לב: בדרך כלל כותבים "${gender === "f" ? "פלונית בת פלונית" : "פלוני בן פלונית"}".`,
  tooShort: "יש להזין שם מלא.",
  rateLimited: "נוספו הרבה שמות בזמן קצר. המתן דקה ונסה שוב.",
  network: "השליחה נכשלה - אין חיבור לשרת. בדוק את החיבור לאינטרנט ונסה שוב, או שלח את השם לרב בוואטסאפ.",
  server: (status) => `השליחה נכשלה (שגיאה ${status}). נסה שוב בעוד רגע, או שלח את השם לרב בוואטסאפ.`,
};

function whatsappLink(name, gender) {
  const noun = gender === "f" ? "הנפטרת" : "הנפטר";
  const text = `שלום הרב, בבקשה להוסיף לרשימת הנזכרים את ${noun}: ${name}`;
  return `https://wa.me/${CONFIG.whatsappPhone}?text=${encodeURIComponent(text)}`;
}

export function createAddForm({ root, getEntries, onAdded, sheet }) {
  const form = root.querySelector("#add-form");
  const nameInput = form.querySelector("#add-name");
  const nameLabel = form.querySelector("#add-name-label");
  const hint = form.querySelector("#name-hint");
  const status = form.querySelector("#name-status");
  const byInput = form.querySelector("#add-by");
  const honeypot = form.querySelector("#add-website");
  const submitBtn = form.querySelector("#add-submit");
  const errorBox = form.querySelector("#add-error");
  const successBox = root.querySelector("#add-success");
  const successName = successBox.querySelector("#success-name");
  const submitTimes = [];
  let duplicateFound = false;

  const gender = () => form.querySelector('input[name="gender"]:checked').value;

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = `field-status${kind ? ` is-${kind}` : ""}`;
    status.hidden = !text;
  }

  function showError(message, name) {
    errorBox.hidden = false;
    errorBox.replaceChildren();
    errorBox.append(document.createTextNode(`${message} `));
    const link = document.createElement("a");
    link.href = whatsappLink(name, gender());
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "שלח בוואטסאפ לרב";
    errorBox.append(link);
  }

  function applyGenderHints() {
    const copy = HINTS[gender()];
    nameInput.placeholder = copy.placeholder;
    hint.textContent = copy.hint;
    nameLabel.textContent = copy.label;
    validateLive();
  }

  function validateLive() {
    const value = cleanForStorage(nameInput.value);
    errorBox.hidden = true;
    duplicateFound = Boolean(findDuplicate(getEntries(), value, gender()));
    if (duplicateFound) {
      setStatus(MESSAGES.exists, "success");
      submitBtn.textContent = "השם כבר קיים - סגור";
      return;
    }
    submitBtn.textContent = "הוסף לרשימה";
    if (value.length >= MIN_NAME_LENGTH && !hasLineageWord(value, gender())) {
      setStatus(MESSAGES.noLineage(gender()), "warning");
    } else {
      setStatus("", null);
    }
  }

  function rateLimited() {
    const now = Date.now();
    while (submitTimes.length && now - submitTimes[0] > RATE_WINDOW_MS) submitTimes.shift();
    return submitTimes.length >= CONFIG.maxSubmitsPerMinute;
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.classList.toggle("is-busy", busy);
    nameInput.readOnly = busy;
  }

  function showSuccess(entry) {
    form.hidden = true;
    successBox.hidden = false;
    successName.textContent = entry.name;
    successBox.querySelector("[data-autofocus]")?.focus({ preventScroll: true });
  }

  function resetForm() {
    form.reset();
    form.hidden = false;
    successBox.hidden = true;
    errorBox.hidden = true;
    setBusy(false);
    applyGenderHints();
  }

  async function onSubmit(event) {
    event.preventDefault();
    const name = cleanForStorage(nameInput.value);
    if (duplicateFound) return sheet.close();
    if (name.length < MIN_NAME_LENGTH) return setStatus(MESSAGES.tooShort, "danger");
    if (honeypot.value) return showSuccess({ name });
    if (rateLimited()) return showError(MESSAGES.rateLimited, name);
    setBusy(true);
    try {
      const entry = await submitName({ name, gender: gender(), submittedBy: byInput.value });
      submitTimes.push(Date.now());
      onAdded(entry);
      showSuccess(entry);
    } catch (error) {
      handleSubmitError(error, name);
    } finally {
      setBusy(false);
    }
  }

  function handleSubmitError(error, name) {
    if (error instanceof DuplicateError) {
      duplicateFound = true;
      setStatus(MESSAGES.exists, "success");
      submitBtn.textContent = "השם כבר קיים - סגור";
      return;
    }
    const status = /HTTP (\d+)/.exec(error.message)?.[1];
    showError(status ? MESSAGES.server(status) : MESSAGES.network, name);
  }

  function openWith(prefill = "", presetGender = null) {
    resetForm();
    if (presetGender) form.querySelector(`input[name="gender"][value="${presetGender}"]`).checked = true;
    nameInput.value = prefill;
    applyGenderHints();
    sheet.open();
  }

  form.addEventListener("submit", onSubmit);
  nameInput.addEventListener("input", validateLive);
  form.querySelectorAll('input[name="gender"]').forEach((radio) => radio.addEventListener("change", applyGenderHints));
  successBox.querySelector("#success-another").addEventListener("click", () => openWith("", gender()));
  applyGenderHints();

  return { openWith };
}
