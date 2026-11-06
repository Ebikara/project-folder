/**
 * CalorieCraft - Client-Side Nutrition & Macro Tracker
 * Pure Vanilla JavaScript with LocalStorage Persistence
 * Strictly no backend, no Tailwind, no CSS variables
 */

(() => {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_LOGS = 'caloriecraft_logs_v1';
  const STORAGE_KEY_SETTINGS = 'caloriecraft_settings_v1';

  // Default Settings
  const DEFAULT_SETTINGS = {
    calorieGoal: 2000,
    proteinGoal: 130,
    carbsGoal: 220,
    fatGoal: 65
  };

  // Quick Preset Foods
  const QUICK_FOODS = [
    { name: 'Oatmeal & Berries', meal: 'breakfast', calories: 280, protein: 10, carbs: 48, fat: 5 },
    { name: '2 Eggs & Toast', meal: 'breakfast', calories: 290, protein: 16, carbs: 24, fat: 14 },
    { name: 'Chicken & Brown Rice', meal: 'lunch', calories: 460, protein: 42, carbs: 48, fat: 9 },
    { name: 'Greek Salad & Tuna', meal: 'lunch', calories: 350, protein: 32, carbs: 12, fat: 18 },
    { name: 'Salmon & Veggies', meal: 'dinner', calories: 510, protein: 38, carbs: 18, fat: 31 },
    { name: 'Protein Shake & Banana', meal: 'snacks', calories: 230, protein: 26, carbs: 28, fat: 2 },
    { name: 'Greek Yogurt & Honey', meal: 'snacks', calories: 170, protein: 15, carbs: 19, fat: 3 },
    { name: 'Handful of Almonds', meal: 'snacks', calories: 160, protein: 6, carbs: 6, fat: 14 }
  ];

  // Application State
  let currentDate = getTodayDateString();
  let settings = loadSettings();
  let logs = loadLogs();

  // DOM Elements
  const datePicker = document.getElementById('date-picker');
  const dateFullText = document.getElementById('date-full-text');
  const dateRelative = document.getElementById('date-relative');
  const dateLabelGroup = document.getElementById('date-label-group');
  const prevDayBtn = document.getElementById('prev-day-btn');
  const nextDayBtn = document.getElementById('next-day-btn');
  const todayBtn = document.getElementById('today-btn');

  // Summary Elements
  const caloriesConsumedEl = document.getElementById('calories-consumed');
  const caloriesGoalEl = document.getElementById('calories-goal');
  const caloriesDiffContainer = document.getElementById('calories-diff-container');
  const calorieProgressFill = document.getElementById('calorie-progress-fill');
  const caloriePercentLabel = document.getElementById('calorie-percent-label');
  const calorieMaxLabel = document.getElementById('calorie-max-label');
  const statusPill = document.getElementById('status-pill');

  // Macros Elements
  const macroProteinConsumed = document.getElementById('macro-protein-consumed');
  const macroProteinGoal = document.getElementById('macro-protein-goal');
  const macroProteinBar = document.getElementById('macro-protein-bar');
  const macroProteinPercent = document.getElementById('macro-protein-percent');

  const macroCarbsConsumed = document.getElementById('macro-carbs-consumed');
  const macroCarbsGoal = document.getElementById('macro-carbs-goal');
  const macroCarbsBar = document.getElementById('macro-carbs-bar');
  const macroCarbsPercent = document.getElementById('macro-carbs-percent');

  const macroFatConsumed = document.getElementById('macro-fat-consumed');
  const macroFatGoal = document.getElementById('macro-fat-goal');
  const macroFatBar = document.getElementById('macro-fat-bar');
  const macroFatPercent = document.getElementById('macro-fat-percent');

  // Meal Lists & Subtotals
  const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snacks'];
  const mealLists = {
    breakfast: document.getElementById('list-breakfast'),
    lunch: document.getElementById('list-lunch'),
    dinner: document.getElementById('list-dinner'),
    snacks: document.getElementById('list-snacks')
  };
  const mealSubtotals = {
    breakfast: document.getElementById('subtotal-breakfast'),
    lunch: document.getElementById('subtotal-lunch'),
    dinner: document.getElementById('subtotal-dinner'),
    snacks: document.getElementById('subtotal-snacks')
  };

  // Form Elements
  const foodForm = document.getElementById('food-form');
  const foodMealInput = document.getElementById('food-meal');
  const foodNameInput = document.getElementById('food-name');
  const foodCaloriesInput = document.getElementById('food-calories');
  const foodProteinInput = document.getElementById('food-protein');
  const foodCarbsInput = document.getElementById('food-carbs');
  const foodFatInput = document.getElementById('food-fat');
  const formError = document.getElementById('form-error');

  // Quick Add Container
  const quickItemsContainer = document.getElementById('quick-items-container');

  // Settings Modal
  const settingsModal = document.getElementById('settings-modal');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const cancelSettingsBtn = document.getElementById('cancel-settings-btn');
  const settingsForm = document.getElementById('settings-form');
  const settingCalGoal = document.getElementById('setting-cal-goal');
  const settingProteinGoal = document.getElementById('setting-protein-goal');
  const settingCarbsGoal = document.getElementById('setting-carbs-goal');
  const settingFatGoal = document.getElementById('setting-fat-goal');
  const calculatedMacroCal = document.getElementById('calculated-macro-cal');

  // Utility Actions
  const clearDayBtn = document.getElementById('clear-day-btn');
  const exportJsonBtn = document.getElementById('export-json-btn');
  const importJsonInput = document.getElementById('import-json-input');
  const resetAllDataBtn = document.getElementById('reset-all-data-btn');
  const toast = document.getElementById('toast');

  /* ==========================================================================
     Storage & State Handlers
     ========================================================================== */

  function loadSettings() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.error('Failed to parse settings from localStorage', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  function saveSettings(newSettings) {
    settings = { ...newSettings };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }

  function loadLogs() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOGS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse logs from localStorage', e);
    }
    return {};
  }

  function saveLogs() {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  }

  function getDayEntries(dateStr) {
    return logs[dateStr] || [];
  }

  /* ==========================================================================
     Date Helpers
     ========================================================================== */

  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatDateFriendly(dateStr) {
    const parts = dateStr.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);

    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }

  function getRelativeDateLabel(dateStr) {
    const todayStr = getTodayDateString();
    if (dateStr === todayStr) return 'Today';

    const parts = dateStr.split('-');
    const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);

    const todayParts = todayStr.split('-');
    const todayDate = new Date(todayParts[0], todayParts[1] - 1, todayParts[2]);

    const diffDays = Math.round((targetDate - todayDate) / (1000 * 60 * 60 * 24));
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    return '';
  }

  function shiftDate(dateStr, offsetDays) {
    const parts = dateStr.split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + offsetDays);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function updateDateDisplay() {
    datePicker.value = currentDate;
    dateFullText.textContent = formatDateFriendly(currentDate);

    const relLabel = getRelativeDateLabel(currentDate);
    if (relLabel) {
      dateRelative.style.display = 'inline-block';
      dateRelative.textContent = relLabel;
    } else {
      dateRelative.style.display = 'none';
    }
  }

  /* ==========================================================================
     UI Rendering
     ========================================================================== */

  function render() {
    updateDateDisplay();

    const entries = getDayEntries(currentDate);

    // Calculate totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealsData = {
      breakfast: { items: [], calories: 0 },
      lunch: { items: [], calories: 0 },
      dinner: { items: [], calories: 0 },
      snacks: { items: [], calories: 0 }
    };

    entries.forEach(item => {
      const cal = Number(item.calories) || 0;
      const pro = Number(item.protein) || 0;
      const carb = Number(item.carbs) || 0;
      const fat = Number(item.fat) || 0;

      totalCalories += cal;
      totalProtein += pro;
      totalCarbs += carb;
      totalFat += fat;

      const mType = (item.meal || 'snacks').toLowerCase();
      if (mealsData[mType]) {
        mealsData[mType].items.push(item);
        mealsData[mType].calories += cal;
      }
    });

    // Update Calorie Display
    caloriesConsumedEl.textContent = formatNumber(totalCalories);
    caloriesGoalEl.textContent = formatNumber(settings.calorieGoal);
    calorieMaxLabel.textContent = `${formatNumber(settings.calorieGoal)} kcal`;

    const calDiff = settings.calorieGoal - totalCalories;
    if (calDiff >= 0) {
      caloriesDiffContainer.innerHTML = `<strong>${formatNumber(calDiff)}</strong> kcal remaining`;
    } else {
      caloriesDiffContainer.innerHTML = `<span style="color: #ef4444; font-weight: 700;">+${formatNumber(Math.abs(calDiff))} kcal over goal</span>`;
    }

    // Progress bar fill and color
    const calPct = settings.calorieGoal > 0 ? Math.round((totalCalories / settings.calorieGoal) * 100) : 0;
    const progressFillPct = Math.min(100, Math.max(0, calPct));
    calorieProgressFill.style.width = `${progressFillPct}%`;
    caloriePercentLabel.textContent = `${calPct}%`;

    // Reset progress fill classes
    calorieProgressFill.classList.remove('warning', 'danger');
    statusPill.classList.remove('status-pill-success', 'status-pill-warning', 'status-pill-danger');

    if (totalCalories > settings.calorieGoal) {
      calorieProgressFill.classList.add('danger');
      statusPill.classList.add('status-pill-danger');
      statusPill.textContent = 'Exceeded';
    } else if (calPct >= 85) {
      calorieProgressFill.classList.add('warning');
      statusPill.classList.add('status-pill-warning');
      statusPill.textContent = 'Near Goal';
    } else {
      statusPill.classList.add('status-pill-success');
      statusPill.textContent = 'On Track';
    }

    // Macros Rendering
    renderMacroBox(
      totalProtein,
      settings.proteinGoal,
      macroProteinConsumed,
      macroProteinGoal,
      macroProteinBar,
      macroProteinPercent
    );

    renderMacroBox(
      totalCarbs,
      settings.carbsGoal,
      macroCarbsConsumed,
      macroCarbsGoal,
      macroCarbsBar,
      macroCarbsPercent
    );

    renderMacroBox(
      totalFat,
      settings.fatGoal,
      macroFatConsumed,
      macroFatGoal,
      macroFatBar,
      macroFatPercent
    );

    // Render Meals Lists
    MEAL_TYPES.forEach(type => {
      const container = mealLists[type];
      const subtotalEl = mealSubtotals[type];
      const data = mealsData[type];

      subtotalEl.textContent = `${formatNumber(data.calories)} kcal`;

      if (data.items.length === 0) {
        container.innerHTML = `<div class="empty-meal-state">No ${type} items logged.</div>`;
      } else {
        container.innerHTML = '';
        data.items.forEach(item => {
          const itemCard = createEntryElement(item);
          container.appendChild(itemCard);
        });
      }
    });
  }

  function renderMacroBox(consumed, goal, consumedEl, goalEl, barEl, percentEl) {
    consumedEl.textContent = roundToOneDec(consumed);
    goalEl.textContent = goal;
    const pct = goal > 0 ? Math.round((consumed / goal) * 100) : 0;
    barEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
    percentEl.textContent = `${pct}%`;
  }

  function createEntryElement(item) {
    const div = document.createElement('div');
    div.className = 'food-entry-item';
    div.dataset.id = item.id;

    const pro = item.protein !== undefined && item.protein !== '' ? Number(item.protein) : 0;
    const carb = item.carbs !== undefined && item.carbs !== '' ? Number(item.carbs) : 0;
    const fat = item.fat !== undefined && item.fat !== '' ? Number(item.fat) : 0;

    div.innerHTML = `
      <div class="entry-info">
        <span class="entry-title">${escapeHtml(item.name)}</span>
        <div class="entry-macros">
          <span class="macro-tag-p">P: ${pro}g</span>
          <span class="macro-tag-c">C: ${carb}g</span>
          <span class="macro-tag-f">F: ${fat}g</span>
        </div>
      </div>
      <div class="entry-actions">
        <span class="entry-calories">${formatNumber(item.calories)} kcal</span>
        <button class="delete-entry-btn" title="Delete entry" data-action="delete" data-id="${item.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;

    return div;
  }

  function renderQuickFoods() {
    quickItemsContainer.innerHTML = '';
    QUICK_FOODS.forEach(preset => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quick-chip';
      btn.innerHTML = `
        <span class="quick-chip-title">${escapeHtml(preset.name)}</span>
        <span class="quick-chip-desc">${preset.calories} kcal • P:${preset.protein}g C:${preset.carbs}g F:${preset.fat}g</span>
      `;
      btn.addEventListener('click', () => {
        addFoodItem({
          name: preset.name,
          meal: preset.meal,
          calories: preset.calories,
          protein: preset.protein,
          carbs: preset.carbs,
          fat: preset.fat
        });
        showToast(`Added ${preset.name} to ${capitalize(preset.meal)}`);
      });
      quickItemsContainer.appendChild(btn);
    });
  }

  /* ==========================================================================
     Food Operations
     ========================================================================== */

  function addFoodItem(itemData) {
    if (!logs[currentDate]) {
      logs[currentDate] = [];
    }

    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      name: itemData.name.trim(),
      meal: itemData.meal || 'lunch',
      calories: Math.max(0, Math.round(Number(itemData.calories) || 0)),
      protein: Math.max(0, roundToOneDec(Number(itemData.protein) || 0)),
      carbs: Math.max(0, roundToOneDec(Number(itemData.carbs) || 0)),
      fat: Math.max(0, roundToOneDec(Number(itemData.fat) || 0)),
      timestamp: new Date().toISOString()
    };

    logs[currentDate].push(newEntry);
    saveLogs();
    render();
  }

  function deleteFoodItem(entryId) {
    if (!logs[currentDate]) return;
    logs[currentDate] = logs[currentDate].filter(item => item.id !== entryId);
    saveLogs();
    render();
    showToast('Entry removed');
  }

  function clearDayEntries() {
    if (!logs[currentDate] || logs[currentDate].length === 0) {
      showToast('No entries to clear today');
      return;
    }

    const confirmClear = window.confirm(`Are you sure you want to delete all entries for ${formatDateFriendly(currentDate)}?`);
    if (confirmClear) {
      delete logs[currentDate];
      saveLogs();
      render();
      showToast('Cleared all entries for selected date');
    }
  }

  /* ==========================================================================
     Event Handlers
     ========================================================================== */

  // Form Submission
  foodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    formError.textContent = '';

    const name = foodNameInput.value.trim();
    const caloriesVal = foodCaloriesInput.value.trim();

    if (!name) {
      formError.textContent = 'Please enter a food name.';
      foodNameInput.focus();
      return;
    }

    if (caloriesVal === '' || isNaN(caloriesVal) || Number(caloriesVal) < 0) {
      formError.textContent = 'Please enter valid calories (0 or more).';
      foodCaloriesInput.focus();
      return;
    }

    addFoodItem({
      meal: foodMealInput.value,
      name: name,
      calories: caloriesVal,
      protein: foodProteinInput.value,
      carbs: foodCarbsInput.value,
      fat: foodFatInput.value
    });

    // Reset Form
    foodNameInput.value = '';
    foodCaloriesInput.value = '';
    foodProteinInput.value = '';
    foodCarbsInput.value = '';
    foodFatInput.value = '';
    foodNameInput.focus();

    showToast(`Logged "${name}" successfully`);
  });

  // Delegated Meal Item Deletion
  document.querySelector('.meals-feed').addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('button[data-action="delete"]');
    if (deleteBtn) {
      const entryId = deleteBtn.dataset.id;
      if (entryId) {
        deleteFoodItem(entryId);
      }
    }
  });

  // Date Navigation
  dateLabelGroup.addEventListener('click', () => {
    if (typeof datePicker.showPicker === 'function') {
      datePicker.showPicker();
    } else {
      datePicker.focus();
    }
  });

  datePicker.addEventListener('change', (e) => {
    if (e.target.value) {
      currentDate = e.target.value;
      render();
    }
  });

  prevDayBtn.addEventListener('click', () => {
    currentDate = shiftDate(currentDate, -1);
    render();
  });

  nextDayBtn.addEventListener('click', () => {
    currentDate = shiftDate(currentDate, 1);
    render();
  });

  todayBtn.addEventListener('click', () => {
    currentDate = getTodayDateString();
    render();
  });

  clearDayBtn.addEventListener('click', clearDayEntries);

  // Settings Modal Open / Close
  function openModal() {
    settingCalGoal.value = settings.calorieGoal;
    settingProteinGoal.value = settings.proteinGoal;
    settingCarbsGoal.value = settings.carbsGoal;
    settingFatGoal.value = settings.fatGoal;
    updateModalCalculatedCalories();
    settingsModal.classList.add('active');
  }

  function closeModal() {
    settingsModal.classList.remove('active');
  }

  openSettingsBtn.addEventListener('click', openModal);
  closeSettingsBtn.addEventListener('click', closeModal);
  cancelSettingsBtn.addEventListener('click', closeModal);

  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      closeModal();
    }
  });

  // Calculate live macro calories in settings modal
  function updateModalCalculatedCalories() {
    const p = Number(settingProteinGoal.value) || 0;
    const c = Number(settingCarbsGoal.value) || 0;
    const f = Number(settingFatGoal.value) || 0;
    const calculated = (p * 4) + (c * 4) + (f * 9);
    calculatedMacroCal.textContent = formatNumber(calculated);
  }

  settingProteinGoal.addEventListener('input', updateModalCalculatedCalories);
  settingCarbsGoal.addEventListener('input', updateModalCalculatedCalories);
  settingFatGoal.addEventListener('input', updateModalCalculatedCalories);

  // Settings Form Save
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const newCal = parseInt(settingCalGoal.value, 10);
    const newP = parseInt(settingProteinGoal.value, 10);
    const newC = parseInt(settingCarbsGoal.value, 10);
    const newF = parseInt(settingFatGoal.value, 10);

    if (isNaN(newCal) || newCal < 100) {
      alert('Please enter a valid calorie target.');
      return;
    }

    saveSettings({
      calorieGoal: newCal,
      proteinGoal: Math.max(0, newP || 0),
      carbsGoal: Math.max(0, newC || 0),
      fatGoal: Math.max(0, newF || 0)
    });

    closeModal();
    render();
    showToast('Daily targets updated!');
  });

  // Data Export / Backup
  exportJsonBtn.addEventListener('click', () => {
    const exportBundle = {
      app: 'CalorieCraft',
      version: 1,
      exportedAt: new Date().toISOString(),
      settings: settings,
      logs: logs
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `caloriecraft-backup-${getTodayDateString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    showToast('Data exported successfully');
  });

  // Data Import
  importJsonInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target.result);
        if (importedData && typeof importedData.logs === 'object') {
          logs = { ...logs, ...importedData.logs };
          if (importedData.settings) {
            settings = { ...DEFAULT_SETTINGS, ...importedData.settings };
            saveSettings(settings);
          }
          saveLogs();
          render();
          closeModal();
          showToast('Backup restored successfully!');
        } else {
          alert('Invalid file format. Please upload a valid CalorieCraft JSON backup.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
      importJsonInput.value = '';
    };
    reader.readAsText(file);
  });

  // Reset All Application Data
  resetAllDataBtn.addEventListener('click', () => {
    const confirmed = window.confirm('WARNING: This will permanently erase all saved foods and restore default settings. Do you wish to proceed?');
    if (confirmed) {
      localStorage.removeItem(STORAGE_KEY_LOGS);
      localStorage.removeItem(STORAGE_KEY_SETTINGS);
      settings = { ...DEFAULT_SETTINGS };
      logs = {};
      render();
      closeModal();
      showToast('All data has been reset');
    }
  });

  /* ==========================================================================
     Utility Helpers
     ========================================================================== */

  function formatNumber(num) {
    return Number(num || 0).toLocaleString();
  }

  function roundToOneDec(num) {
    return Math.round((num + Number.EPSILON) * 10) / 10;
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function escapeHtml(str) {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  }

  let toastTimeout = null;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  // Initial Sample Seed (if first time ever visiting)
  function seedInitialDemoData() {
    if (!localStorage.getItem(STORAGE_KEY_LOGS)) {
      const today = getTodayDateString();
      logs[today] = [
        {
          id: 'demo_1',
          meal: 'breakfast',
          name: 'Greek Yogurt & Blueberries',
          calories: 220,
          protein: 17,
          carbs: 26,
          fat: 4,
          timestamp: new Date().toISOString()
        },
        {
          id: 'demo_2',
          meal: 'lunch',
          name: 'Grilled Chicken & Quinoa Bowl',
          calories: 520,
          protein: 44,
          carbs: 48,
          fat: 14,
          timestamp: new Date().toISOString()
        }
      ];
      saveLogs();
    }
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */
  function init() {
    seedInitialDemoData();
    renderQuickFoods();
    render();
  }

  // Boot app
  init();
})();

