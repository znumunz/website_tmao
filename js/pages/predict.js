'use strict';

function initAssessmentPage() {
  const submitButton = document.getElementById('assessment-submit');
  if (!submitButton) return;

  const submitLabel = submitButton.textContent;

  function calcBMI() {
    const display = document.getElementById('bmi-display');
    if (display) {
      display.textContent = AppAssessmentService.calculateBmiText($('#p-weight')?.value, $('#p-height')?.value);
    }
  }

  function validateForm() {
    const result = AppAssessmentService.validateForm({
      age: $('#p-age')?.value,
      sex: $('#p-sex')?.value,
      weight: $('#p-weight')?.value,
      height: $('#p-height')?.value,
      sbp: $('#v-sbp')?.value,
      dbp: $('#v-dbp')?.value,
      tmao: $('#l-tmao')?.value,
    });

    if (!result.ok) {
      alert(result.message);
      return false;
    }

    return true;
  }

  submitButton.addEventListener('click', () => {
    if (!validateForm()) return;
    submitButton.textContent = '⏳ กำลังประเมิน...';
    submitButton.disabled = true;
    window.setTimeout(() => {
      submitButton.textContent = submitLabel;
      submitButton.disabled = false;
      AppRouter.navigate('results');
    }, 1500);
  });

  ['#p-weight', '#p-height'].forEach(selector => {
    document.querySelector(selector)?.addEventListener('input', calcBMI);
  });
}

document.addEventListener('DOMContentLoaded', initAssessmentPage);

