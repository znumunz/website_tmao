'use strict';

window.AppAssessmentService = {
  calculateBmiText(weight, heightCm) {
    const weightValue = Number(weight);
    const heightValue = Number(heightCm);

    if (!weightValue || !heightValue) return '';
    const bmi = weightValue / ((heightValue / 100) ** 2);
    return `BMI = ${bmi.toFixed(1)} kg/m²`;
  },

  validateForm(fields) {
    const age = Number(fields.age);
    const sex = String(fields.sex || '');
    const weight = Number(fields.weight);
    const height = Number(fields.height);
    const sbp = Number(fields.sbp);
    const dbp = Number(fields.dbp);
    const tmao = Number(fields.tmao);

    if (!age || age < 18 || age > 120) return { ok: false, message: 'กรุณากรอกอายุที่ถูกต้อง (18–120 ปี)' };
    if (!sex) return { ok: false, message: 'กรุณาเลือกเพศ' };
    if (!weight || weight < 20 || weight > 300) return { ok: false, message: 'กรุณากรอกน้ำหนักที่ถูกต้อง' };
    if (!height || height < 100 || height > 250) return { ok: false, message: 'กรุณากรอกส่วนสูงที่ถูกต้อง' };
    if (!sbp || sbp < 60 || sbp > 300) return { ok: false, message: 'กรุณากรอกค่า Systolic ที่ถูกต้อง' };
    if (!dbp || dbp < 40 || dbp > 200) return { ok: false, message: 'กรุณากรอกค่า Diastolic ที่ถูกต้อง' };
    if (Number.isNaN(tmao) || tmao < 0 || tmao > 100) return { ok: false, message: 'กรุณากรอกค่า TMAO (μmol/L)' };

    return { ok: true };
  },
};

