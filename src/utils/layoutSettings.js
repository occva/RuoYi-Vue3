export const LAYOUT_SETTING_STORAGE_KEY = 'layout-setting'
export const LAYOUT_SETTINGS_VERSION = 2

const PERSISTED_LAYOUT_FIELDS = [
  'navType',
  'tagsView',
  'tagsIcon',
  'fixedHeader',
  'sidebarLogo',
  'dynamicTitle',
  'sideTheme',
  'theme'
]

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function parseStoredLayoutSetting() {
  if (!canUseStorage()) {
    return {}
  }

  try {
    const raw = window.localStorage.getItem(LAYOUT_SETTING_STORAGE_KEY)
    if (!raw) {
      return {}
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function migrateLayoutSetting(storedSetting) {
  const nextSetting = { ...storedSetting }

  if (nextSetting.sideTheme === 'theme-dark') {
    nextSetting.sideTheme = 'theme-light'
  }

  nextSetting.layoutSettingsVersion = LAYOUT_SETTINGS_VERSION
  return nextSetting
}

export function loadLayoutSetting() {
  return migrateLayoutSetting(parseStoredLayoutSetting())
}

export function saveLayoutSetting(source) {
  if (!canUseStorage()) {
    return
  }

  const layoutSetting = {
    layoutSettingsVersion: LAYOUT_SETTINGS_VERSION
  }

  PERSISTED_LAYOUT_FIELDS.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(source, field)) {
      layoutSetting[field] = source[field]
    }
  })

  window.localStorage.setItem(LAYOUT_SETTING_STORAGE_KEY, JSON.stringify(layoutSetting))
}

export function resetLayoutSetting() {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.removeItem(LAYOUT_SETTING_STORAGE_KEY)
}
