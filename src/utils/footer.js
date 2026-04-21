import { isExternal } from '@/utils/validate'

const DEFAULT_FOOTER_CONFIG = Object.freeze({
  brandName: '社团中心',
  brandTag: 'Campus Clubs',
  description: '发现、加入并领导符合你兴趣的社团组织，让大学生活更精彩',
  wechatQrUrl: '',
  qqQrUrl: '',
  email: '',
  groups: [
    {
      key: 'explore',
      title: '探索',
      links: [
        { label: '首页', url: '/user/home', newTab: false },
        { label: '全部社团', url: '/user/clubs', newTab: false },
        { label: '校园活动', url: '/user/activities', newTab: false }
      ]
    },
    {
      key: 'mine',
      title: '我的',
      links: [
        { label: '我的社团', url: '/user/my-clubs', newTab: false },
        { label: '我的申请', url: '/user/my-clubs?tab=applications', newTab: false },
        { label: '活动记录', url: '/user/my-clubs?tab=activities', newTab: false }
      ]
    },
    {
      key: 'help',
      title: '帮助',
      links: [
        { label: '常见问题', url: '#', newTab: false },
        { label: '联系客服', url: '#', newTab: false },
        { label: '意见反馈', url: '#', newTab: false }
      ]
    }
  ],
  copyrightText: '让校园生活更精彩'
})

function deepClone(data) {
  return JSON.parse(JSON.stringify(data))
}

function trimText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function createDefaultFooterConfig() {
  return deepClone(DEFAULT_FOOTER_CONFIG)
}

export function normalizeFooterConfig(rawConfig = {}) {
  const defaults = createDefaultFooterConfig()
  const rawGroups = Array.isArray(rawConfig.groups) ? rawConfig.groups : []

  return {
    brandName: trimText(rawConfig.brandName) || defaults.brandName,
    brandTag: trimText(rawConfig.brandTag) || defaults.brandTag,
    description: trimText(rawConfig.description) || defaults.description,
    wechatQrUrl: trimText(rawConfig.wechatQrUrl),
    qqQrUrl: trimText(rawConfig.qqQrUrl),
    email: trimText(rawConfig.email),
    groups: defaults.groups.map((group, groupIndex) => {
      const rawGroup = rawGroups[groupIndex] || {}
      const rawLinks = Array.isArray(rawGroup.links) ? rawGroup.links : []
      return {
        key: group.key,
        title: trimText(rawGroup.title) || group.title,
        links: group.links.map((link, linkIndex) => {
          const rawLink = rawLinks[linkIndex] || {}
          return {
            label: trimText(rawLink.label) || link.label,
            url: trimText(rawLink.url) || link.url,
            newTab: rawLink.newTab === undefined ? link.newTab : Boolean(rawLink.newTab)
          }
        })
      }
    }),
    copyrightText: trimText(rawConfig.copyrightText) || defaults.copyrightText
  }
}

export function resolveFooterAsset(url) {
  const value = trimText(url)
  if (!value) {
    return ''
  }
  if (value.startsWith(import.meta.env.VITE_APP_BASE_API) || isExternal(value)) {
    return value
  }
  return `${import.meta.env.VITE_APP_BASE_API}${value}`
}

export function hasFooterLink(url) {
  const value = trimText(url)
  return Boolean(value && value !== '#')
}

export function isExternalFooterLink(url) {
  return isExternal(trimText(url))
}
